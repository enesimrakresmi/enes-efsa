"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, Gift, Heart } from "lucide-react";

const START_DATE = "2026-05-05T16:50:32";
const RELATIONSHIP_DATE = "2026-06-13T00:00:00";

const SPECIAL_DAYS = [
  {
    name: "Enes",
    title: "Enes'in Doğum Günü",
    dateLabel: "27 Mart",
    month: 2,
    day: 27,
    tone: "amber"
  },
  {
    name: "Efsa",
    title: "Efsa'nın Doğum Günü",
    dateLabel: "27 Nisan",
    month: 3,
    day: 27,
    tone: "rose"
  }
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

function formatElapsed(value, mounted) {
  if (!mounted) return "00";
  return String(value).padStart(2, "0");
}

export default function RelationshipChronometer() {
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
    <div className="relative w-full overflow-hidden rounded-2xl border border-amberGold/20 bg-gradient-to-b from-[#1a1512]/95 via-[#13100e]/95 to-[#0e0c0b]/98 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
      {/* Subtle decorative gold highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amberGold/40 to-transparent" />

      {/* Header Dates info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        {/* Main Relationship Milestone */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-dustyRose/30 bg-dustyRose/15 text-dustyRose">
            <Heart size={16} fill="currentColor" />
          </div>
          <div>
            <h2 className="font-serif text-base font-medium text-parchment-50 sm:text-lg">
              Biz Olduğumuz Gün
            </h2>
            <p className="font-serif text-xs italic text-parchment-400">
              13 Haziran 2026 • 00:00
            </p>
          </div>
        </div>

        {/* First Talk Origin Tag */}
        <div className="flex items-center gap-2 rounded-xl border border-amberGold/20 bg-black/30 px-3.5 py-1.5 text-xs font-serif">
          <CalendarHeart size={14} className="text-amberGold" />
          <span className="text-parchment-400">
            İlk Merhaba: <strong className="font-semibold text-amberGold-light">5 Mayıs 2026</strong> ({mounted ? firstTalkTime.days : 0}. gün)
          </span>
        </div>
      </div>

      {/* 4-Pillar Chronometer Counter */}
      <div className="mt-5 grid grid-cols-4 gap-2 sm:mt-6 sm:gap-4">
        {[
          { label: "GÜN", value: relationshipTime.days, key: "days" },
          { label: "SAAT", value: relationshipTime.hours, key: "hours" },
          { label: "DAKİKA", value: relationshipTime.minutes, key: "minutes" },
          { label: "SANİYE", value: relationshipTime.seconds, key: "seconds" }
        ].map((unit) => (
          <div
            key={unit.key}
            className={`flex flex-col items-center justify-center rounded-xl border py-4 sm:py-7 lg:py-8 ${
              unit.key === "days"
                ? "border-dustyRose/30 bg-dustyRose/10"
                : "border-white/[0.07] bg-black/40"
            }`}
          >
            <span
              className={`font-serif text-3xl font-bold tabular-nums leading-none tracking-tight sm:text-5xl lg:text-6xl ${
                unit.key === "days"
                  ? "text-dustyRose-light"
                  : "text-parchment-50"
              }`}
            >
              {formatElapsed(unit.value, mounted)}
            </span>
            <span className="mt-2 font-sans text-[9px] font-bold tracking-widest text-parchment-400 uppercase sm:text-xs">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Milestone / Birthday Strip */}
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 border-t border-white/[0.06] pt-4">
        {specialDays.map((day) => {
          const isRose = day.tone === "rose";

          return (
            <div
              key={day.title}
              className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <Gift size={15} className={isRose ? "text-dustyRose" : "text-amberGold"} />
                <div>
                  <span className="font-serif text-sm font-medium text-parchment-200">
                    {day.title}
                  </span>
                  <span className="ml-2 font-serif text-xs italic text-parchment-400">
                    ({day.dateLabel})
                  </span>
                </div>
              </div>

              <div className="font-serif text-xs italic font-semibold text-amberGold-light">
                {mounted ? day.countdown.days : 0} gün kaldı
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
