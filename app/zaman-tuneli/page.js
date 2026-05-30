"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarHeart,
  ExternalLink,
  ImageIcon,
  MapPin,
  Music2,
  Plus,
  Sparkles,
  UserRound
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import EmojiText from "@/components/EmojiText";

const PAGE_SIZE = 8;

function formatMemoryDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function mergeUniqueItems(current, nextItems) {
  const existingIds = new Set(current.map((item) => item.id));
  return [...current, ...nextItems.filter((item) => !existingIds.has(item.id))];
}

function getAuthorClasses(author) {
  if (author === "Efsa") return "border-[#ff8aaa]/35 bg-[#ff8aaa]/14 text-[#ffb3c7]";
  return "border-black/70 bg-black/70 text-gray-100";
}

export default function TimelinePage() {
  const [memories, setMemories] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchMemories = useCallback(async ({ reset = false } = {}) => {
    if (!supabase) {
      setHasMore(false);
      setInitialLoaded(true);
      setLoading(false);
      setError("Supabase bağlantısı yok.");
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const nextPage = reset ? 0 : pageRef.current;
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("memories")
      .select("id, author, memory_date, title, description, image_url, location, mood, song, created_at")
      .order("memory_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    loadingRef.current = false;
    setLoading(false);
    setInitialLoaded(true);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const nextItems = data || [];
    setMemories((current) => (reset ? nextItems : mergeUniqueItems(current, nextItems)));
    pageRef.current = nextPage + 1;
    setHasMore(nextItems.length === PAGE_SIZE);
    setError("");
  }, []);

  useEffect(() => {
    fetchMemories({ reset: true });
  }, [fetchMemories]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("timeline-memories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memories" },
        () => {
          pageRef.current = 0;
          setHasMore(true);
          fetchMemories({ reset: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMemories]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || !initialLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchMemories();
      },
      { rootMargin: "520px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMemories, hasMore, initialLoaded]);

  return (
    <section className="page-shell">
      <div className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="page-kicker">
                <CalendarHeart size={15} className="text-roseDeep" />
                Zaman Tüneli
              </div>
            </div>

            <Link href="/zaman-tuneli/yeni" className="primary-action focus-ring w-full sm:w-auto">
              <Plus size={18} />
              Anı Ekle
            </Link>
          </div>
        </div>

        <div className="px-3 py-7 sm:px-8 lg:px-10">
          {error && (
            <p className="mb-6 break-words rounded-lg border border-roseSoft/20 bg-roseSoft/10 p-4 text-sm text-roseSoft [overflow-wrap:anywhere]">
              {error}
            </p>
          )}

          <div className="relative pl-3 sm:pl-12">
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-roseSoft via-white/16 to-transparent sm:left-5" />

            {!initialLoaded && (
              <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="soft-card h-48 animate-pulse" />
                ))}
              </div>
            )}

            {initialLoaded && memories.length === 0 && !error && (
              <div className="page-panel p-7 text-center">
                <ImageIcon className="mx-auto text-gray-600" size={32} />
                <p className="mt-3 text-gray-400">Henüz anı eklenmemiş.</p>
              </div>
            )}

            <div className="space-y-6 sm:space-y-9">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-8" />

            {loading && initialLoaded && (
              <p className="mt-5 text-center text-sm text-gray-500">Anılar yükleniyor...</p>
            )}

            {!hasMore && memories.length > 0 && (
              <p className="mt-5 text-center text-sm text-gray-600">Tüm anılar yüklendi.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MemoryCard({ memory }) {
  return (
    <article className="relative min-w-0 content-visibility-auto">
      <div className="hidden absolute -left-[2.65rem] top-5 h-7 w-7 items-center justify-center rounded-full border border-roseSoft/45 bg-night text-roseSoft shadow-glow sm:flex">
        <CalendarHeart size={15} />
      </div>

      <div className="page-panel min-w-0 overflow-hidden p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium text-roseSoft">
            {formatMemoryDate(memory.memory_date)}
          </div>
          <AuthorBadge author={memory.author} />
        </div>

        <h2 className="emoji-safe mt-3 break-words text-2xl font-semibold text-gray-50 [overflow-wrap:anywhere]">
          <EmojiText>{memory.title}</EmojiText>
        </h2>

        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
          <MemoryMeta icon={MapPin} value={memory.location} tone="blue" />
          <MemoryMeta icon={Sparkles} value={memory.mood} tone="pink" />
          <MemoryMeta icon={Music2} value={memory.song} tone="violet" />
        </div>

        <p className="emoji-safe mt-4 whitespace-pre-wrap break-words leading-7 text-gray-400 [overflow-wrap:anywhere]">
          <EmojiText>{memory.description}</EmojiText>
        </p>

        <MemoryImage url={memory.image_url} title={memory.title} />
      </div>
    </article>
  );
}

function AuthorBadge({ author }) {
  if (!author) return null;

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-3 py-1 text-xs ${getAuthorClasses(author)}`}>
      <UserRound size={13} className="shrink-0" />
      <span className="min-w-0 [overflow-wrap:anywhere]">{author}</span>
    </span>
  );
}

function MemoryMeta({ icon: Icon, value, tone }) {
  if (!value) return null;

  const tones = {
    blue: "border-roseSoft/35 bg-roseSoft/10 text-[#bcd0ff]",
    pink: "border-[#ff8aaa]/35 bg-[#ff8aaa]/10 text-[#ffb3c7]",
    violet: "border-[#b69cff]/35 bg-[#b69cff]/10 text-[#d9ccff]"
  };

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 break-words rounded-lg border px-3 py-1 text-xs [overflow-wrap:anywhere] ${tones[tone]}`}>
      <Icon size={13} className="shrink-0" />
      <span className="min-w-0 [overflow-wrap:anywhere]">{value}</span>
    </span>
  );
}

function MemoryImage({ url, title }) {
  const [failed, setFailed] = useState(false);
  const cleanUrl = typeof url === "string" ? url.trim() : "";

  if (!cleanUrl || failed) {
    if (!failed) return null;

    return (
      <div className="mt-5 flex min-h-36 w-full items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.03] text-gray-500">
        <div className="text-center">
          <ImageIcon className="mx-auto" size={28} />
          <a
            href={cleanUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-roseSoft underline-offset-4 hover:underline"
          >
            Fotoğrafı yeni sekmede aç
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <img
      src={cleanUrl}
      alt={title}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="mt-5 max-h-[34rem] w-full rounded-lg border border-white/10 bg-white/[0.03] object-contain"
    />
  );
}
