"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({
  user: null,        // "enes" | "efsa" | null
  displayName: null, // "Enes" | "Efsa" | null
  loading: true,
  logout: () => {},
  partner: null,     // "Efsa" | "Enes" | null
  partnerKey: null   // "efsa" | "enes" | null
});

const DISPLAY_NAMES = { enes: "Enes", efsa: "Efsa" };
const PARTNERS = { enes: "efsa", efsa: "enes" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled) {
          setUser(data.user || null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [pathname]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    setUser(null);
    router.push("/giris");
  }, [router]);

  const displayName = user ? (DISPLAY_NAMES[user] || user) : null;
  const partnerKey = user ? (PARTNERS[user] || null) : null;
  const partner = partnerKey ? (DISPLAY_NAMES[partnerKey] || partnerKey) : null;

  return (
    <AuthContext.Provider value={{ user, displayName, loading, logout, partner, partnerKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
