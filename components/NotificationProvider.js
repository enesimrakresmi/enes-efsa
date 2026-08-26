"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";

const NotificationContext = createContext({
  permission: "loading", // "default" | "granted" | "denied" | "unsupported" | "loading"
  supported: false,
  isStandalone: false,
  isIOS: false,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  enableNotifications: async () => {},
  sendTestNotification: async () => {},
  subscribing: false,
  testSending: false,
  testStatus: null
});

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

export function NotificationProvider({ children }) {
  const { displayName } = useAuth();
  const [permission, setPermission] = useState("loading");
  const [supported, setSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  // Check support & device capabilities
  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");
    setIsStandalone(Boolean(standalone));

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(Boolean(ios));

    const isNotificationSupported = "Notification" in window && "serviceWorker" in navigator;
    setSupported(isNotificationSupported);

    if (isNotificationSupported) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  }, []);

  // Register push subscription to backend
  const registerSubscription = useCallback(async () => {
    if (!displayName || typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      await navigator.serviceWorker.register("/sw.js").catch(() => {});
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return false;

      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAlias: displayName
        })
      });

      return res.ok;
    } catch (err) {
      console.warn("Push subscription error:", err);
      return false;
    }
  }, [displayName]);

  // Auto-sync subscription if already granted
  useEffect(() => {
    if (permission === "granted" && displayName && supported) {
      registerSubscription();
    }
  }, [permission, displayName, supported, registerSubscription]);

  // Request Notification Permission
  const enableNotifications = useCallback(async () => {
    if (typeof window === "undefined") return { ok: false, error: "Tarayıcı ortamı yok" };

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      if (isIOS && !isStandalone) {
        return {
          ok: false,
          needsPWA: true,
          error: "iPhone'da bildirimler için uygulamanın Ana Ekrana Eklenmesi gerekir."
        };
      }
      return { ok: false, error: "Tarayıcınız Web Push bildirimlerini desteklemiyor." };
    }

    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const syncSuccess = await registerSubscription();
        return { ok: true, sync: syncSuccess };
      } else if (perm === "denied") {
        return { ok: false, error: "Bildirim izni reddedildi. Tarayıcı ayarlarından izin verin." };
      } else {
        return { ok: false, error: "Bildirim izni onaylanmadı." };
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      return { ok: false, error: err.message || "İzin alınamadı." };
    } finally {
      setSubscribing(false);
    }
  }, [isIOS, isStandalone, registerSubscription]);

  // Send Test Notification
  const sendTestNotification = useCallback(async () => {
    if (!displayName) return { ok: false, error: "Kullanıcı girişi bulunamadı" };

    setTestSending(true);
    setTestStatus(null);
    try {
      // First ensure active subscription
      await registerSubscription();

      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUser: displayName,
          title: "EfEs • Test Bildirimi ✨",
          body: `Harika! ${displayName}, telefon bildirimlerin sorunsuz çalışıyor ❤️`,
          url: "/"
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus("success");
        return { ok: true };
      } else {
        setTestStatus("error");
        return { ok: false, error: data.error || "Bildirim gönderilemedi" };
      }
    } catch (err) {
      setTestStatus("error");
      return { ok: false, error: err.message };
    } finally {
      setTestSending(false);
    }
  }, [displayName, registerSubscription]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        supported,
        isStandalone,
        isIOS,
        isModalOpen,
        openModal,
        closeModal,
        enableNotifications,
        sendTestNotification,
        subscribing,
        testSending,
        testStatus
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
