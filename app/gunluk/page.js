"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookHeart, LockKeyhole, LogOut, PenLine } from "lucide-react";
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

function getPostClasses(author) {
  return author === "Efsa" ? "feed-card-efsa" : "";
}

function getAuthorBadgeClasses(author) {
  if (author === "Efsa") {
    return "border-[#ff8aaa]/35 bg-[#ff8aaa]/14 text-[#ffb3c7]";
  }

  return "border-white/10 bg-black/70 text-gray-100";
}

export default function JournalPage() {
  const [pin, setPin] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const unlocked = Boolean(currentUser);

  const fetchPosts = useCallback(async ({ reset = false } = {}) => {
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
      .from("posts")
      .select("id, author, content, created_at")
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
    setPosts((current) => (reset ? nextItems : mergeUniqueItems(current, nextItems)));
    pageRef.current = nextPage + 1;
    setHasMore(nextItems.length === PAGE_SIZE);
    setError("");
  }, []);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("journal-user");
    if (savedUser === "Enes" || savedUser === "Efsa") setCurrentUser(savedUser);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    pageRef.current = 0;
    setHasMore(true);
    fetchPosts({ reset: true });
  }, [fetchPosts, unlocked]);

  useEffect(() => {
    if (!unlocked || !supabase) return;

    const channel = supabase
      .channel("journal-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          pageRef.current = 0;
          setHasMore(true);
          fetchPosts({ reset: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts, unlocked]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || !initialLoaded || !unlocked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchPosts();
      },
      { rootMargin: "520px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPosts, hasMore, initialLoaded, unlocked]);

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];

    if (user) {
      setCurrentUser(user);
      window.localStorage.setItem("journal-user", user);
      setPin("");
      setError("");
      return;
    }

    setError("Şifre yanlış. Bir daha deneyelim.");
  }

  function logout() {
    setCurrentUser("");
    setPosts([]);
    setInitialLoaded(false);
    setHasMore(true);
    pageRef.current = 0;
    window.localStorage.removeItem("journal-user");
  }

  if (!unlocked) {
    return (
      <section className="page-shell flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="page-panel w-full p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-roseSoft/20 bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Gizli alan</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Şifreni gir, günlük otomatik olarak Enes veya Efsa hesabıyla açılır.
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
                <BookHeart size={15} className="text-roseDeep" />
                Ortak Günlük
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Uzun ve kısa notlar aynı akışta saklanır.
              </p>
            </div>

            <div className="grid gap-2 sm:flex">
              <Link href="/gunluk/yeni" className="primary-action focus-ring">
                <PenLine size={16} />
                Yeni Yazı
              </Link>
              <button onClick={logout} className="ghost-action focus-ring">
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
            {initialLoaded && posts.length === 0 && !error && (
              <div className="page-panel p-7 text-center text-gray-400">
                Henüz günlük yazısı yok.
              </div>
            )}

            {posts.map((post) => (
              <article
                key={post.id}
                className={`feed-card content-visibility-auto p-4 sm:p-6 ${getPostClasses(post.author)}`}
              >
                <ExpandableText
                  text={post.content}
                  limit={360}
                  className="leading-7 text-gray-200"
                />
                <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm text-gray-500">
                  <span className={`rounded-lg border px-3 py-1 text-xs ${getAuthorBadgeClasses(post.author)}`}>
                    {post.author}
                  </span>
                  <span className="py-1">
                    {new Intl.DateTimeFormat("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(new Date(post.created_at))}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div ref={sentinelRef} className="h-8" />

          {loading && initialLoaded && (
            <p className="mt-5 text-center text-sm text-gray-500">Günlükler yükleniyor...</p>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="mt-5 text-center text-sm text-gray-600">Tüm günlükler yüklendi.</p>
          )}
        </div>
      </div>
    </section>
  );
}
