"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

export default function NewJournalPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = window.localStorage.getItem("journal-user");
    if (savedUser === "Enes" || savedUser === "Efsa") setAuthor(savedUser);
  }, []);

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];
    if (!user) {
      setError("Şifre yanlış.");
      return;
    }
    setAuthor(user);
    window.localStorage.setItem("journal-user", user);
    setPin("");
    setError("");
  }

  async function saveEntry(event) {
    event.preventDefault();
    if (!content.trim() || !supabase || !author) return;

    setLoading(true);
    const { error: insertError } = await supabase.from("posts").insert({
      author,
      content: content.trim()
    });
    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/gunluk");
  }

  if (!author) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="glass-panel w-full rounded-lg p-6">
          <Link href="/gunluk" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100">
            <ArrowLeft size={16} />
            Günlüğe dön
          </Link>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Günlük kilidi</h1>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {error && <p className="mt-3 text-sm text-roseSoft">{error}</p>}
          <button className="focus-ring mt-5 h-12 w-full rounded-lg bg-roseSoft font-medium text-night transition hover:bg-[#aac7ff]">
            Aç
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl py-6">
      <Link href="/gunluk" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100">
        <ArrowLeft size={16} />
        Günlüğe dön
      </Link>

      <form onSubmit={saveEntry} className="glass-panel rounded-lg p-5">
        <p className="text-sm uppercase tracking-[0.28em] text-roseSoft/80">
          Yeni Günlük
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-50">
          Bugünü yaz
        </h1>
        <p className="mt-2 text-sm text-gray-500">Yazan: {author}</p>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Uzun ya da kısa, ne istersen yaz..."
          rows={16}
          className="focus-ring mt-6 min-h-[26rem] w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] p-4 leading-7 text-gray-100 placeholder:text-gray-600"
        />

        {error && <p className="mt-4 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{error}</p>}

        <button
          disabled={loading || !content.trim()}
          className="focus-ring mt-5 inline-flex h-12 items-center gap-2 rounded-lg bg-roseSoft px-5 font-medium text-night transition hover:bg-[#aac7ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? "Kaydediliyor" : "Kaydet"}
        </button>
      </form>
    </section>
  );
}
