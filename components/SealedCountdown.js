"use client";

import { useEffect, useState } from "react";

function formatCountdown(targetIso, now) {
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function SealedCountdown({ targetIso }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = formatCountdown(targetIso, now);

  return (
    <div className="mt-4 rounded-xl border border-dustyRose/20 bg-dustyRose/5 p-4 text-center">
      <div className="font-serif text-xs font-medium text-dustyRose-light">
        Mührün Kırılmasına Kalan Süre
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1 sm:gap-2">
        {[
          { label: "Gün", value: countdown.days },
          { label: "Saat", value: countdown.hours },
          { label: "Dk", value: countdown.minutes },
          { label: "Sn", value: countdown.seconds }
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-dustyRose/20 bg-black/30 py-1.5 text-center">
            <div className="font-serif text-base font-bold tabular-nums text-parchment-50 sm:text-lg">
              {String(c.value).padStart(2, "0")}
            </div>
            <div className="text-[8px] font-sans font-semibold uppercase text-dustyRose-light opacity-80">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
