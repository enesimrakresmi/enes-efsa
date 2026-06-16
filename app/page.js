"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, Gift, Heart, Sparkles } from "lucide-react";

const START_DATE = "2026-05-05T16:50:32";
const RELATIONSHIP_DATE = "2026-06-13T00:00:00";
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

const COUNT_UNITS = [
  { key: "days", label: "Gün" },
  { key: "hours", label: "Saat" },
  { key: "minutes", label: "Dakika" },
  { key: "seconds", label: "Saniye" }
];

function getElapsedTime(date, now = Date.now()) {
  const start = new Date(date).getTime();
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

function formatElapsedValue(value, unitKey, mounted) {
  if (!mounted) return unitKey === "days" ? "0" : "00";
  return String(value).padStart(unitKey === "days" ? 1 : 2, "0");
}

function TimeCard({ title, dateLabel, subtitle, time, tone, icon: Icon, mounted }) {
  const toneClasses =
    tone === "pink"
      ? {
          accent: "bg-[#ff8aaa]",
          border: "border-white/10 sm:border-[#ff8aaa]/24",
          glow: "from-[#ff8aaa]/10 via-transparent to-transparent sm:from-[#ff8aaa]/16",
          icon: "border-[#ff8aaa]/20 bg-[#ff8aaa]/8 text-[#ffb3c7] sm:border-[#ff8aaa]/30 sm:bg-[#ff8aaa]/12",
          ring: "sm:shadow-[0_0_42px_rgba(255,138,170,0.16)]",
          text: "text-[#ffb3c7]",
          tile: "border-[#ff8aaa]/14 bg-[#ff8aaa]/[0.045] sm:border-[#ff8aaa]/16 sm:bg-[#ff8aaa]/[0.055]"
        }
      : {
          accent: "bg-[#93b7ff]",
          border: "border-white/10 sm:border-[#93b7ff]/24",
          glow: "from-[#93b7ff]/10 via-transparent to-transparent sm:from-[#93b7ff]/16",
          icon: "border-[#93b7ff]/20 bg-[#93b7ff]/8 text-[#aac7ff] sm:border-[#93b7ff]/30 sm:bg-[#93b7ff]/12",
          ring: "sm:shadow-[0_0_42px_rgba(147,183,255,0.14)]",
          text: "text-[#aac7ff]",
          tile: "border-[#93b7ff]/14 bg-[#93b7ff]/[0.04] sm:border-[#93b7ff]/16 sm:bg-[#93b7ff]/[0.05]"
        };

  return (
    <article className={`soft-card relative overflow-hidden px-3 py-3 sm:p-5 ${toneClasses.border} ${toneClasses.ring}`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b sm:block ${toneClasses.glow}`} />
      <div className={`absolute left-0 top-5 hidden h-16 w-1 rounded-r-full sm:block ${toneClasses.accent}`} />

      <div className="relative grid grid-cols-[1fr_auto] items-center gap-2.5 sm:items-start sm:gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 ${toneClasses.icon}`}>
              <Icon size={15} className="sm:hidden" />
              <Icon size={18} className="hidden sm:block" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-[15px] font-semibold leading-tight text-gray-50 sm:text-2xl">
                {title}
              </h2>
              <p className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.04em] sm:mt-1 sm:text-xs sm:tracking-[0.16em] ${toneClasses.text}`}>
                {dateLabel}
              </p>
            </div>
          </div>

          {subtitle && (
            <p className="mt-2 hidden max-w-md text-sm leading-6 text-gray-400 sm:mt-4 sm:block">
              {subtitle}
            </p>
          )}
        </div>

        <div className="min-w-14 rounded-lg bg-white/[0.025] px-2.5 py-1.5 text-right sm:min-w-28 sm:border sm:border-white/10 sm:bg-black/20 sm:px-4 sm:py-3">
          <div className="tabular-nums text-xl font-semibold leading-none text-gray-50 sm:text-5xl">
            {formatElapsedValue(time.days, "days", mounted)}
          </div>
          <div className={`mt-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] sm:mt-2 sm:text-[10px] sm:tracking-[0.18em] ${toneClasses.text}`}>
            Gün
          </div>
        </div>
      </div>

      <div className="relative mt-2 flex flex-wrap gap-x-2.5 gap-y-0.5 border-t border-white/[0.06] pt-2 text-[11px] text-gray-500 sm:hidden">
        <span className="whitespace-nowrap">
          <strong className="font-semibold text-gray-100">{formatElapsedValue(time.hours, "hours", mounted)}</strong> saat
        </span>
        <span className="whitespace-nowrap">
          <strong className="font-semibold text-gray-100">{formatElapsedValue(time.minutes, "minutes", mounted)}</strong> dakika
        </span>
        <span className="whitespace-nowrap">
          <strong className="font-semibold text-gray-100">{formatElapsedValue(time.seconds, "seconds", mounted)}</strong> saniye
        </span>
      </div>

      <div className="relative mt-4 hidden grid-cols-3 gap-2 sm:grid">
        {COUNT_UNITS.filter((unit) => unit.key !== "days").map((unit) => (
          <div
            key={unit.key}
            className={`rounded-lg border px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:py-3 ${toneClasses.tile}`}
          >
            <div className="break-words tabular-nums text-xl font-semibold text-gray-50 sm:text-3xl">
              {formatElapsedValue(time[unit.key], unit.key, mounted)}
            </div>
            <div className="mt-2 text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:text-[10px]">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
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

  const firstTalkTime = useMemo(() => getElapsedTime(START_DATE, now), [now]);
  const relationshipTime = useMemo(() => getElapsedTime(RELATIONSHIP_DATE, now), [now]);
  const specialDays = useMemo(() => getSpecialDayCountdowns(now), [now]);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center py-2 md:min-h-[calc(100vh-3.5rem)] md:py-3">
      <div className="home-surface relative w-full overflow-hidden rounded-lg border border-white/10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-roseDeep/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-roseSoft/50 to-transparent" />

        <div className="relative grid min-h-[72vh] gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-between px-4 py-5 sm:px-8 sm:py-10 lg:px-12">
            <div>
              <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-gray-300 sm:text-xs sm:tracking-[0.18em]">
                <Sparkles size={14} className="text-roseDeep" />
                Sadece ikimize ait küçük evren
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal text-gray-50 sm:mt-7 sm:text-6xl lg:text-7xl">
                {COUPLE_NAMES}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:mt-5 sm:text-lg sm:leading-7">
                Seninle konuşabilecek kadar heybetli değildi belki kelimelerim; ama ruhunu yerinden sallayacak kadar derindi hissettiklerim.
              </p>
            </div>

            <div className="mt-10 hidden max-w-sm rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-gray-400 lg:block">
              <div className="mb-2 flex items-center gap-2 text-gray-200">
                <Heart size={16} className="text-roseSoft" fill="currentColor" />
                <span className="font-medium">İki ayrı tarih, aynı hikaye.</span>
              </div>
              İlk merhaba ve adını koyduğumuz gün, burada sessizce yaşamaya devam ediyor.
            </div>
          </div>

          <div className="border-t border-white/10 bg-smoke/60 px-4 py-4 sm:px-8 sm:py-8 lg:border-l lg:border-t-0 lg:px-10">
            <div className="grid h-full content-center gap-2.5 sm:gap-4">
              <div className="grid gap-2.5 sm:gap-4">
                <TimeCard
                  title="İlk konuşmamız"
                  dateLabel="5 Mayıs 2026"
                  time={firstTalkTime}
                  tone="blue"
                  icon={CalendarHeart}
                  mounted={mounted}
                />

                <TimeCard
                  title="Biz olduğumuz gün"
                  dateLabel="13 Haziran 2026"
                  time={relationshipTime}
                  tone="pink"
                  icon={Heart}
                  mounted={mounted}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                {specialDays.map((day) => (
                  <div
                    key={day.title}
                    className="rounded-lg border border-white/10 bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:bg-[#0d0f15]/60 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                          <Gift
                            size={15}
                            className={day.tone === "pink" ? "text-[#ffb3c7]" : "text-roseSoft"}
                          />
                          <span className="break-words">{day.title}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {day.dateLabel} {mounted ? day.nextYear : ""}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg bg-white/[0.035] px-3 py-2 text-right sm:border sm:border-white/10 sm:bg-white/[0.04]">
                        <div className="tabular-nums text-base font-semibold text-gray-50 sm:text-lg">
                          {mounted ? day.countdown.days : 0}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-gray-500 sm:text-[10px] sm:tracking-[0.18em]">gün</div>
                      </div>
                    </div>

                    <div className="mt-2 hidden flex-wrap gap-2 text-xs text-gray-400 sm:flex">
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
