"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, Gift, Heart, Sparkles } from "lucide-react";

const START_DATE = "2026-05-05T16:50:32";
const COUPLE_NAMES = "Enes & Efsa";

const SPECIAL_DAYS = [
  {
    title: "Enes'in doğum günü",
    dateLabel: "27 Mart",
    month: 2,
    day: 27,
    tone: "blue"
  },
  {
    title: "Efsa'nın doğum günü",
    dateLabel: "27 Nisan",
    month: 3,
    day: 27,
    tone: "pink"
  }
];

function getLoveTime(now = Date.now()) {
  const start = new Date(START_DATE).getTime();
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function getNextAnnualDate(month, day, now) {
  const current = new Date(now);
  const next = new Date(current.getFullYear(), month, day, 0, 0, 0, 0);

  if (next.getTime() <= now) {
    next.setFullYear(next.getFullYear() + 1);
  }

  return next;
}

function getCountdownParts(targetDate, now) {
  const diff = Math.max(0, targetDate.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { days, hours, minutes };
}

function getSpecialDayCountdowns(now) {
  return SPECIAL_DAYS.map((day) => {
    const nextDate = getNextAnnualDate(day.month, day.day, now);
    return {
      ...day,
      nextYear: nextDate.getFullYear(),
      countdown: getCountdownParts(nextDate, now)
    };
  });
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = useMemo(() => getLoveTime(now), [now]);
  const specialDays = useMemo(() => getSpecialDayCountdowns(now), [now]);

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
                Sadece ikimize ait küçük evren
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-normal text-gray-50 sm:text-6xl lg:text-7xl">
                {COUPLE_NAMES}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
                Seninle konuşabilecek kadar heybetli değildi belki kelimelerim; ama ruhunu yerinden sallayacak kadar derindi hissettiklerim.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 bg-smoke/70 px-5 py-7 sm:px-8 sm:py-10 lg:border-l lg:border-t-0 lg:px-10">
            <div className="flex h-full flex-col justify-center">
              <h2 className="text-3xl font-semibold text-gray-50 sm:text-4xl">
                Kaç gün oldu?
              </h2>

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

              <div className="mt-6 grid gap-3">
                {specialDays.map((day) => (
                  <div
                    key={day.title}
                    className="rounded-lg border border-white/10 bg-[#0d0f15]/62 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                          <Gift
                            size={16}
                            className={day.tone === "pink" ? "text-[#ffb3c7]" : "text-roseSoft"}
                          />
                          <span className="break-words">{day.title}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {day.dateLabel} {mounted ? day.nextYear : ""}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                        <div className="tabular-nums text-lg font-semibold text-gray-50">
                          {mounted ? day.countdown.days : 0}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">gün</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1">
                        {mounted ? day.countdown.hours : 0} saat
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1">
                        {mounted ? day.countdown.minutes : 0} dakika
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
