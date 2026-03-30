"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, Plus, Download } from "lucide-react";
import { LukappLogo } from "@/components/ui/lukapp-logo";

type Platform = "android" | "ios" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  // Ya instalada como PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return null;
  // @ts-expect-error — standalone es propiedad de Safari
  if (window.navigator.standalone === true) return null;

  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isChrome = /chrome/.test(ua) && !/edge/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);

  if (isIos && isSafari) return "ios";
  if (isAndroid && isChrome) return "android";
  return null;
}

export function PwaInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);

  useEffect(() => {
    // No mostrar si ya fue descartado en esta sesión
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferredPrompt(null);
  };

  // Android: solo mostrar cuando hay prompt nativo disponible
  const showAndroid = platform === "android" && deferredPrompt !== null && !dismissed;
  // iOS: mostrar siempre si es Safari iOS y no fue descartado
  const showIos = platform === "ios" && !dismissed;
  const show = showAndroid || showIos;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[60] px-4"
          style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-[#0c0c0e]">
                <LukappLogo variant="isotipo" height={36} color="degradado" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-foreground leading-tight">
                  Instala lukapp
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Acceso rápido desde tu pantalla de inicio
                </p>
              </div>
              <button
                onClick={dismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Android CTA */}
            {showAndroid && (
              <div className="px-4 pb-4">
                <button
                  onClick={installAndroid}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-brand text-white font-bold text-[14px] rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  Instalar gratis
                </button>
              </div>
            )}

            {/* iOS: instrucciones */}
            {showIos && !iosGuide && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setIosGuide(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-brand text-white font-bold text-[14px] rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  Añadir a inicio
                </button>
              </div>
            )}

            {showIos && iosGuide && (
              <div className="px-4 pb-4 space-y-2.5">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/15 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4 text-brand-blue" />
                  </div>
                  <p className="text-[13px] text-foreground">
                    Toca el botón <span className="font-bold">Compartir</span> en Safari
                  </p>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
                  <div className="w-7 h-7 rounded-lg bg-purple-brand/15 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-purple-brand" />
                  </div>
                  <p className="text-[13px] text-foreground">
                    Selecciona <span className="font-bold">"Añadir a inicio"</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
