"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fingerprint, HeartHandshake, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const DISTANCE_TO_CONNECT = 0.055;
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
    pulse.classList.remove("connection-pulse-run");
    void pulse.offsetWidth;
    pulse.classList.add("connection-pulse-run");
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
      className="fixed inset-0 touch-none select-none overflow-hidden bg-night md:left-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,183,255,0.13),transparent_34rem)]" />

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-smoke/80 px-4 py-3 backdrop-blur-xl md:left-8 md:right-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
            <HeartHandshake size={20} />
          </div>
          <p className="text-sm font-medium text-gray-100">
            {connected ? "Bağlı" : "Bağlanıyor"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Radio size={16} className={partnerVisible ? "text-roseSoft" : "text-gray-600"} />
          {partnerVisible ? "Karşı taraf dokunuyor" : "Bekleniyor"}
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-semibold text-gray-100 sm:text-5xl">
          Dokun
        </h1>
      </div>

      <FingerVisual refEl={myFingerRef} mine />
      <FingerVisual refEl={partnerFingerRef} />
      <div ref={pulseRef} className="connection-pulse pointer-events-none absolute z-30" />
    </section>
  );
}

function FingerVisual({ refEl, mine = false }) {
  return (
    <div
      ref={refEl}
      className={`finger-visual pointer-events-none fixed left-0 top-0 z-10 flex h-24 w-24 items-center justify-center rounded-full opacity-0 ${
        mine
          ? "text-white/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.3)]"
          : "text-roseSoft drop-shadow-[0_0_30px_rgba(147,183,255,0.78)]"
      }`}
    >
      <div className="absolute inset-2 rounded-full border border-current opacity-10" />
      <div className="absolute inset-4 rounded-full bg-current opacity-10 blur-md" />
      <Fingerprint size={56} strokeWidth={1.7} />
    </div>
  );
}
