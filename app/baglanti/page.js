"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fingerprint, Heart, HeartHandshake, Radio, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

const DISTANCE_TO_CONNECT = 0.07;
const BROADCAST_INTERVAL = 80;

function createSafeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getClientId() {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem("love-client-id");
  if (existing) return existing;
  const created = createSafeId();
  window.localStorage.setItem("love-client-id", created);
  return created;
}

function distance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.hypot(a.nx - b.nx, a.ny - b.ny);
}

function setFingerPosition(element, point) {
  if (!element || !point) return;
  element.style.transform = `translate3d(${point.nx * 100}vw, ${point.ny * 100}vh, 0) translate(-50%, -50%)`;
  element.style.opacity = point.touching ? "1" : "0";
}

export default function ConnectionPage() {
  const channelRef = useRef(null);
  const myFingerRef = useRef(null);
  const partnerFingerRef = useRef(null);
  const pulseRef = useRef(null);
  const myPointRef = useRef(null);
  const partnerPointRef = useRef(null);
  const pendingPointRef = useRef(null);
  const rafRef = useRef(null);
  const lastBroadcastAtRef = useRef(0);
  const lastPulseAtRef = useRef(0);
  const clientId = useMemo(() => getClientId(), []);
  const [connected, setConnected] = useState(false);
  const [partnerVisible, setPartnerVisible] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel("finger-connection", {
      config: {
        broadcast: {
          self: false
        }
      }
    });

    channel
      .on("broadcast", { event: "touch" }, ({ payload }) => {
        if (payload.clientId === clientId) return;

        const point = {
          nx: payload.nx,
          ny: payload.ny,
          touching: payload.touching
        };

        partnerPointRef.current = point;
        setFingerPosition(partnerFingerRef.current, point);
        setPartnerVisible(Boolean(point.touching));
        maybePulse();
      })
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    channelRef.current = channel;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  function maybePulse() {
    const mine = myPointRef.current;
    const partner = partnerPointRef.current;
    if (!mine?.touching || !partner?.touching) return;
    if (distance(mine, partner) > DISTANCE_TO_CONNECT) return;

    const now = Date.now();
    if (now - lastPulseAtRef.current < 1000) return;
    lastPulseAtRef.current = now;

    const pulse = pulseRef.current;
    if (!pulse) return;

    const nx = (mine.nx + partner.nx) / 2;
    const ny = (mine.ny + partner.ny) / 2;
    pulse.style.left = `${nx * 100}%`;
    pulse.style.top = `${ny * 100}%`;
    pulse.classList.remove("connection-burst-run");
    void pulse.offsetWidth;
    pulse.classList.add("connection-burst-run");
  }

  function sendPoint(point, force = false) {
    const now = Date.now();
    if (!force && now - lastBroadcastAtRef.current < BROADCAST_INTERVAL) return;

    lastBroadcastAtRef.current = now;
    channelRef.current?.send({
      type: "broadcast",
      event: "touch",
      payload: {
        clientId,
        nx: point.nx,
        ny: point.ny,
        touching: point.touching
      }
    });
  }

  function readPoint(event, touching = true) {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    return {
      nx: Math.min(1, Math.max(0, event.clientX / width)),
      ny: Math.min(1, Math.max(0, event.clientY / height)),
      touching
    };
  }

  function commitPendingPoint() {
    rafRef.current = null;
    const point = pendingPointRef.current;
    if (!point) return;

    myPointRef.current = point;
    setFingerPosition(myFingerRef.current, point);
    sendPoint(point);
    maybePulse();
  }

  function schedulePoint(point) {
    pendingPointRef.current = point;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(commitPendingPoint);
  }

  function handlePointerMove(event) {
    if (event.buttons !== 1 && event.pointerType === "mouse") return;
    schedulePoint(readPoint(event, true));
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = readPoint(event, true);
    pendingPointRef.current = point;
    myPointRef.current = point;
    setFingerPosition(myFingerRef.current, point);
    sendPoint(point, true);
    maybePulse();
  }

  function handlePointerUp(event) {
    const point = myPointRef.current
      ? { ...myPointRef.current, touching: false }
      : readPoint(event, false);

    pendingPointRef.current = point;
    myPointRef.current = point;
    setFingerPosition(myFingerRef.current, point);
    sendPoint(point, true);
  }

  return (
    <section
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="fixed inset-0 touch-none select-none overflow-hidden bg-[#0d0b0a] md:left-20"
    >
      {/* Background ambient lighting */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(224,169,109,0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(212,122,136,0.08),transparent_50%)]" />

      {/* Top Status Bar & Invite Button */}
      <div className="pointer-events-none absolute left-0 right-0 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-30 flex flex-col items-center gap-3 px-3 sm:px-6">
        {/* Status indicator */}
        <div className="flex items-center gap-2 rounded-full border border-amberGold/20 bg-[#15110f]/90 px-3.5 py-1.5 text-xs font-serif shadow-lg backdrop-blur-xl">
          <Radio size={13} className={partnerVisible ? "text-dustyRose animate-pulse" : "text-parchment-500"} />
          <span className={partnerVisible ? "text-dustyRose-light font-medium" : "text-parchment-400"}>
            {partnerVisible ? "Dokunuyor" : "Bekleniyor"}
          </span>
        </div>

        {/* Invite button - prominent placement */}
        <div className="pointer-events-auto">
          <TouchInviteButton />
        </div>
      </div>

      {/* Center Atmospheric Prompt */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-center px-4">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-parchment-50 sm:text-7xl">
          Ekrana Dokun
        </h1>
        <p className="mt-2 font-handwriting text-lg text-amberGold/70 sm:text-2xl">
          İki parmak buluştuğunda kalpler birleşir
        </p>
      </div>

      {/* Visual Fingerprints */}
      <FingerVisual refEl={myFingerRef} isMine />
      <FingerVisual refEl={partnerFingerRef} />

      {/* Golden & Rose Burst Animation Container */}
      <div ref={pulseRef} className="connection-burst pointer-events-none absolute z-30">
        <span className="connection-burst-core" />
        <span className="connection-burst-ring connection-burst-ring-one" />
        <span className="connection-burst-ring connection-burst-ring-two" />
        <span className="connection-heart connection-heart-one">♥</span>
        <span className="connection-heart connection-heart-two">♥</span>
        <span className="connection-heart connection-heart-three">♥</span>
        <span className="connection-heart connection-heart-four">♥</span>
        <span className="connection-spark connection-spark-one" />
        <span className="connection-spark connection-spark-two" />
        <span className="connection-spark connection-spark-three" />
      </div>
    </section>
  );
}

function FingerVisual({ refEl, isMine = false }) {
  return (
    <div
      ref={refEl}
      className={`finger-visual pointer-events-none fixed left-0 top-0 z-10 flex h-28 w-28 items-center justify-center rounded-2xl opacity-0 ${
        isMine
          ? "text-amberGold drop-shadow-[0_0_30px_rgba(224,169,109,0.8)]"
          : "text-dustyRose drop-shadow-[0_0_30px_rgba(212,122,136,0.85)]"
      }`}
    >
      <div className="absolute inset-2 rounded-2xl border border-current opacity-25 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute inset-4 rounded-2xl bg-current opacity-15 blur-md" />
      <Fingerprint size={68} strokeWidth={1.6} />
    </div>
  );
}

function TouchInviteButton() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { displayName, partner } = useAuth();

  async function sendInvite(e) {
    if (e) e.stopPropagation();
    setLoading(true);

    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUser: partner,
          senderUser: displayName,
          title: "EfEs • Canlı Bağlantı",
          body: `${displayName} seni Canlı Bağlantı ekranında bekliyor, ekrana dokun! ✨`,
          url: "/baglanti",
          tag: "touch-invite"
        })
      });
      setSent(true);
      setTimeout(() => setSent(false), 30000); // 30 sec visual reset
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); sendInvite(e); }}
      disabled={loading || sent}
      className="inline-flex items-center gap-2 rounded-2xl border border-amberGold/30 bg-[#161210]/95 px-5 py-2.5 font-serif text-sm font-medium text-amberGold-light shadow-xl backdrop-blur-xl transition hover:border-amberGold/60 hover:bg-amberGold/15 active:scale-95 disabled:opacity-60"
    >
      <Sparkles size={16} className={loading ? "animate-spin" : "text-amberGold"} />
      <span>{sent ? "Çağrı İletildi 🕊️" : loading ? "İletiliyor..." : "Çağrı Gönder"}</span>
    </button>
  );
}


