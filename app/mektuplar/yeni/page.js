"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  Save,
  UsersRound,
  UserRound
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TextStats from "@/components/TextStats";
import { useAuth } from "@/components/AuthProvider";

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
  const { displayName, partner } = useAuth();
  const author = displayName;
  const initialOpenAt = useMemo(() => getPresetDate(1, 9, 0), []);
  const minDate = useMemo(() => toLocalDateValue(new Date()), []);

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
      setMessage("Supabase bağlantısı yok. Lütfen bağlantınızı kontrol edin.");
      return;
    }

    if (!form.title.trim() || !form.content.trim() || !form.open_date || !form.open_time) {
      setMessage("Başlık, mektup içeriği, açılma tarihi ve saati zorunludur.");
      return;
    }

    const openAt = combineLocalDateTime(form.open_date, form.open_time);
    if (!openAt) {
      setMessage("Seçilen tarih veya saat geçerli değil.");
      return;
    }

    if (openAt.getTime() <= Date.now()) {
      setMessage("Bu bir gelecek mektubudur. Lütfen şu andan daha ileri bir zaman belirleyin.");
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

    // Send push notification to partner
    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUser: partner,
          senderUser: author,
          title: "EfEs • Mühürlü Mektup",
          body: `${author} sana mühürlü yeni bir mektup bıraktı 💌`,
          url: "/mektuplar",
          tag: "new-letter"
        })
      });
    } catch {
      // Ignore background push error
    }

    router.push("/mektuplar");
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-start py-2 sm:py-6">
      <div className="mb-4">
        <Link href="/mektuplar" className="ghost-action focus-ring inline-flex">
          <ArrowLeft size={16} />
          Mektuplara Dön
        </Link>
      </div>

      <form onSubmit={saveLetter} className="relative w-full overflow-hidden rounded-2xl border border-amberGold/20 bg-gradient-to-b from-[#1a1512]/95 via-[#13100e]/95 to-[#0e0c0b]/98 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amberGold/40 to-transparent" />

        <div className="border-b border-white/[0.06] pb-5">
          <h1 className="font-serif text-2xl font-normal text-parchment-50 sm:text-4xl">
            Mühürlü Mektup Yaz
          </h1>
          <p className="mt-1 font-serif text-xs italic text-parchment-400 sm:text-sm">
            Kilit açılış tarihini belirleyin; mektup o zamana kadar mühürlü kalacaktır.
          </p>
          <p className="mt-2 font-serif text-xs italic text-parchment-400">
            Yazan: <span className="text-amberGold font-semibold">{author}</span> • Kime: <span className="text-dustyRose-light font-semibold">{recipient}</span>
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          {/* Recipient Mode Selection */}
          <div>
            <span className="font-serif text-sm text-parchment-300">Bu mektubun alıcısı kim?</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRecipientMode("partner")}
                className={`focus-ring rounded-xl border p-4 text-left transition ${
                  recipientMode === "partner"
                    ? "border-amberGold/60 bg-amberGold/15 text-parchment-50 shadow-sm"
                    : "border-white/10 bg-black/20 text-parchment-400 hover:text-parchment-200"
                }`}
              >
                <div className="flex items-center gap-2 text-amberGold font-serif font-semibold">
                  <UserRound size={17} />
                  <span>{getPartner(author)} İçin</span>
                </div>
                <span className="mt-1 block font-serif text-xs italic text-parchment-400">
                  Sadece {getPartner(author)} zamanı gelince okuyabilsin.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientMode("joint")}
                className={`focus-ring rounded-xl border p-4 text-left transition ${
                  recipientMode === "joint"
                    ? "border-dustyRose/60 bg-dustyRose/15 text-parchment-50 shadow-sm"
                    : "border-white/10 bg-black/20 text-parchment-400 hover:text-parchment-200"
                }`}
              >
                <div className="flex items-center gap-2 text-dustyRose font-serif font-semibold">
                  <UsersRound size={17} />
                  <span>Ortak Mektup</span>
                </div>
                <span className="mt-1 block font-serif text-xs italic text-parchment-400">
                  Zamanı geldiğinde ikimiz birlikte okuyalım.
                </span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <span className="font-serif text-sm text-parchment-300">Mektup Başlığı</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Örn: 1. Yılımızda Açılacak Özel Not"
              className="focus-ring mt-1.5 h-12 w-full rounded-xl border border-amberGold/20 bg-black/30 px-4 font-serif text-base text-parchment-100 placeholder:text-parchment-500"
            />
            <TextStats value={form.title} label="Başlık" />
          </div>

          {/* Timing Section */}
          <section className="rounded-xl border border-amberGold/20 bg-black/30 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-serif text-sm font-semibold text-parchment-100">
                  Mühür Ne Zaman Kırılsın?
                </span>
                <p className="mt-0.5 font-serif text-xs italic text-parchment-400">
                  Mektup bu zamana kadar kesinlikle kilitli ve mühürlü kalacaktır.
                </p>
              </div>
              <div className="rounded-xl border border-amberGold/30 bg-amberGold/15 px-3.5 py-1.5 font-serif text-xs font-semibold text-amberGold">
                {openPreview}
              </div>
            </div>

            {/* Timing Presets */}
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
                  className="focus-ring rounded-lg border border-white/10 bg-white/[0.03] p-2.5 font-serif text-xs text-parchment-300 transition hover:border-amberGold/40 hover:bg-amberGold/10 hover:text-parchment-100"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date / Time inputs */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="mb-1.5 flex items-center gap-1.5 font-serif text-xs font-medium text-parchment-400">
                  <CalendarDays size={14} className="text-amberGold" />
                  Açılış Tarihi
                </span>
                <input
                  value={form.open_date}
                  onChange={(event) => updateField("open_date", event.target.value)}
                  type="date"
                  min={minDate}
                  className="focus-ring h-10 w-full rounded-lg border border-amberGold/15 bg-black/40 px-3 font-serif text-sm text-parchment-100"
                />
              </label>

              <label className="block rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="mb-1.5 flex items-center gap-1.5 font-serif text-xs font-medium text-parchment-400">
                  <Clock3 size={14} className="text-amberGold" />
                  Açılış Saati
                </span>
                <input
                  value={form.open_time}
                  onChange={(event) => updateField("open_time", event.target.value)}
                  type="time"
                  className="focus-ring h-10 w-full rounded-lg border border-amberGold/15 bg-black/40 px-3 font-serif text-sm text-parchment-100"
                />
              </label>
            </div>
          </section>

          {/* Letter Content */}
          <div>
            <span className="font-serif text-sm text-parchment-300">Mektup Metni</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              placeholder="Bugünden o güne bir duygu, bir temenni, sana dair hissettiklerim..."
              rows={14}
              className="focus-ring mt-1.5 min-h-[22rem] w-full resize-y rounded-xl border border-amberGold/20 bg-black/30 p-4 font-serif leading-relaxed text-parchment-100 placeholder:text-parchment-500"
            />
            <TextStats value={form.content} label="Mektup" />
          </div>

          {message && (
            <p className="font-serif text-sm italic text-dustyRose">{message}</p>
          )}

          <div className="pt-2">
            <button
              disabled={loading || !form.title.trim() || !form.content.trim()}
              className="primary-action focus-ring w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Mektup Mühürleniyor..." : "Zarfı Mühürle & Sakla"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
