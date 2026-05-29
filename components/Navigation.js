"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Clock, Heart, HeartHandshake } from "lucide-react";

const items = [
  { href: "/", label: "Ana Sayfa", shortLabel: "Ana", icon: Heart },
  { href: "/zaman-tuneli", label: "Zaman Tüneli", shortLabel: "Anılar", icon: Clock },
  { href: "/gunluk", label: "Ortak Günlük", shortLabel: "Günlük", icon: BookHeart },
  { href: "/baglanti", label: "Canlı Bağlantı", shortLabel: "Bağ", icon: HeartHandshake }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-night/94 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:bottom-auto md:top-0 md:h-screen md:w-24 md:border-r md:border-t-0 md:px-0 md:py-6">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 md:flex md:h-full md:flex-col md:items-center md:justify-center md:gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={`focus-ring group flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 text-[10px] font-medium transition md:h-16 md:w-16 md:px-0 ${
                active
                  ? "border-roseSoft/50 bg-roseSoft/12 text-roseSoft shadow-glow"
                  : "border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-gray-100"
              }`}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 1.8}
                className="shrink-0 transition group-hover:scale-105 md:h-6 md:w-6"
              />
              <span className="w-full truncate text-center md:hidden">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
