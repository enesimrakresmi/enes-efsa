"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Clock,
  Eye,
  Heart,
  Laptop,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  UserCheck,
  UserRound,
  Wifi
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function formatDuration(seconds = 0) {
  if (seconds < 60) return `${seconds} sn`;
  const mins = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  if (mins < 60) return `${mins} dk ${remSec > 0 ? `${remSec} sn` : ""}`;
  const hours = Math.floor(mins / 60);
  const remMin = mins % 60;
  return `${hours} sa ${remMin} dk`;
}

function formatRelativeTime(iso) {
  if (!iso) return "Bilinmiyor";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 45) return "Az önce";
  if (sec < 90) return "1 dk önce";
  if (sec < 3600) return `${Math.floor(sec / 60)} dk önce`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} sa önce`;
  return `${Math.floor(sec / 86400)} gün önce`;
}

function formatExactDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(d);
}

function getPathLabel(path) {
  const map = {
    "/": "Ana Sayfa",
    "/zaman-tuneli": "Zaman Tüneli",
    "/zaman-tuneli/yeni": "Yeni Hatıra Ekle",
    "/mektuplar": "Mektuplar",
    "/mektuplar/yeni": "Yeni Mektup Yaz",
    "/baglanti": "Canlı Bağlantı",
    "/gunluk": "Yeni Proje"
  };
  return map[path] || path;
}

export default function AdminDashboardPage() {
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [knownIps, setKnownIps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("efsa"); // "efsa" or "all"
  const [newIp, setNewIp] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");
  const [addingIp, setAddingIp] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Fetch Logs
      const { data: logData } = await supabase
        .from("activity_logs")
        .select("*")
        .order("last_active_at", { ascending: false })
        .limit(50);

      setLogs(logData || []);

      // 2. Fetch Known IPs
      const { data: ipData } = await supabase
        .from("known_ips")
        .select("*")
        .order("created_at", { ascending: false });

      setKnownIps(ipData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  async function handleAddEfsaIp(e) {
    if (e) e.preventDefault();
    if (!newIp.trim()) return;
    setAddingIp(true);

    try {
      const res = await fetch("/api/admin/ip-alias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: newIp.trim(),
          label: newIpLabel.trim() || "Efsa Cihazı",
          userAlias: "Efsa",
          pin: "1453",
          action: "add"
        })
      });

      if (res.ok) {
        setNewIp("");
        setNewIpLabel("");
        await fetchData();
      }
    } catch {
      // Ignore
    } finally {
      setAddingIp(false);
    }
  }

  async function handleRemoveEfsaIp(ipToRemove) {
    try {
      await fetch("/api/admin/ip-alias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: ipToRemove,
          pin: "1453",
          action: "remove"
        })
      });
      await fetchData();
    } catch {}
  }

  // Efsa logs
  const efsaLogs = useMemo(() => logs.filter((l) => l.user_alias === "Efsa"), [logs]);
  const latestEfsa = efsaLogs[0] || null;
  const isEfsaOnline =
    latestEfsa && Date.now() - new Date(latestEfsa.last_active_at).getTime() < 120000;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-start py-2 sm:py-6">
      {/* 1. Header */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.06] px-3 pb-5 pt-2 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-normal text-parchment-50 sm:text-4xl">
              Efsa & Ziyaretçi Paneli
            </h1>
            <span className="rounded-full border border-dustyRose/30 bg-dustyRose/15 px-2.5 py-0.5 font-serif text-[11px] text-dustyRose-light">
              Canlı Takip
            </span>
          </div>
          <p className="mt-1 font-serif text-xs italic text-parchment-400">
            Efsa'nın giriş saatleri, gezdiği sayfalar ve kalma süreleri.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={fetchData} disabled={loading} className="ghost-action focus-ring text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* 2. Spotlight: Efsa's Live Status */}
      <div className="mt-6 rounded-2xl border border-dustyRose/30 bg-gradient-to-b from-[#211619]/95 to-[#120e10]/98 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dustyRose/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-dustyRose/40 bg-dustyRose/20 text-dustyRose shadow-inner">
              <Heart size={22} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-parchment-50">Efsa'nın Durumu</h2>
              <p className="font-serif text-xs italic text-dustyRose-light">
                {latestEfsa ? `Kayıtlı IP: ${latestEfsa.ip}` : "Henüz bir IP tanımlanmadı"}
              </p>
            </div>
          </div>

          <div>
            {isEfsaOnline ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1.5 font-serif text-xs font-semibold text-emerald-400 shadow-lg">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
                Şu an Sitede
              </span>
            ) : (
              <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 font-serif text-xs italic text-parchment-300">
                {latestEfsa ? `En son: ${formatRelativeTime(latestEfsa.last_active_at)}` : "Henüz ziyaret yok"}
              </span>
            )}
          </div>
        </div>

        {latestEfsa ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
              <span className="font-serif text-xs text-parchment-400">Son Ziyaret Zamanı</span>
              <div className="mt-1 font-serif text-sm font-semibold text-parchment-100">
                {formatExactDate(latestEfsa.last_active_at)}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
              <span className="font-serif text-xs text-parchment-400">Sitede Kaldığı Süre</span>
              <div className="mt-1 font-serif text-base font-bold text-amberGold">
                {formatDuration(latestEfsa.duration_seconds)}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
              <span className="font-serif text-xs text-parchment-400">Son Baktığı Sayfa</span>
              <div className="mt-1 truncate font-serif text-sm font-semibold text-dustyRose-light">
                {getPathLabel(latestEfsa.current_path)}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 font-serif text-xs italic text-parchment-400">
            Aşağıdaki formdan Efsa'nın ev veya mobil IP adresini eklediğinizde hareketleri burada listelenecektir.
          </p>
        )}
      </div>

      {/* 3. Multi-IP Management Box: Efsa'nın Tanımlı IP'leri */}
      <div className="mt-6 rounded-2xl border border-amberGold/20 bg-[#161210]/95 p-5 backdrop-blur-xl">
        <h3 className="font-serif text-base font-medium text-parchment-100 flex items-center gap-2">
          <Wifi size={17} className="text-amberGold" />
          Efsa'nın Tanımlı IP Adresleri ({knownIps.length})
        </h3>
        <p className="mt-1 font-serif text-xs italic text-parchment-400">
          Efsa'nın ev Wi-Fi veya mobil internet IP'lerini buraya ekleyebilirsiniz.
        </p>

        {/* Add IP Form */}
        <form onSubmit={handleAddEfsaIp} className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
          <input
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="IP Adresi (Örn: 176.240.12.34)"
            className="h-10 w-full sm:w-1/2 rounded-xl border border-white/10 bg-black/40 px-3.5 font-mono text-xs text-parchment-100 placeholder:text-parchment-500 focus:border-amberGold/50 focus:outline-none"
          />
          <input
            value={newIpLabel}
            onChange={(e) => setNewIpLabel(e.target.value)}
            placeholder="Etiket (Örn: Ev Wi-Fi, Mobil Veri)"
            className="h-10 w-full sm:w-1/3 rounded-xl border border-white/10 bg-black/40 px-3.5 font-serif text-xs text-parchment-100 placeholder:text-parchment-500 focus:border-amberGold/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingIp || !newIp.trim()}
            className="primary-action focus-ring w-full sm:w-auto h-10 px-4 text-xs shrink-0"
          >
            <Plus size={15} />
            {addingIp ? "Ekleniyor..." : "Efsa IP'si Ekle"}
          </button>
        </form>

        {/* Current Known IPs list */}
        {knownIps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/[0.06]">
            {knownIps.map((k) => (
              <div
                key={k.ip}
                className="flex items-center gap-2 rounded-xl border border-dustyRose/30 bg-dustyRose/10 px-3 py-1.5 text-xs font-serif text-parchment-200"
              >
                <span className="font-mono text-dustyRose-light font-semibold">{k.ip}</span>
                <span className="text-[11px] text-parchment-400 italic">({k.label || "Efsa"})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEfsaIp(k.ip)}
                  className="text-parchment-400 hover:text-dustyRose transition ml-1"
                  title="Bu IP'yi Kaldır"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Tab Selector: Sadece Efsa vs Tümü */}
      <div className="mt-6 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("efsa")}
            className={`rounded-xl px-4 py-2 font-serif text-xs font-medium transition ${
              activeTab === "efsa"
                ? "bg-dustyRose/20 text-dustyRose-light border border-dustyRose/30 font-semibold"
                : "text-parchment-400 hover:text-parchment-200"
            }`}
          >
            ⭐ Sadece Efsa'nın Hareketleri ({efsaLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 font-serif text-xs font-medium transition ${
              activeTab === "all"
                ? "bg-amberGold/20 text-amberGold border border-amberGold/30 font-semibold"
                : "text-parchment-400 hover:text-parchment-200"
            }`}
          >
            Tüm Ziyaretçi Kayıtları ({logs.length})
          </button>
        </div>

        <span className="font-serif text-[11px] italic text-parchment-500 hidden sm:inline">
          (Son 50 kayıt otomatik saklanır)
        </span>
      </div>

      {/* 5. Clean Logs Timeline */}
      <div className="mt-4 space-y-3">
        {(activeTab === "efsa" ? efsaLogs : logs).length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#14100e]/60 p-12 text-center">
            <Eye size={24} className="mx-auto text-parchment-500" />
            <p className="mt-3 font-serif text-sm italic text-parchment-400">
              {activeTab === "efsa"
                ? "Henüz Efsa'ya ait bir ziyaret kaydı yok. IP adresini yukarıdan ekleyebilirsiniz."
                : "Henüz log kaydı bulunamadı."}
            </p>
          </div>
        ) : (
          (activeTab === "efsa" ? efsaLogs : logs).map((log) => {
            const isEfsa = log.user_alias === "Efsa";
            const paths = Array.isArray(log.visited_paths) ? log.visited_paths : [log.current_path];

            return (
              <article
                key={log.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isEfsa
                    ? "border-dustyRose/30 bg-gradient-to-b from-[#1f1517]/90 to-[#120e10]/95 shadow-md"
                    : "border-white/[0.07] bg-black/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-serif text-xs font-semibold ${
                        isEfsa
                          ? "border border-dustyRose/40 bg-dustyRose/20 text-dustyRose-light"
                          : "border border-white/10 bg-white/[0.05] text-parchment-300"
                      }`}
                    >
                      <UserRound size={12} />
                      {log.user_alias}
                    </span>
                    <span className="font-mono text-xs text-parchment-300">{log.ip}</span>
                    <span className="text-xs text-parchment-500 font-serif">• {log.device_type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xs italic text-parchment-400">
                      {formatExactDate(log.last_active_at)} ({formatRelativeTime(log.last_active_at)})
                    </span>

                    {!isEfsa && (
                      <button
                        onClick={() => {
                          setNewIp(log.ip);
                          setNewIpLabel("Efsa Cihazı");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-dustyRose/30 bg-dustyRose/15 px-2.5 py-0.5 font-serif text-[11px] text-dustyRose-light hover:bg-dustyRose/25"
                      >
                        <UserCheck size={11} />
                        Efsa'ya Ekle
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
                    <span className="text-parchment-400">Gezdiği Sayfalar:</span>
                    {paths.map((p, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${
                          p === log.current_path
                            ? "border-amberGold/30 bg-amberGold/10 text-amberGold-light font-semibold"
                            : "border-white/[0.06] bg-black/20 text-parchment-300"
                        }`}
                      >
                        {getPathLabel(p)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 font-serif text-xs">
                    <Clock size={13} className="text-amberGold" />
                    <span className="text-parchment-400">Kaldığı Süre:</span>
                    <span className="font-bold text-amberGold font-mono">
                      {formatDuration(log.duration_seconds)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
