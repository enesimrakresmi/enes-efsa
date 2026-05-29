"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  ImagePlus,
  LockKeyhole,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;
const IMAGE_QUALITY = 0.86;
const OUTPUT_TYPE = "image/webp";
const OUTPUT_EXTENSION = "webp";

function createSafeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

async function compressImage(file) {
  const image = await loadImage(file);
  const longestEdge = Math.max(image.width, image.height);
  const scale = Math.min(1, MAX_IMAGE_EDGE / longestEdge);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Fotoğraf hazırlanamadı."));
          return;
        }
        resolve(blob);
      },
      OUTPUT_TYPE,
      IMAGE_QUALITY
    );
  });
}

export default function NewMemoryPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [author, setAuthor] = useState("");
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

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];

    if (!user) {
      setMessage("Şifre yanlış. 3773 Efsa, 1453 Enes olarak açar.");
      return;
    }

    setAuthor(user);
    setPin("");
    setMessage("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function choosePhoto(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen sadece fotoğraf dosyası seçin.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setMessage("Fotoğraf 10 MB'dan küçük olmalı.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
  }

  async function uploadPhoto() {
    if (!photoFile) return null;

    setMessage("Fotoğraf hazırlanıyor...");
    const compressedPhoto = await compressImage(photoFile);
    const path = `${author.toLowerCase()}/${Date.now()}-${createSafeId()}.${OUTPUT_EXTENSION}`;

    setMessage("Fotoğraf yükleniyor...");
    const { error: uploadError } = await supabase.storage
      .from("memory-photos")
      .upload(path, compressedPhoto, {
        cacheControl: "3600",
        contentType: OUTPUT_TYPE,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("memory-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function addMemory(event) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase bağlantısı yok. .env.local dosyasını kontrol edin.");
      return;
    }

    if (!form.memory_date || !form.title.trim() || !form.description.trim()) {
      setMessage("Tarih, başlık ve anı metni zorunlu.");
      return;
    }

    setLoading(true);
    setMessage(photoFile ? "Fotoğraf hazırlanıyor..." : "");

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

      router.push("/zaman-tuneli");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!author) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="glass-panel w-full rounded-lg p-6">
          <Link
            href="/zaman-tuneli"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-100"
          >
            <ArrowLeft size={16} />
            Zaman tüneline dön
          </Link>

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Anı ekleme kilidi</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Anıyı kimin eklediğini bilmek için PIN gir.
          </p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {message && <p className="mt-3 text-sm text-roseSoft">{message}</p>}
          <button className="focus-ring mt-5 h-12 w-full rounded-lg bg-roseSoft font-medium text-night transition hover:bg-[#aac7ff]">
            Aç
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl py-6">
      <Link
        href="/zaman-tuneli"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-100"
      >
        <ArrowLeft size={16} />
        Zaman tüneline dön
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
          <CalendarPlus size={23} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-roseSoft/80">
            Yeni Anı
          </p>
          <h1 className="text-3xl font-semibold text-gray-50">
            Zaman tüneline ekle
          </h1>
        </div>
      </div>

      <form onSubmit={addMemory} className="glass-panel rounded-lg p-5">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <Field label="Tarih">
            <input
              value={form.memory_date}
              onChange={(event) => updateField("memory_date", event.target.value)}
              type="date"
              className="focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-gray-100"
            />
          </Field>

          <Field label="Ekleyen">
            <input
              value={author}
              readOnly
              className="mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-gray-400"
            />
          </Field>
        </div>

        <Field label="Başlık">
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Örn: İlk kahvemiz"
            className="focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-gray-100 placeholder:text-gray-600"
          />
        </Field>

        <Field label="Anı metni">
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={6}
            placeholder="O günü, aklında kalan kokuyu, cümleyi ya da küçük detayı yaz..."
            className="focus-ring mt-2 min-h-40 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-4 leading-7 text-gray-100 placeholder:text-gray-600"
          />
        </Field>

        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <Field label="Konum (isteğe bağlı)">
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Örn: Sahil"
              className="focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-gray-100 placeholder:text-gray-600"
            />
          </Field>

          <Field label="Ruh hali (isteğe bağlı)">
            <input
              value={form.mood}
              onChange={(event) => updateField("mood", event.target.value)}
              placeholder="Örn: Mutlu"
              className="focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-gray-100 placeholder:text-gray-600"
            />
          </Field>

          <Field label="Şarkı (isteğe bağlı)">
            <input
              value={form.song}
              onChange={(event) => updateField("song", event.target.value)}
              placeholder="Örn: Bizim şarkı"
              className="focus-ring mt-2 h-12 w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-gray-100 placeholder:text-gray-600"
            />
          </Field>
        </div>

        <div className="mt-4">
          <span className="text-sm text-gray-400">Fotoğraf</span>
          <label className="focus-ring mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/14 bg-white/[0.04] p-5 text-center transition hover:border-roseSoft/50 hover:bg-roseSoft/5">
            <ImagePlus className="mb-3 text-roseSoft" size={28} />
            <span className="text-sm font-medium text-gray-200">
              Bilgisayardan veya telefondan fotoğraf seç
            </span>
            <span className="mt-1 text-xs text-gray-500">
              Oranı korunur, WebP olarak hazırlanır. En fazla 10 MB.
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
          <div className="relative mt-4 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
            <img
              src={photoPreview}
              alt="Seçilen anı fotoğrafı"
              className="max-h-[30rem] w-full object-contain"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="focus-ring absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-night/80 text-gray-100 backdrop-blur transition hover:bg-night"
              aria-label="Fotoğrafı kaldır"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-roseSoft">{message}</p>}

        <button
          disabled={loading}
          className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-roseSoft px-5 font-medium text-night transition hover:bg-[#aac7ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? "Kaydediliyor" : "Kaydet"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="mt-4 block min-w-0">
      <span className="text-sm text-gray-400">{label}</span>
      {children}
    </label>
  );
}
