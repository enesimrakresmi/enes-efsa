"use client";

import { Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-center py-2 sm:py-6">
      <div className="relative w-full overflow-hidden rounded-2xl border border-amberGold/20 bg-gradient-to-b from-[#1a1512]/95 via-[#13100e]/95 to-[#0e0c0b]/98 p-8 sm:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amberGold/40 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amberGold/10 blur-[100px]" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amberGold/30 bg-amberGold/15 text-amberGold shadow-[0_0_30px_rgba(224,169,109,0.25)] sm:h-20 sm:w-20">
          <Sparkles size={32} className="animate-pulse sm:size-10 text-amberGold" />
        </div>

        <h1 className="relative mt-6 font-serif text-4xl font-normal text-parchment-50 sm:text-6xl">
          Yeni Bir Proje
        </h1>

        <p className="relative mt-2 font-handwriting text-2xl text-amberGold sm:text-3xl">
          Çok Yakında
        </p>

        <p className="relative mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-parchment-400 sm:text-base">
          Bu alan ikimiz için yepyeni, sürpriz ve özel bir hatıra deneyimiyle yakında burada olacak.
        </p>

        <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-amberGold/20 bg-black/40 px-5 py-2 font-serif text-xs italic text-parchment-300">
          <span>✦ Hazırlık aşamasında ✦</span>
        </div>
      </div>
    </section>
  );
}
