"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Heart, HeartHandshake, LogOut, Mail, Sparkles, Bell } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNotification } from "@/components/NotificationProvider";

const items = [
  { href: "/", label: "Ana Sayfa", icon: Heart },
  { href: "/zaman-tuneli", label: "Zaman Tüneli", icon: Clock },
  { href: "/gunluk", label: "Yeni Proje", icon: Sparkles },
  { href: "/mektuplar", label: "Mühürlü Mektuplar", icon: Mail },
  { href: "/baglanti", label: "Canlı Bağlantı", icon: HeartHandshake }
];

export default function Navigation() {
  const pathname = usePathname();
  const { displayName, logout, loading } = useAuth();
  const { permission, openModal } = useNotification();

  // Don't show navigation on login page or while loading
  if (pathname === "/giris" || loading || !displayName) return null;

  const isGranted = permission === "granted";

  return (
    <>
      {/* Mobile Floating Bottom Dock (Icons Only) */}
      <nav className="fixed bottom-[calc(0.6rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-50 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center rounded-2xl border border-amberGold/25 bg-[#14100e]/95 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur-xl">
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
                className={`focus-ring relative flex h-12 min-w-0 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 ${
                  active
                    ? "bg-amberGold/20 text-amberGold shadow-[inset_0_1px_0_rgba(247,215,170,0.25)] font-semibold"
                    : "text-parchment-400 hover:bg-white/[0.04] hover:text-parchment-200"
                }`}
              >
                {active && (
                  <span className="absolute top-1 h-1 w-2.5 rounded-full bg-amberGold shadow-[0_0_8px_#e0a96d]" />
                )}
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`shrink-0 transition-transform duration-200 ${
                    active ? "scale-110 text-amberGold" : "text-current"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Left Sidebar Dock (Icons Only) */}
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-20 border-r border-amberGold/15 bg-[#120f0e]/95 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col items-center py-7">
          {/* Logo / Brand Crest */}
          <Link
            href="/"
            aria-label="Enes & Efsa"
            className="focus-ring group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-amberGold/30 bg-[#15110f] shadow-[0_4px_16px_rgba(224,169,109,0.2)] transition-all duration-300 hover:scale-105 hover:border-amberGold/50"
          >
            <img
              src="/icon.png"
              alt="Efes Logo"
              className="h-10 w-10 object-contain rounded-lg transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          {/* Navigation Links */}
          <div className="mt-14 flex flex-1 flex-col items-center gap-4">
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
                  className={`focus-ring group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                    active
                      ? "border border-amberGold/30 bg-amberGold/15 text-amberGold shadow-[0_0_20px_rgba(224,169,109,0.2)]"
                      : "text-parchment-400 hover:bg-white/[0.04] hover:text-parchment-100"
                  }`}
                >
                  <span
                    className={`absolute -left-3.5 h-6 w-1 rounded-r-full bg-amberGold shadow-[0_0_10px_#e0a96d] transition-opacity duration-200 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      active ? "text-amberGold" : "text-current"
                    }`}
                  />

                  {/* Tooltip on Desktop Hover */}
                  <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md border border-amberGold/20 bg-[#1c1816] px-2.5 py-1 text-xs font-medium text-parchment-100 opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Bottom: Notification Button, User & Logout */}
          <div className="flex flex-col items-center gap-3">
            {/* Notification Button */}
            <button
              type="button"
              onClick={openModal}
              aria-label="Bildirim İzni ve Ayarları"
              title={isGranted ? "Bildirimler Aktif" : "Bildirime İzin Ver"}
              className={`focus-ring group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                isGranted
                  ? "border-amberGold/20 bg-amberGold/10 text-amberGold hover:bg-amberGold/20"
                  : "border-amberGold/40 bg-amberGold/15 text-amberGold shadow-[0_0_12px_rgba(224,169,109,0.25)] animate-pulse"
              }`}
            >
              <Bell size={18} />
              <span
                className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#120f0e] ${
                  isGranted ? "bg-emerald-400" : "bg-amberGold"
                }`}
              />

              <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md border border-amberGold/20 bg-[#1c1816] px-2.5 py-1 text-xs font-medium text-parchment-100 opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                {isGranted ? "Bildirimler Açık ✨" : "Bildirim İzni Ver 🔔"}
              </span>
            </button>

            {/* Current User Badge */}
            <div className="flex h-8 items-center justify-center rounded-full border border-amberGold/25 bg-amberGold/10 px-3">
              <span className="font-serif text-[10px] font-semibold text-amberGold">{displayName}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              aria-label="Çıkış Yap"
              title="Çıkış Yap"
              className="focus-ring group relative flex h-10 w-10 items-center justify-center rounded-xl text-parchment-500 transition-all duration-200 hover:bg-dustyRose/15 hover:text-dustyRose"
            >
              <LogOut size={18} strokeWidth={1.8} className="transition-transform duration-200 group-hover:scale-110" />

              <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md border border-dustyRose/20 bg-[#1c1816] px-2.5 py-1 text-xs font-medium text-parchment-100 opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                Çıkış Yap
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
