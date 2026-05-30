"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookHeart, LockKeyhole, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TextStats from "@/components/TextStats";

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
      <section className="page-shell flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="page-panel w-full p-6 sm:p-7">
          <Link href="/gunluk" className="ghost-action focus-ring mb-6">
            <ArrowLeft size={16} />
            Günlüğe dön
          </Link>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-roseSoft/20 bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Günlük kilidi</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Yazıyı kimin yazdığını belirlemek için PIN gir.
          </p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {error && <p className="mt-3 text-sm text-roseSoft">{error}</p>}
          <button className="primary-action focus-ring mt-5 w-full">Aç</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-shell max-w-5xl">
      <Link href="/gunluk" className="ghost-action focus-ring mb-5">
        <ArrowLeft size={16} />
        Günlüğe dön
      </Link>

      <form onSubmit={saveEntry} className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6 sm:px-8">
          <div className="page-kicker">
            <BookHeart size={15} className="text-roseDeep" />
            Yeni Günlük
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-50 sm:text-4xl">
            Bugünü yaz
          </h1>
          <p className="mt-3 text-sm text-gray-400">Yazan: {author}</p>
        </div>

        <div className="px-4 py-5 sm:px-8">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Uzun ya da kısa, ne istersen yaz..."
            rows={16}
            className="focus-ring min-h-[24rem] w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] p-4 leading-7 text-gray-100 placeholder:text-gray-600"
          />
          <TextStats value={content} label="Günlük" />

          {error && <p className="mt-4 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{error}</p>}

          <button
            disabled={loading || !content.trim()}
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
