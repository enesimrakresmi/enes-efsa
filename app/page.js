"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Heart, Sparkles } from "lucide-react";

const START_DATE = "2026-05-05T16:50:32";
const COUPLE_NAMES = "Enes & Efsa";

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
    <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center overflow-hidden py-4 md:min-h-[calc(100vh-4rem)]">
      <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-roseSoft/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-0 h-56 w-56 rounded-full bg-[#ff8aaa]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <div className="relative grid w-full gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="text-center lg:text-left">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-gray-300 shadow-glow lg:mx-0">
            <Sparkles size={16} className="text-roseSoft" />
            Sadece ikimize ait küçük bir evren
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-normal text-gray-50 sm:text-6xl md:text-7xl">
            {COUPLE_NAMES}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 lg:mx-0">
            Gözlerin gözlerimin gözlediği yerleri gözleseydi, gözlerinle gözlerim göz göze gelirdi güzel gözlüm.
          </p>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-lg p-4 sm:p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-roseSoft/20" />
          <div className="absolute right-5 top-5 text-roseSoft/30">
            <Heart fill="currentColor" size={54} />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-night/50 px-3 py-1.5 text-xs text-gray-400">
            <Clock size={14} className="text-roseSoft" />
            Canlı sayaç
          </div>

          <p className="mt-5 text-sm uppercase tracking-[0.26em] text-roseSoft/80">
            Aşk Sayacı
          </p>
          <h2 className="mt-2 max-w-sm text-2xl font-semibold text-gray-50">
            Kalp kalbe karşıdır.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="rounded-lg border border-white/10 bg-night/60 px-3 py-5 text-center"
              >
                <div className="break-words tabular-nums text-4xl font-semibold text-gray-50 sm:text-5xl">
                  {mounted
                    ? String(unit.value).padStart(unit.label === "Gün" ? 1 : 2, "0")
                    : unit.label === "Gün"
                      ? "0"
                      : "00"}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
