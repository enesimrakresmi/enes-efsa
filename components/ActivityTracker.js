"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = window.sessionStorage.getItem("keepsake_session_id");
  if (!sid) {
    sid = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    window.sessionStorage.setItem("keepsake_session_id", sid);
  }
  return sid;
}

export default function ActivityTracker() {
  const pathname = usePathname();
  const { displayName } = useAuth();
  const startTimeRef = useRef(Date.now());
  const lastSentRef = useRef(0);

  useEffect(() => {
    // Skip tracking for management dashboard itself and login page
    if (pathname?.startsWith("/yonetim") || pathname?.startsWith("/giris")) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    function sendTracking(force = false) {
      const now = Date.now();
      if (!force && now - lastSentRef.current < 8000) return;
      lastSentRef.current = now;

      const durationSeconds = Math.max(0, Math.floor((now - startTimeRef.current) / 1000));
      const userAlias = displayName || "Misafir";

      const payload = {
        sessionId,
        path: pathname || "/",
        duration: durationSeconds,
        userAlias
      };

      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      } catch {
        // Silent fail
      }
    }

    // Send immediately on page change
    sendTracking(true);

    // Heartbeat every 15 seconds
    const interval = setInterval(() => {
      sendTracking(false);
    }, 15000);

    // Register service worker if supported
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => clearInterval(interval);
  }, [pathname, displayName]);

  return null;
}
