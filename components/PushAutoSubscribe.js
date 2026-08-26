"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Sparkles, X, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushAutoSubscribe() {
  const { displayName } = useAuth();
  const [permission, setPermission] = useState("granted");
  const [supported, setSupported] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const registerSubscription = useCallback(async () => {
    if (!displayName) return;
    try {
      await navigator.serviceWorker.register("/sw.js").catch(() => {});
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAlias: displayName
        })
      });
    } catch {
      // Ignore background sync errors
    }
  }, [displayName]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    setSupported(true);
    const currentPerm = Notification.permission;
    setPermission(currentPerm);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("efes-push-prompt-dismissed");
    if (isDismissed) {
      setDismissed(true);
    }

    // Auto-sync if already granted
    if (currentPerm === "granted" && displayName) {
      registerSubscription();
    }
  }, [displayName, registerSubscription]);

  async function handleEnablePush() {
    if (!supported) return;
    setLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        await registerSubscription();
        setSuccess(true);
        setTimeout(() => {
          setDismissed(true);
        }, 2200);
      } else {
        setDismissed(true);
      }
    } catch {
      setDismissed(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss(e) {
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem("efes-push-prompt-dismissed", "1");
    } catch {}
  }

  // If not supported, already granted, denied, dismissed or not logged in, render nothing
  if (!supported || permission !== "default" || dismissed || !displayName) {
    return null;
  }

  return (
    <aside
      aria-label="Bildirim İzni"
      className="fixed bottom-[4.75rem] right-3.5 z-40 flex animate-bounce-subtle items-center gap-2 rounded-2xl border border-amberGold/30 bg-[#161210]/95 p-1.5 pl-3 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition sm:bottom-6 sm:right-6 sm:pl-3.5"
    >
      <button
        type="button"
        onClick={handleEnablePush}
        disabled={loading || success}
        className="flex items-center gap-2 font-serif text-xs font-medium text-amberGold-light transition hover:text-amberGold active:scale-95 disabled:opacity-80"
      >
        {success ? (
          <>
            <Check size={15} className="text-emerald-400" />
            <span className="text-emerald-300">Bildirimler Açıldı ✨</span>
          </>
        ) : (
          <>
            <Bell size={14} className={`text-amberGold ${loading ? "animate-spin" : "animate-pulse"}`} />
            <span>{loading ? "Açılıyor..." : "Bildirimleri Aç"}</span>
            <Sparkles size={12} className="text-amberGold/70" />
          </>
        )}
      </button>

      {!success && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-xl text-parchment-500 transition hover:bg-white/[0.06] hover:text-parchment-300"
          title="Kapat"
          aria-label="Kapat"
        >
          <X size={13} />
        </button>
      )}
    </aside>
  );
}
