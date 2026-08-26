"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Lock,
  Mail,
  MailOpen,
  PenLine
} from "lucide-react";
import Link from "next/link";
import SealedCountdown from "@/components/SealedCountdown";
import { useAuth } from "@/components/AuthProvider";

const PAGE_SIZE = 6;

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export default function LettersPage() {
  const { displayName } = useAuth();
  const [error, setError] = useState("");
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef(null);

  const fetchLetters = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const from = pageRef.current * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const res = await fetch(`/api/letters?from=${from}&to=${to}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error || "Mektuplar yüklenemedi.");
        loadingRef.current = false;
        setLoading(false);
        setInitialLoaded(true);
        return;
      }

      const nextLetters = json.data || [];
      setLetters((prev) => (pageRef.current === 0 ? nextLetters : [...prev, ...nextLetters]));
      pageRef.current += 1;

      const noMore = nextLetters.length < PAGE_SIZE;
      hasMoreRef.current = !noMore;
      setHasMore(!noMore);
      setInitialLoaded(true);
    } catch (err) {
      setError(err.message || "Bağlantı hatası.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (displayName) fetchLetters();
  }, [displayName, fetchLetters]);

  useEffect(() => {
    if (!initialLoaded) return;
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchLetters();
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchLetters, hasMore, initialLoaded]);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-start py-2 sm:py-6">
      {/* Header & Actions */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-3 pt-2 pb-5 sm:pt-4 sm:pb-6 border-b border-white/[0.06]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amberGold/10 blur-[90px]" />

        <div className="text-center sm:text-left">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-parchment-50 sm:text-5xl lg:text-6xl">
            Mühürlü Mektuplar
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/mektuplar/yeni"
            className="primary-action focus-ring shadow-lg active:scale-95 text-center shrink-0"
          >
            <PenLine size={16} />
            Yeni Mektup Yaz
          </Link>
        </div>
      </div>

      {/* Letters Stream */}
      <div className="mt-6 w-full">
        {error && (
          <p className="mb-6 break-words rounded-xl border border-dustyRose/30 bg-dustyRose/10 p-4 text-xs text-dustyRose-light sm:text-sm">
            {error}
          </p>
        )}

        {!initialLoaded && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="editorial-card h-56 animate-pulse" />
            ))}
          </div>
        )}

        {initialLoaded && letters.length === 0 && !error && (
          <div className="editorial-card p-10 text-center sm:p-16">
            <div className="wax-seal mx-auto mb-4 scale-110">
              <Mail size={18} />
            </div>
            <h3 className="font-serif text-xl font-medium text-parchment-100">
              Henüz mektup yazılmamış
            </h3>
            <p className="mt-1 font-serif text-sm italic text-parchment-400">
              Geleceğe ilk mektubunuzu yukarıdaki butondan mühürleyebilirsiniz.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {letters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              currentUser={displayName}
            />
          ))}
        </div>

        <div ref={sentinelRef} className="h-10" />

        {loading && initialLoaded && (
          <p className="mt-6 text-center font-serif text-sm italic text-amberGold animate-pulse">
            Daha fazla mektup yükleniyor...
          </p>
        )}

        {!hasMore && letters.length > 0 && (
          <p className="mt-10 text-center font-serif text-xs italic tracking-wider text-parchment-500">
            ✦ Tüm mektuplar listelendi ✦
          </p>
        )}
      </div>
    </section>
  );
}

function LetterCard({ letter, currentUser }) {
  const isTimeOpen = new Date(letter.open_at).getTime() <= Date.now();
  const canCurrentUserOpen = letter.recipient === "Ortak" || letter.recipient === currentUser;
  const shouldShowContent = isTimeOpen && canCurrentUserOpen && Boolean(letter.content);
  const isEfsa = letter.author === "Efsa";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        shouldShowContent
          ? isEfsa
            ? "border-dustyRose/25 bg-gradient-to-b from-[#211619]/90 to-[#120e10]/95 hover:border-dustyRose/40 hover:shadow-[0_12px_30px_rgba(212,122,136,0.15)]"
            : "border-amberGold/25 bg-gradient-to-b from-[#201815]/90 to-[#120f0d]/95 hover:border-amberGold/40 hover:shadow-[0_12px_30px_rgba(224,169,109,0.15)]"
          : "border-white/[0.08] bg-gradient-to-b from-[#181311]/90 to-[#0e0c0b]/95 hover:border-white/15"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-1.5 text-xs font-serif">
            <span className={isEfsa ? "font-semibold text-dustyRose-light" : "font-semibold text-amberGold"}>
              {letter.author}
            </span>
            <span className="text-parchment-500">→</span>
            <span className="text-parchment-300 italic">{letter.recipient}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-serif text-[10px] font-semibold uppercase tracking-wider ${
              shouldShowContent
                ? "border border-amberGold/30 bg-amberGold/15 text-amberGold-light"
                : "border border-dustyRose/30 bg-dustyRose/15 text-dustyRose-light"
            }`}
          >
            {shouldShowContent ? <MailOpen size={10} /> : <Lock size={10} />}
            {shouldShowContent ? "Mührü Açıldı" : "Mühürlü Zarf"}
          </span>
        </div>

        <h2 className="mt-3.5 font-serif text-xl font-normal leading-snug text-parchment-50 sm:text-2xl">
          {letter.title}
        </h2>

        {shouldShowContent ? (
          <div className="mt-3.5 rounded-xl border border-white/[0.06] bg-black/25 p-4">
            <p className="whitespace-pre-wrap font-serif text-xs leading-relaxed text-parchment-200 sm:text-sm">
              {letter.content}
            </p>
          </div>
        ) : (
          <SealedCountdown targetIso={letter.open_at} />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[11px] font-serif text-parchment-400">
        <span>Açılış: {formatDate(letter.open_at)}</span>
      </div>
    </article>
  );
}
