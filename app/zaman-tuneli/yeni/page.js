"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  ImagePlus,
  Save,
  Sparkles,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TextStats from "@/components/TextStats";
import { useAuth } from "@/components/AuthProvider";



const MAX_PHOTO_SIZE = 18 * 1024 * 1024;
const DEFAULT_MAX_IMAGE_EDGE = 1600;
const LOW_MEMORY_MAX_IMAGE_EDGE = 1280;
const IMAGE_OUTPUTS = [
  { type: "image/webp", extension: "webp", quality: 0.82 },
  { type: "image/jpeg", extension: "jpg", quality: 0.84 }
];
const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif"
]);

function createSafeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getFileExtension(file) {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
  if (fromName && ACCEPTED_IMAGE_EXTENSIONS.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const fromType = file.type?.split("/").pop()?.toLowerCase();
  if (fromType && ACCEPTED_IMAGE_EXTENSIONS.has(fromType)) {
    return fromType === "jpeg" ? "jpg" : fromType;
  }

  return "jpg";
}

function getContentType(file) {
  if (file.type?.startsWith("image/")) return file.type;

  const extension = getFileExtension(file);
  const types = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif"
  };

  return types[extension] || "image/jpeg";
}

function canUseFileAsImage(file) {
  if (file.type?.startsWith("image/")) return true;
  return ACCEPTED_IMAGE_EXTENSIONS.has(getFileExtension(file));
}

async function loadImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fallback to Image element
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Fotoğraf okunamadı."));
    };

    image.src = objectUrl;
  });
}

function getMaxImageEdge(file) {
  const deviceMemory = navigator.deviceMemory || 4;
  const largeFile = file.size > 8 * 1024 * 1024;
  const lowMemoryDevice = deviceMemory <= 4;

  return largeFile || lowMemoryDevice ? LOW_MEMORY_MAX_IMAGE_EDGE : DEFAULT_MAX_IMAGE_EDGE;
}

function canvasToBlob(canvas, output) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`${output.type} çıktısı hazırlanamadı.`));
          return;
        }

        resolve(blob);
      },
      output.type,
      output.quality
    );
  });
}

async function compressImage(file) {
  const image = await loadImage(file);
  const longestEdge = Math.max(image.width, image.height);
  const scale = Math.min(1, getMaxImageEdge(file) / longestEdge);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotoğraf işleme alanı açılamadı.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  if (typeof image.close === "function") image.close();

  for (const output of IMAGE_OUTPUTS) {
    try {
      const blob = await canvasToBlob(canvas, output);
      canvas.width = 1;
      canvas.height = 1;
      return {
        blob,
        contentType: output.type,
        extension: output.extension
      };
    } catch {
      // Retry with alternative format
    }
  }

  canvas.width = 1;
  canvas.height = 1;
  throw new Error("Fotoğraf hazırlanamadı.");
}

async function cloneOriginalFile(file) {
  const contentType = getContentType(file);
  const buffer = await file.arrayBuffer();

  return {
    blob: new Blob([buffer], { type: contentType }),
    contentType,
    extension: getFileExtension(file)
  };
}

function getUploadErrorMessage(error) {
  const message = String(error?.message || error || "");

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Fotoğraf telefondan sunucuya gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.";
  }

  return message || "Fotoğraf yüklenemedi. Lütfen tekrar deneyin.";
}

