"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TextStats from "@/components/TextStats";

export default function NewQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function saveQuestion(event) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase bağlantısı yok. .env.local dosyasını kontrol edin.");
      return;
    }

    const value = question.trim();
    if (!value) {
      setMessage("Soru boş olamaz.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("couple_questions").insert({
      question: value
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/sorular");
  }

  return (
    <section className="page-shell max-w-4xl">
      <Link href="/sorular" className="ghost-action focus-ring mb-5">
        <ArrowLeft size={16} />
        Sorulara dön
      </Link>

      <form onSubmit={saveQuestion} className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6 sm:px-8">
          <div className="page-kicker">
            <CircleHelp size={15} className="text-roseDeep" />
            Yeni Soru
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-50 sm:text-4xl">
            Küçük bir soru bırak
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Soruyu kimin yazdığı önemli değil; ikiniz de birer kez cevaplayacaksınız.
          </p>
        </div>

        <div className="px-4 py-5 sm:px-8">
          <label className="block">
            <span className="text-sm text-gray-400">Soru</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={6}
              placeholder="Örn: En sevdiğin renk ne?"
              className="focus-ring mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] p-4 leading-7 text-gray-100 placeholder:text-gray-600"
            />
            <TextStats value={question} label="Soru" />
          </label>

          {message && <p className="mt-4 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{message}</p>}

          <button
            disabled={loading || !question.trim()}
            className="primary-action focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus size={18} />
            {loading ? "Ekleniyor" : "Soruyu Ekle"}
          </button>
        </div>
      </form>
    </section>
  );
}
