"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, Clock, Heart, Sparkles } from "lucide-react";

const START_DATE = "2026-05-05T16:50:32";
const COUPLE_NAMES = "Enes ♡ Efsa";

function getLoveTime() {
  const start = new Date(START_DATE).getTime();
  const now = Date.now();
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    setMounted(true);
    setTime(getLoveTime());
    const timer = setInterval(() => setTime(getLoveTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = useMemo(
    () => [
      { label: "Gün", value: time.days },
      { label: "Saat", value: time.hours },
      { label: "Dakika", value: time.minutes },
      { label: "Saniye", value: time.seconds }
    ],
    [time]
  );

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center py-3 md:min-h-[calc(100vh-3.5rem)]">
      <div className="home-surface relative w-full overflow-hidden rounded-lg border border-white/10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-roseDeep/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-roseSoft/50 to-transparent" />

        <div className="relative grid min-h-[72vh] gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-300">
                <Sparkles size={15} className="text-roseDeep" />
                Sadece ikimize ait
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-normal text-gray-50 sm:text-6xl lg:text-7xl">
                {COUPLE_NAMES}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
                Günün neresinde olursak olalım, burası ikimizin küçük ve sıcak alanı.
              </p>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-night/50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CalendarHeart size={17} className="text-roseSoft" />
                  Başlangıç
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-50">05.05.2026</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-night/50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Heart size={17} className="text-roseDeep" fill="currentColor" />
                  Not
                </div>
                <p className="mt-3 text-xl font-semibold text-gray-50">Kalp kalbe karşıdır.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-smoke/70 px-5 py-7 sm:px-8 sm:py-10 lg:border-l lg:border-t-0 lg:px-10">
            <div className="flex h-full flex-col justify-center">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-night/55 px-3 py-2 text-xs text-gray-400">
                    <Clock size={15} className="text-roseSoft" />
                    Canlı sayaç
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold text-gray-50 sm:text-4xl">
                    Aşk Sayacı
                  </h2>
                </div>
                <div className="hidden h-16 w-16 items-center justify-center rounded-lg border border-roseSoft/25 bg-roseSoft/10 text-roseSoft sm:flex">
                  <Heart size={30} fill="currentColor" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {units.map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-lg border border-white/10 bg-[#0d0f15]/78 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5"
                  >
                    <div className="break-words tabular-nums text-4xl font-semibold text-gray-50 sm:text-5xl">
                      {mounted
                        ? String(unit.value).padStart(unit.label === "Gün" ? 1 : 2, "0")
                        : unit.label === "Gün"
                          ? "0"
                          : "00"}
                    </div>
                    <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-roseDeep/15 bg-roseDeep/[0.06] p-4 text-sm leading-6 text-gray-300">
                Birlikte geçen zaman burada sessizce büyüyor; her saniye küçük bir anıya dönüşüyor.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