export default function NewMemoryPage() {
  const router = useRouter();
  const { displayName: author, partner } = useAuth();
  const [form, setForm] = useState({
    memory_date: "",
    title: "",
    description: "",
    location: "",
    mood: "",
    song: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function choosePhoto(file) {
    if (!file) return;

    if (!canUseFileAsImage(file)) {
      setMessage("Lütfen sadece fotoğraf dosyası seçin.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setMessage("Fotoğraf 18 MB'dan küçük olmalı.");
      return;
    }

    setMessage("Fotoğraf hazırlanıyor...");

    try {
      const clonedPhoto = await cloneOriginalFile(file);

      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(clonedPhoto);
      setPhotoPreview(URL.createObjectURL(clonedPhoto.blob));
      setMessage("");
    } catch {
      setMessage("Fotoğraf telefondan okunamadı.");
    }
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview("");
    setMessage("");
  }

  async function uploadPhoto() {
    if (!photoFile) return null;

    let uploadPayload = photoFile;

    try {
      uploadPayload = await compressImage(photoFile.blob);
    } catch {
      uploadPayload = photoFile;
    }

    const path = `memories/${createSafeId()}.${uploadPayload.extension}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, uploadPayload.blob, {
        contentType: uploadPayload.contentType,
        cacheControl: "31536000",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data?.publicUrl || null;
  }

  async function addMemory(event) {
    event.preventDefault();

    if (!form.memory_date || !form.title.trim() || !form.description.trim()) {
      setMessage("Tarih, başlık ve anı metni zorunludur.");
      return;
    }

    setLoading(true);
    setMessage(photoFile ? "Fotoğraf yükleniyor ve kaydediliyor..." : "");

    try {
      const imageUrl = await uploadPhoto();

      const { error } = await supabase.from("memories").insert({
        author,
        memory_date: form.memory_date,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || null,
        mood: form.mood.trim() || null,
        song: form.song.trim() || null,
        image_url: imageUrl
      });

      if (error) throw error;

      // Send push notification to partner
      try {
        await fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUser: partner,
            senderUser: author,
            title: "EfEs • Yeni Hatıra ✨",
            body: `${author} yeni bir hatıra kaydetti 📸: ${form.title.trim()}`,
            url: "/zaman-tuneli",
            tag: "new-memory"
          })
        });
      } catch {
        // Ignore background push error
      }

      router.push("/zaman-tuneli");
    } catch (error) {
      setMessage(getUploadErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-start py-2 sm:py-6">
      <div className="mb-4">
        <Link href="/zaman-tuneli" className="ghost-action focus-ring inline-flex">
          <ArrowLeft size={16} />
          Zaman Tüneline Dön
        </Link>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-amberGold/20 bg-gradient-to-b from-[#1a1512]/95 via-[#13100e]/95 to-[#0e0c0b]/98 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amberGold/40 to-transparent" />

        <div className="border-b border-white/[0.06] pb-5">
          <h1 className="font-serif text-2xl font-normal text-parchment-50 sm:text-4xl">
            Hatıra Defterine Ekle
          </h1>
          <p className="mt-1 font-serif text-xs italic text-parchment-400 sm:text-sm">
            Tarih, başlık ve anı metni zorunludur. Dilerseniz fotoğraf, konum ve şarkı ekleyebilirsiniz.
          </p>
        </div>

        <form onSubmit={addMemory} className="pt-6 space-y-5">

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Anı Tarihi">
              <input
                value={form.memory_date}
                onChange={(event) => updateField("memory_date", event.target.value)}
                type="date"
                className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-3.5 font-serif text-sm text-parchment-100"
              />
            </Field>

            <Field label="Kaleme Alan">
              <input
                value={author}
                readOnly
                className="mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-amberGold/10 px-3.5 font-serif text-sm font-semibold text-amberGold"
              />
            </Field>
          </div>

          <Field label="Anı Başlığı">
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Örn: Yağmurlu günün ilk kahvesi"
              className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-4 font-serif text-base text-parchment-100 placeholder:text-parchment-500"
            />
            <TextStats value={form.title} label="Başlık" />
          </Field>

          <Field label="Anı Metni & Duygular">
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={7}
              placeholder="O günü, aklında kalan kokuyu, cümleyi ya da ikinize ait o küçük detayı yaz..."
              className="focus-ring mt-1.5 min-h-44 w-full resize-y rounded-xl border border-amberGold/20 bg-black/30 p-4 leading-relaxed text-parchment-100 placeholder:text-parchment-500"
            />
            <TextStats value={form.description} label="Anı" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Konum / Şehir">
              <input
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Örn: Galata, İstanbul"
                className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-3.5 text-sm text-parchment-100 placeholder:text-parchment-500"
              />
            </Field>

            <Field label="Ruh Hali">
              <input
                value={form.mood}
                onChange={(event) => updateField("mood", event.target.value)}
                placeholder="Örn: Huzurlu, heyecanlı"
                className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-3.5 text-sm text-parchment-100 placeholder:text-parchment-500"
              />
            </Field>

            <Field label="O An Çalan Şarkı">
              <input
                value={form.song}
                onChange={(event) => updateField("song", event.target.value)}
                placeholder="Örn: Yıldız Tilbe - Vazgeçtim"
                className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-3.5 text-sm text-parchment-100 placeholder:text-parchment-500"
              />
            </Field>
          </div>

          <div className="pt-2">
            <span className="font-serif text-sm text-parchment-300">Hatıra Fotoğrafı</span>
            <label className="focus-ring mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amberGold/30 bg-amberGold/5 p-6 text-center transition hover:border-amberGold/60 hover:bg-amberGold/10">
              <ImagePlus className="mb-3 text-amberGold" size={30} />
              <span className="font-serif text-sm font-medium text-parchment-100">
                Fotoğraf seç veya sürükle
              </span>
              <span className="mt-1 font-serif text-xs italic text-parchment-400">
                Oranı korunarak hatıra albümüne eklenir (En fazla 18 MB)
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => choosePhoto(event.target.files?.[0])}
              />
            </label>
          </div>

          {photoPreview && (
            <div className="polaroid-frame relative mt-4">
              <img
                src={photoPreview}
                alt="Seçilen anı fotoğrafı"
                className="max-h-[28rem] w-full rounded-md object-contain"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="focus-ring absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-parchment-100 backdrop-blur transition hover:bg-black"
                aria-label="Fotoğrafı kaldır"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {message && (
            <p className="font-serif text-sm italic text-amberGold">{message}</p>
          )}

          <div className="pt-4">
            <button
              disabled={loading}
              className="primary-action focus-ring w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Deftere Kaydediliyor..." : "Hatırayı Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="font-serif text-sm text-parchment-300">{label}</span>
      {children}
    </label>
  );
}
