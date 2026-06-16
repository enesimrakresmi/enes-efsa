"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Clock, Heart, HeartHandshake, Mail } from "lucide-react";

const items = [
  { href: "/", label: "Ana Sayfa", shortLabel: "Ana", icon: Heart },
  { href: "/zaman-tuneli", label: "Zaman Tüneli", shortLabel: "Anılar", icon: Clock },
  { href: "/gunluk", label: "Ortak Günlük", shortLabel: "Günlük", icon: BookHeart },
  { href: "/mektuplar", label: "Gizli Mektuplar", shortLabel: "Mektup", icon: Mail },
  { href: "/baglanti", label: "Canlı Bağlantı", shortLabel: "Bağ", icon: HeartHandshake }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-3 left-2 right-2 z-50 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 rounded-lg border border-white/10 bg-[#101219] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
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
                className={`focus-ring relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[8px] font-semibold transition ${
                  active
                    ? "bg-[#1b2230] text-gray-50"
                    : "text-gray-500 hover:bg-[#151922] hover:text-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-1 w-1 rounded-full transition ${
                    active ? "bg-roseSoft opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
                <Icon
                  size={19}
                  strokeWidth={active ? 2.35 : 1.8}
                  className={`shrink-0 transition ${
                    active ? "text-roseSoft" : "text-current"
                  }`}
                />
                <span className="w-full truncate px-0.5 text-center">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-24 border-r border-white/10 bg-[#0b0c10] md:block">
        <div className="flex h-full flex-col items-center py-6">
          <Link
            href="/"
            aria-label="Ana Sayfa"
            className="focus-ring flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#151922] text-roseSoft"
          >
            <Heart size={23} fill="currentColor" />
          </Link>

          <div className="mt-12 flex flex-1 flex-col items-center gap-3">
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
                  className={`focus-ring group relative flex h-14 w-14 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-[#1b2230] text-gray-50"
                      : "text-gray-500 hover:bg-[#151922] hover:text-gray-200"
                  }`}
                >
                  <span
                    className={`absolute -left-5 h-7 w-1 rounded-r-full transition ${
                      active ? "bg-roseSoft opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon
                    size={23}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-roseSoft" : "text-current"}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
