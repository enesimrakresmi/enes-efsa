"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  LockKeyhole,
  Mail,
  Save,
  UsersRound,
  UserRound
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TextStats from "@/components/TextStats";

const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

function getPartner(author) {
  if (author === "Enes") return "Efsa";
  if (author === "Efsa") return "Enes";
  return "";
}

function toLocalDateValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function toLocalTimeValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(11, 16);
}

function getPresetDate(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function combineLocalDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  const date = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPreview(dateValue, timeValue) {
  const date = combineLocalDateTime(dateValue, timeValue);
  if (!date) return "Tarih ve saat seç";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

export default function NewLetterPage() {
  const router = useRouter();
  const initialOpenAt = useMemo(() => getPresetDate(1, 9, 0), []);
  const minDate = useMemo(() => toLocalDateValue(new Date()), []);

  const [pin, setPin] = useState("");
  const [author, setAuthor] = useState("");
  const [recipientMode, setRecipientMode] = useState("partner");
  const [form, setForm] = useState({
    title: "",
    content: "",
    open_date: toLocalDateValue(initialOpenAt),
    open_time: toLocalTimeValue(initialOpenAt)
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const recipient = recipientMode === "joint" ? "Ortak" : getPartner(author);
  const openPreview = formatPreview(form.open_date, form.open_time);

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];

    if (!user) {
      setMessage("Şifre yanlış.");
      return;
    }

    setAuthor(user);
    window.localStorage.setItem("letters-user", user);
    setPin("");
    setMessage("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function applyPreset(days, hour = 9, minute = 0) {
    const date = getPresetDate(days, hour, minute);
    setForm((current) => ({
      ...current,
      open_date: toLocalDateValue(date),
      open_time: toLocalTimeValue(date)
    }));
  }

  async function saveLetter(event) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase bağlantısı yok. .env.local dosyasını kontrol edin.");
      return;
    }

    if (!form.title.trim() || !form.content.trim() || !form.open_date || !form.open_time) {
      setMessage("Başlık, mektup, tarih ve saat zorunlu.");
      return;
    }

    const openAt = combineLocalDateTime(form.open_date, form.open_time);
    if (!openAt) {
      setMessage("Seçilen tarih veya saat geçerli değil.");
      return;
    }

    if (openAt.getTime() <= Date.now()) {
      setMessage("Bu bir gelecek mektubu. Lütfen şu andan daha ileri bir zaman seç.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("letters").insert({
      author,
      recipient,
      title: form.title.trim(),
      content: form.content.trim(),
      open_at: openAt.toISOString()
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/mektuplar");
  }

  if (!author) {
    return (
      <section className="page-shell flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="page-panel w-full p-6 sm:p-7">
          <Link href="/mektuplar" className="ghost-action focus-ring mb-6">
            <ArrowLeft size={16} />
            Mektuplara dön
          </Link>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-roseSoft/20 bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Mektup kilidi</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Her yeni mektupta kimin yazdığını netleştirmek için PIN gir.
          </p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {message && <p className="mt-3 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{message}</p>}
          <button className="primary-action focus-ring mt-5 w-full">Aç</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-shell max-w-5xl">
      <Link href="/mektuplar" className="ghost-action focus-ring mb-5">
        <ArrowLeft size={16} />
        Mektuplara dön
      </Link>

      <form onSubmit={saveLetter} className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6 sm:px-8">
          <div className="page-kicker">
            <Mail size={15} className="text-roseDeep" />
            Yeni Mektup
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-50 sm:text-4xl">
            Geleceğe bırak
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Yazan: {author} · Kime: {recipient}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-8">
          <div>
            <span className="text-sm text-gray-400">Bu mektup kime yazıldı?</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRecipientMode("partner")}
                className={`focus-ring rounded-lg border px-4 py-3 text-left transition ${
                  recipientMode === "partner"
                    ? "border-roseSoft/60 bg-roseSoft/15 text-gray-50"
                    : "border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-100"
                }`}
              >
                <UserRound size={17} className="mb-2" />
                <span className="block font-medium">Karşı tarafa</span>
                <span className="mt-1 block text-xs text-gray-500">{getPartner(author)} açabilsin.</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode("joint")}
                className={`focus-ring rounded-lg border px-4 py-3 text-left transition ${
                  recipientMode === "joint"
                    ? "border-roseSoft/60 bg-roseSoft/15 text-gray-50"
                    : "border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-100"
                }`}
              >
                <UsersRound size={18} className="mb-2" />
                <span className="block font-medium">Ortak okunacak</span>
                <span className="mt-1 block text-xs text-gray-500">İkiniz de zamanı gelince açabilirsiniz.</span>
              </button>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-sm text-gray-400">Başlık</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Örn: Bunu zamanı gelince oku"
              className="focus-ring mt-2 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-gray-100 placeholder:text-gray-600"
            />
            <TextStats value={form.title} label="Başlık" />
          </label>

          <section className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-sm font-medium text-gray-300">Ne zaman açılsın?</span>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Mektup sadece gelecekte seçtiğin zamanda açılır.
                </p>
              </div>
              <div className="rounded-lg border border-roseSoft/20 bg-roseSoft/10 px-3 py-2 text-sm text-roseSoft">
                {openPreview}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Yarın sabah", days: 1, hour: 9 },
                { label: "Yarın gece", days: 1, hour: 23 },
                { label: "1 hafta sonra", days: 7, hour: 20 },
                { label: "1 ay sonra", days: 30, hour: 20 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.days, preset.hour)}
                  className="focus-ring rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-sm text-gray-300 transition hover:border-roseSoft/45 hover:bg-roseSoft/10 hover:text-gray-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                  <CalendarDays size={14} />
                  Tarih
                </span>
                <input
                  value={form.open_date}
                  onChange={(event) => updateField("open_date", event.target.value)}
                  type="date"
                  min={minDate}
                  className="focus-ring h-11 w-full min-w-0 rounded-lg border border-white/10 bg-[#0d0f15] px-3 text-gray-100 [color-scheme:dark]"
                />
              </label>

              <label className="block rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                  <Clock3 size={14} />
                  Saat
                </span>
                <input
                  value={form.open_time}
                  onChange={(event) => updateField("open_time", event.target.value)}
                  type="time"
                  className="focus-ring h-11 w-full min-w-0 rounded-lg border border-white/10 bg-[#0d0f15] px-3 text-gray-100 [color-scheme:dark]"
                />
              </label>
            </div>
          </section>

          <label className="mt-5 block">
            <span className="text-sm text-gray-400">Mektup</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              placeholder="Bugünden geleceğe küçük bir şey bırak..."
              rows={14}
              className="focus-ring mt-2 min-h-[22rem] w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] p-4 leading-7 text-gray-100 placeholder:text-gray-600"
            />
            <TextStats value={form.content} label="Mektup" />
          </label>

          {message && <p className="mt-4 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{message}</p>}

          <button
            disabled={loading || !form.title.trim() || !form.content.trim()}
            className="primary-action focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Save size={18} />
            {loading ? "Kaydediliyor" : "Kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}
