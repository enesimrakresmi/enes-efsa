"use client";

import { useEffect, useState } from "react";
import { Bell, Sparkles, X, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNotification } from "@/components/NotificationProvider";

export default function PushAutoSubscribe() {
  const { displayName } = useAuth();
  const {
    permission,
    supported,
    isIOS,
    isStandalone,
    enableNotifications,
    openModal,
    subscribing
  } = useNotification();

  const [dismissed, setDismissed] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("efes-push-prompt-dismissed");
      if (isDismissed) {
        setDismissed(true);
      }
    } catch {}
  }, []);

  async function handleQuickEnable(e) {
    e.stopPropagation();
    if (isIOS && !isStandalone) {
      openModal();
      return;
    }

    const res = await enableNotifications();
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 2400);
    } else {
      openModal();
    }
  }

  function handleDismiss(e) {
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem("efes-push-prompt-dismissed", "1");
    } catch {}
  }

  // Only show the floating prompt if user is logged in, permission is default/not granted, and not dismissed
  if (
    !displayName ||
    permission === "granted" ||
    permission === "loading" ||
    dismissed
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Bildirim İzni"
      className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom,0px))] right-3.5 z-[60] flex animate-bounce-subtle items-center gap-2 rounded-2xl border border-amberGold/40 bg-[#161210]/95 p-1.5 pl-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all sm:bottom-6 sm:right-6 sm:pl-4"
    >
      <button
        type="button"
        onClick={handleQuickEnable}
        disabled={subscribing || success}
        className="flex items-center gap-2 font-serif text-xs font-medium text-amberGold-light transition hover:text-amberGold active:scale-95 disabled:opacity-80"
      >
        {success ? (
          <>
            <Check size={15} className="text-emerald-400" />
            <span className="text-emerald-300">Bildirimler Açıldı ✨</span>
          </>
        ) : (
          <>
            <Bell size={14} className={`text-amberGold ${subscribing ? "animate-spin" : "animate-pulse"}`} />
            <span>{subscribing ? "Açılıyor..." : "Bildirimleri Aç"}</span>
            <Sparkles size={12} className="text-amberGold/70" />
          </>
        )}
      </button>

      {!success && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-xl text-parchment-500 transition hover:bg-white/[0.08] hover:text-parchment-300"
          title="Kapat"
          aria-label="Kapat"
        >
          <X size={13} />
        </button>
      )}
    </aside>
  );
}
