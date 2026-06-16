"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LockKeyhole, LogOut, Mail, PenLine, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ExpandableText from "@/components/ExpandableText";

const PAGE_SIZE = 8;
const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

function mergeUniqueItems(current, nextItems) {
  const existingIds = new Set(current.map((item) => item.id));
  return [...current, ...nextItems.filter((item) => !existingIds.has(item.id))];
}

function formatCountdown(value, now) {
  const target = new Date(value).getTime();
  const diff = Math.max(0, target - now);

  if (diff <= 0) return "Açılabilir";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat ${minutes} dk`;
  if (minutes > 0) return `${minutes} dk ${seconds} sn`;
  return `${seconds} sn`;
}

function getAuthorBadgeClasses(author) {
  if (author === "Efsa") {
    return "border-[#ff8aaa]/35 bg-[#ff8aaa]/14 text-[#ffb3c7]";
  }

  return "border-white/10 bg-black/70 text-gray-100";
}

function getRecipientBadgeClasses(recipient) {
  if (recipient === "Ortak") {
    return "border-roseSoft/35 bg-roseSoft/10 text-roseSoft";
  }

  if (recipient === "Efsa") {
    return "border-[#ff8aaa]/35 bg-[#ff8aaa]/12 text-[#ffb3c7]";
  }

  return "border-white/10 bg-black/60 text-gray-200";
}

export default function LettersPage() {
  const [pin, setPin] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [letters, setLetters] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const sentinelRef = useRef(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const unlocked = Boolean(currentUser);

  const fetchLetters = useCallback(async ({ reset = false } = {}) => {
    if (!supabase) {
      setHasMore(false);
      setInitialLoaded(true);
      setLoading(false);
      setError("Supabase ortam değişkenleri tanımlı değil.");
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const nextPage = reset ? 0 : pageRef.current;
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("letters")
      .select("id, author, recipient, title, content, open_at, created_at")
      .order("open_at", { ascending: false })
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
    setLetters((current) => (reset ? nextItems : mergeUniqueItems(current, nextItems)));
    pageRef.current = nextPage + 1;
    setHasMore(nextItems.length === PAGE_SIZE);
    setError("");
  }, []);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("letters-user");
    if (savedUser === "Enes" || savedUser === "Efsa") setCurrentUser(savedUser);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    pageRef.current = 0;
    setHasMore(true);
    fetchLetters({ reset: true });
  }, [fetchLetters, unlocked]);

  useEffect(() => {
    if (!unlocked || !supabase) return;

    const channel = supabase
      .channel("secret-letters")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "letters" },
        () => {
          pageRef.current = 0;
          setHasMore(true);
          fetchLetters({ reset: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLetters, unlocked]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || !initialLoaded || !unlocked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchLetters();
      },
      { rootMargin: "520px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchLetters, hasMore, initialLoaded, unlocked]);

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];

    if (user) {
      setCurrentUser(user);
      window.localStorage.setItem("letters-user", user);
      setPin("");
      setError("");
      return;
    }

    setError("Şifre yanlış. Bir daha deneyelim.");
  }

  function logout() {
    setCurrentUser("");
    setPin("");
    setLetters([]);
    setInitialLoaded(false);
    setHasMore(true);
    pageRef.current = 0;
    window.localStorage.removeItem("letters-user");
  }

  if (!unlocked) {
    return (
      <section className="page-shell flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="page-panel w-full p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-roseSoft/20 bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Gizli mektuplar</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Listeyi görmek için PIN gir. Zamanı gelen mektuplar direkt görünür.
          </p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {error && <p className="mt-3 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{error}</p>}
          <button className="primary-action focus-ring mt-5 w-full">Aç</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="page-kicker">
                <Mail size={15} className="text-roseDeep" />
                Gizli Mektuplar
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Geleceğe bırakılan, zamanı gelince kendiliğinden görünen küçük mektuplar.
              </p>
            </div>

            <div className="grid gap-2 sm:flex">
              <Link href="/mektuplar/yeni" className="primary-action focus-ring w-full sm:w-auto">
                <PenLine size={16} />
                Yeni Mektup
              </Link>
              <button type="button" onClick={logout} className="ghost-action focus-ring justify-center">
                <LogOut size={16} />
                Çıkış
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 py-5 sm:px-8 lg:px-10">
          {error && <p className="mb-5 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{error}</p>}

          {!initialLoaded && (
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="soft-card h-40 animate-pulse" />
              ))}
            </div>
          )}

          <div className="space-y-4">
            {initialLoaded && letters.length === 0 && !error && (
              <div className="page-panel p-7 text-center text-gray-400">
                Henüz mektup yazılmamış.
              </div>
            )}

            {letters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} now={now} currentUser={currentUser} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-8" />

          {loading && initialLoaded && (
            <p className="mt-5 text-center text-sm text-gray-500">Mektuplar yükleniyor...</p>
          )}

          {!hasMore && letters.length > 0 && (
            <p className="mt-5 text-center text-sm text-gray-600">Tüm mektuplar yüklendi.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function LetterCard({ letter, now, currentUser }) {
  const isTimeOpen = new Date(letter.open_at).getTime() <= now;
  const canCurrentUserOpen = letter.recipient === "Ortak" || letter.recipient === currentUser;
  const countdown = formatCountdown(letter.open_at, now);
  const shouldShowContent = isTimeOpen && canCurrentUserOpen;

  return (
    <article
      className={`feed-card content-visibility-auto p-4 sm:p-6 ${
        letter.author === "Efsa" ? "feed-card-efsa" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-lg border px-3 py-1 text-xs ${getAuthorBadgeClasses(letter.author)}`}>
          <UserRound size={12} className="mr-1 inline" />
          {letter.author}
        </span>
        <span className={`rounded-lg border px-3 py-1 text-xs ${getRecipientBadgeClasses(letter.recipient)}`}>
          Kime: {letter.recipient}
        </span>
      </div>

      <h2 className="emoji-safe mt-4 break-words text-[1.35rem] font-semibold leading-tight text-gray-50 [overflow-wrap:anywhere] sm:text-2xl">
        {letter.title}
      </h2>

      {shouldShowContent ? (
        <div className="mt-4">
          <ExpandableText text={letter.content} limit={420} className="leading-7 text-gray-200" />
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
          {!isTimeOpen ? (
            <p className="text-sm leading-6 text-gray-500">
              Bu mektup henüz açılmadı. Geri sayım: <span className="text-roseSoft">{countdown}</span>
            </p>
          ) : (
            <p className="text-sm leading-6 text-gray-500">
              Bu mektup sadece {letter.recipient} tarafından açılabilir.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
