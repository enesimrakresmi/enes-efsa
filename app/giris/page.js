"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, LockKeyhole, LogIn, User } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f0d0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amberGold/30 border-t-amberGold" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  // If already logged in, redirect
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          router.replace(from);
          return;
        }
      } catch {}
      setChecking(false);
    }
    check();
  }, [router, from]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      router.replace(from);
    } catch (err) {
      setError("Bağlantı hatası: " + (err.message || "Tekrar deneyin."));
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f0d0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amberGold/30 border-t-amberGold" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f0d0c] px-4">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amberGold/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-dustyRose/[0.05] blur-[100px]" />
        <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-amberGold/[0.04] blur-[90px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-amberGold/30 bg-gradient-to-b from-amberGold/20 to-amberGold/5 shadow-[0_8px_30px_rgba(224,169,109,0.2)]">
            <img
              src="/icon.png"
              alt="Efes"
              className="h-16 w-16 rounded-xl object-contain"
            />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-dustyRose/40 bg-[#1a1512] shadow-lg">
              <Heart size={13} fill="currentColor" className="text-dustyRose" />
            </div>
          </div>

          <h1 className="font-serif text-4xl font-normal tracking-tight text-parchment-50">
            Enes & Efsa
          </h1>
          <p className="mt-2 font-handwriting text-xl text-amberGold/80">
            Hatıralarımıza hoş geldin
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="relative overflow-hidden rounded-2xl border border-amberGold/20 bg-gradient-to-b from-[#1a1512]/95 via-[#13100e]/95 to-[#0e0c0b]/98 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {/* Top shine line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amberGold/40 to-transparent" />

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="mb-1.5 block font-serif text-xs font-medium text-parchment-300"
              >
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-500"
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="enes veya efsa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 font-sans text-sm text-parchment-100 placeholder:text-parchment-600 outline-none transition-all duration-200 focus:border-amberGold/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-amberGold/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block font-serif text-xs font-medium text-parchment-300"
              >
                Şifre
              </label>
              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-500"
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 font-sans text-sm text-parchment-100 placeholder:text-parchment-600 outline-none transition-all duration-200 focus:border-amberGold/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-amberGold/20"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center font-sans text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="primary-action focus-ring mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1512]/30 border-t-[#1a1512]" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Quote */}
        <p className="mt-6 text-center font-handwriting text-base text-parchment-500/60">
          "İkimize ait küçük bir dünya." ✦
        </p>
      </div>
    </div>
  );
}
