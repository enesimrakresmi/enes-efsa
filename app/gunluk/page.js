"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookHeart, LockKeyhole, LogOut, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

function getPostClasses(author) {
  if (author === "Efsa") return "border-[#ff8aaa]/25 bg-[#ff8aaa]/8";
  return "border-black/70 bg-black/35";
}

function getAuthorBadgeClasses(author) {
  if (author === "Efsa") {
    return "border-[#ff8aaa]/35 bg-[#ff8aaa]/14 text-[#ffb3c7]";
  }

  return "border-black/70 bg-black/70 text-gray-100";
}

export default function JournalPage() {
  const [pin, setPin] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  const unlocked = Boolean(currentUser);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("journal-user");
    if (savedUser === "Enes" || savedUser === "Efsa") setCurrentUser(savedUser);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    fetchPosts();
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked || !supabase) return;

    const channel = supabase
      .channel("journal-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked]);

  async function fetchPosts() {
    if (!supabase) {
      setError("Supabase ortam değişkenleri tanımlı değil.");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("posts")
      .select("id, author, content, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setPosts(data || []);
    setError("");
  }

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
    window.localStorage.removeItem("journal-user");
  }

  if (!unlocked) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <form onSubmit={unlock} className="glass-panel w-full max-w-sm rounded-lg p-6">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Gizli alan</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Şifreni gir.
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
          <button className="focus-ring mt-5 h-12 w-full rounded-lg bg-roseSoft font-medium text-night transition hover:bg-[#aac7ff]">
            Aç
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl py-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-roseSoft/10 text-roseSoft">
            <BookHeart size={23} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-roseSoft/80">
              Ortak Günlük
            </p>
            <h1 className="text-3xl font-semibold text-gray-50">
              Yazılmış günlükler
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/gunluk/yeni"
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-roseSoft px-4 text-sm font-medium text-night transition hover:bg-[#aac7ff]"
          >
            <PenLine size={16} />
            Yeni Yazı
          </Link>
          <button
            onClick={logout}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-gray-300 transition hover:bg-white/[0.04]"
          >
            <LogOut size={16} />
            Çıkış
          </button>
        </div>
      </div>

      {error && <p className="mt-5 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{error}</p>}

      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className={`rounded-lg border p-5 backdrop-blur ${getPostClasses(post.author)}`}
          >
            <p className="whitespace-pre-wrap break-words leading-7 text-gray-200 [overflow-wrap:anywhere]">
              {post.content}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-gray-500">
              <span className={`rounded-full border px-3 py-1 text-xs ${getAuthorBadgeClasses(post.author)}`}>
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
    </section>
  );
}
