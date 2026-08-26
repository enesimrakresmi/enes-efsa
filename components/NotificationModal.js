"use client";

import { useState } from "react";
import { Bell, Check, Sparkles, X, AlertCircle, Share2, Smartphone, ShieldCheck, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/components/NotificationProvider";
import { useAuth } from "@/components/AuthProvider";

export default function NotificationModal() {
  const {
    permission,
    supported,
    isStandalone,
    isIOS,
    isModalOpen,
    closeModal,
    enableNotifications,
    renewSubscription,
    sendTestNotification,
    subscribing,
    renewing,
    testSending,
    testStatus
  } = useNotification();

  const { displayName } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);
  const [justGranted, setJustGranted] = useState(false);

  if (!isModalOpen) return null;

  async function handleEnable() {
    setErrorMsg(null);
    setInfoMsg(null);
    const result = await enableNotifications();
    if (result.ok) {
      setJustGranted(true);
      setTimeout(() => setJustGranted(false), 3000);
    } else {
      setErrorMsg(result.error || "Bildirim izni alınamadı.");
    }
  }

  async function handleRenew() {
    setErrorMsg(null);
    setInfoMsg(null);
    const result = await renewSubscription();
    if (result.ok) {
      setInfoMsg("Abonelik anahtarınız başarıyla yenilendi ve kaydedildi! ✨");
    } else {
      setErrorMsg(result.error || "Abonelik yenilenemedi.");
    }
  }

  async function handleTest() {
    setErrorMsg(null);
    setInfoMsg(null);
    const result = await sendTestNotification();
    if (result.ok) {
      const delivered = result.result?.delivered ?? 1;
      const count = result.result?.count ?? 1;
      setInfoMsg(`Test bildirimi gönderildi! (${delivered}/${count} cihaza iletildi) ✨`);
    } else {
      setErrorMsg(result.error || "Test bildirimi gönderilemedi.");
    }
  }

  const isGranted = permission === "granted" || justGranted;
  const isDenied = permission === "denied";
  const needsIOSPWA = isIOS && !isStandalone;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amberGold/30 bg-[#15110f] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all sm:p-8">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-amberGold/15 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-rose-500/10 blur-[60px]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Kapat"
          className="focus-ring absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-parchment-400 transition hover:bg-white/[0.1] hover:text-parchment-100"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
            isGranted
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : isDenied
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-amberGold/40 bg-amberGold/15 text-amberGold"
          }`}>
            <Bell size={24} className={isGranted ? "" : "animate-pulse"} />
          </div>

          <div>
            <h2 className="font-serif text-xl font-normal text-parchment-50 sm:text-2xl">
              Bildirim Merkezi
            </h2>
            <p className="mt-0.5 font-sans text-xs text-parchment-400">
              Yeni hatıralar, mühürlü mektuplar ve canlı dokunuşlar için
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
          <span className="text-xs text-parchment-300">Mevcut Durum:</span>
          {isGranted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-serif text-xs font-medium text-emerald-300">
              <Check size={13} className="text-emerald-400" />
              Bildirimler Açık ✨
            </span>
          ) : isDenied ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-serif text-xs font-medium text-rose-300">
              <AlertCircle size={13} className="text-rose-400" />
              Tarayıcıda Engellendi
            </span>
          ) : needsIOSPWA ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amberGold/30 bg-amberGold/10 px-3 py-1 font-serif text-xs font-medium text-amberGold-light">
              <Smartphone size={13} />
              Ana Ekrana Ekleme Gerekli
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amberGold/30 bg-amberGold/10 px-3 py-1 font-serif text-xs font-medium text-amberGold">
              <Sparkles size={13} />
              İzin Bekleniyor
            </span>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Content depending on state */}
        <div className="mt-4 space-y-3">
          {/* iOS Safari Guide if not in Standalone mode */}
          {needsIOSPWA && (
            <div className="rounded-2xl border border-amberGold/25 bg-amberGold/5 p-4 text-xs text-parchment-200">
              <p className="font-serif font-medium text-amberGold-light">
                📱 iPhone / iPad Kullanıcıları İçin Kılavuz:
              </p>
              <p className="mt-1 text-parchment-300">
                Apple, web bildirimlerini yalnızca ana ekrana eklenen web uygulamalarında (PWA) destekler.
              </p>
              <ol className="mt-3 space-y-2 list-decimal list-inside text-parchment-200">
                <li>
                  Safari alt çubuğundaki <span className="font-semibold text-amberGold"><Share2 size={13} className="inline mr-0.5" /> Paylaş</span> simgesine dokunun.
                </li>
                <li>
                  Menüden <span className="font-semibold text-amberGold">“Ana Ekrana Ekle”</span> seçeneğini seçin.
                </li>
                <li>
                  Ana ekranınıza eklenen <strong>Efes</strong> simgesine dokunarak açın ve buradan bildirime izin verin.
                </li>
              </ol>
            </div>
          )}

          {/* iOS Standalone Mode Tips */}
          {isIOS && isStandalone && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-parchment-300">
              <p className="font-serif font-medium text-emerald-300">
                📲 iPhone Ana Ekran Uygulaması Aktif
              </p>
              <p className="mt-1 text-[11px] text-parchment-400 leading-relaxed">
                Bildirim gelmiyorsa: iPhone <strong>Ayarlar &gt; Bildirimler &gt; Efes</strong> menüsünde <em>“Kilitli Ekran”</em> ve <em>“Başlıklar”</em>ın açık olduğunu ve <em>Odak (Rahatsız Etmeyin)</em> modunun kapalı olduğunu kontrol edin.
              </p>
            </div>
          )}

          {/* Browser Denied Info */}
          {isDenied && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-parchment-300">
              <p className="font-serif font-medium text-rose-300">
                ⚠️ Bildirim İzni Engellenmiş:
              </p>
              <p className="mt-1">
                Tarayıcınızın veya telefonunuzun güvenlik ayarlarında bu sitenin bildirimleri engellenmiş görünüyor.
              </p>
              <p className="mt-2 text-parchment-400">
                👉 <strong>Çözüm:</strong> Tarayıcınızın adres çubuğundaki kilit/ayar simgesine dokunarak “Bildirimler” seçeneğini <strong>İzin Ver</strong> yapın.
              </p>
            </div>
          )}

          {/* Regular Description */}
          {!needsIOSPWA && !isDenied && (
            <p className="text-xs leading-relaxed text-parchment-300">
              {displayName ? `${displayName}, ` : ""}
              bildirimler açık olduğunda partnerin yeni bir hatıra paylaştığında, mühürlü mektup bıraktığında veya canlı bağlantı başlattığında telefonuna anında bildirim düşer.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {!isGranted && (
            <button
              type="button"
              onClick={handleEnable}
              disabled={subscribing || needsIOSPWA}
              className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amberGold/50 bg-gradient-to-r from-amberGold via-[#f0caa0] to-amberGold px-5 py-3 font-serif text-sm font-semibold text-[#14100e] shadow-[0_4px_20px_rgba(224,169,109,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? (
                <>
                  <RefreshCw size={17} className="animate-spin text-[#14100e]" />
                  <span>İzin Alınıyor...</span>
                </>
              ) : (
                <>
                  <Bell size={17} />
                  <span>Bildirimlere İzin Ver</span>
                </>
              )}
            </button>
          )}

          {isGranted && (
            <>
              <button
                type="button"
                onClick={handleTest}
                disabled={testSending || renewing}
                className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amberGold/35 bg-amberGold/15 px-5 py-3 font-serif text-sm font-medium text-amberGold-light shadow-[0_4px_16px_rgba(224,169,109,0.15)] transition-all hover:bg-amberGold/25 hover:text-amberGold active:scale-[0.98] disabled:opacity-50"
              >
                {testSending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-amberGold" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : testStatus === "success" ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-300">Test Gönderildi! ✨</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Test Bildirimi Gönder 💌</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRenew}
                disabled={renewing || testSending}
                title="Abonelik anahtarını sıfırla ve yeniden eşitle"
                className="focus-ring flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-serif text-xs text-parchment-300 transition hover:bg-white/[0.08] hover:text-parchment-100 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={renewing ? "animate-spin text-amberGold" : "text-parchment-400"} />
                <span>{renewing ? "Yenileniyor..." : "Yenile"}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={closeModal}
            className="focus-ring flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-serif text-xs font-medium text-parchment-300 transition hover:bg-white/[0.08] hover:text-parchment-100"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

