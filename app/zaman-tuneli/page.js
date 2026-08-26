"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  ImageIcon,
  MapPin,
  Music2,
  Plus,
  Sparkles,
  UserRound
} from "lucide-react";
import Link from "next/link";
import EmojiText from "@/components/EmojiText";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 6;

function formatMemoryDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function TimelinePage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState("");

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef(null);

  const fetchMemories = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const from = pageRef.current * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError } = await supabase
      .from("memories")
      .select("id, author, memory_date, title, description, location, mood, song, image_url")
      .order("memory_date", { ascending: false })
      .range(from, to);

    if (fetchError) {
      setError(fetchError.message);
      loadingRef.current = false;
      setLoading(false);
      setInitialLoaded(true);
      return;
    }

    const nextMemories = data || [];
    setMemories((prev) => (pageRef.current === 0 ? nextMemories : [...prev, ...nextMemories]));
    pageRef.current += 1;

    const noMore = nextMemories.length < PAGE_SIZE;
    hasMoreRef.current = !noMore;
    setHasMore(!noMore);
    setInitialLoaded(true);

    loadingRef.current = false;
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    if (!initialLoaded) return;
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchMemories();
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMemories, hasMore, initialLoaded]);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-start py-2 sm:py-6">
      {/* 1. Header & Action */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-3 pt-2 pb-5 sm:pt-4 sm:pb-6 border-b border-white/[0.06]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amberGold/10 blur-[90px]" />

        <div className="text-center sm:text-left">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-parchment-50 sm:text-5xl lg:text-6xl">
            Zaman Tüneli
          </h1>
        </div>

        <Link
          href="/zaman-tuneli/yeni"
          className="primary-action focus-ring shadow-lg active:scale-95 text-center shrink-0"
        >
          <Plus size={17} />
          Yeni Hatıra Ekle
        </Link>
      </div>

      {/* 2. Content Stream */}
      <div className="mt-6 w-full">
        {error && (
          <p className="mb-6 break-words rounded-xl border border-dustyRose/30 bg-dustyRose/10 p-4 text-xs text-dustyRose-light sm:text-sm">
            {error}
          </p>
        )}

        {!initialLoaded && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="editorial-card h-64 animate-pulse" />
            ))}
          </div>
        )}

        {initialLoaded && memories.length === 0 && !error && (
          <div className="editorial-card p-10 text-center sm:p-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amberGold/20 bg-amberGold/5 text-amberGold sm:h-16 sm:w-16">
              <ImageIcon size={26} className="sm:size-8" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-medium text-parchment-100">
              Henüz anı eklenmemiş
            </h3>
            <p className="mt-1 font-serif text-sm italic text-parchment-400">
              İlk hatıranızı yukarıdaki butona tıklayarak ölümsüzleştirebilirsiniz.
            </p>
          </div>
        )}

        {/* 2-Column Responsive Editorial Grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>

        <div ref={sentinelRef} className="h-10" />

        {loading && initialLoaded && (
          <p className="mt-6 text-center font-serif text-sm italic text-amberGold animate-pulse">
            Daha fazla hatıra yükleniyor...
          </p>
        )}

        {!hasMore && memories.length > 0 && (
          <p className="mt-10 text-center font-serif text-xs italic tracking-wider text-parchment-500">
            ✦ Tüm hatıralar listelendi ✦
          </p>
        )}
      </div>
    </section>
  );
}

function MemoryCard({ memory }) {
  const isEfsa = memory.author === "Efsa";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${
        isEfsa
          ? "border-dustyRose/20 bg-gradient-to-b from-[#1f1517]/90 to-[#120e10]/95 hover:border-dustyRose/40 hover:shadow-[0_12px_30px_rgba(212,122,136,0.15)]"
          : "border-amberGold/20 bg-gradient-to-b from-[#1d1714]/90 to-[#120f0d]/95 hover:border-amberGold/40 hover:shadow-[0_12px_30px_rgba(224,169,109,0.15)]"
      }`}
    >
      <div>
        {/* Top Header: Date stamp + Author Badge */}
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
          <span className="font-serif text-xs italic tracking-wider text-parchment-300">
            {formatMemoryDate(memory.memory_date)}
          </span>
          <AuthorBadge author={memory.author} isEfsa={isEfsa} />
        </div>

        {/* Memory Photo */}
        {memory.image_url && (
          <MemoryImage url={memory.image_url} title={memory.title} />
        )}

        {/* Memory Title */}
        <h2 className="mt-3.5 font-serif text-xl font-normal leading-snug text-parchment-50 sm:text-2xl">
          <EmojiText>{memory.title}</EmojiText>
        </h2>

        {/* Metadata Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <MemoryMeta icon={MapPin} value={memory.location} tone="amber" />
          <MemoryMeta icon={Sparkles} value={memory.mood} tone="rose" />
          <MemoryMeta icon={Music2} value={memory.song} tone="parchment" />
        </div>

        {/* Memory Prose / Description */}
        <div className="mt-3">
          <p className="whitespace-pre-wrap font-serif text-xs leading-relaxed text-parchment-200 sm:text-sm">
            {memory.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function AuthorBadge({ author, isEfsa }) {
  if (!author) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-serif text-[11px] font-medium ${
        isEfsa
          ? "border-dustyRose/30 bg-dustyRose/15 text-dustyRose-light"
          : "border-amberGold/30 bg-amberGold/15 text-amberGold-light"
      }`}
    >
      <UserRound size={11} className="shrink-0" />
      <span>{author}</span>
    </span>
  );
}

function MemoryMeta({ icon: Icon, value, tone }) {
  if (!value) return null;

  const tones = {
    amber: "border-amberGold/25 bg-amberGold/10 text-amberGold-light",
    rose: "border-dustyRose/25 bg-dustyRose/10 text-dustyRose-light",
    parchment: "border-white/10 bg-white/[0.03] text-parchment-300"
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${tones[tone]}`}>
      <Icon size={11} className="shrink-0" />
      <span>{value}</span>
    </span>
  );
}

function MemoryImage({ url, title }) {
  const [failed, setFailed] = useState(false);
  const cleanUrl = typeof url === "string" ? url.trim() : "";

  if (!cleanUrl || failed) {
    if (!failed) return null;

    return (
      <div className="mt-3 flex min-h-28 w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 text-parchment-400">
        <div className="text-center p-3">
          <ImageIcon className="mx-auto text-parchment-500" size={20} />
          <a
            href={cleanUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-serif text-[11px] text-amberGold hover:underline"
          >
            Fotoğrafı aç
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
      <img
        src={cleanUrl}
        alt={title || "Hatıra fotoğrafı"}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="max-h-[24rem] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>
  );
}
