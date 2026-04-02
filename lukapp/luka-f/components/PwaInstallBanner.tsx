"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, Plus, Download } from "lucide-react";
import { LukappLogo } from "@/components/ui/lukapp-logo";
import { usePwaInstallPrompt, getIsPwaStandalone } from "@/lib/hooks/use-pwa-install";

export function PwaInstallBanner() {
  const { isStandalone, platform, canUseNativePrompt, promptInstall, recheckStandalone } =
    usePwaInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);

  useEffect(() => {
    setSessionDismissed(sessionStorage.getItem("pwa-banner-dismissed") === "1");
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  const installAndroid = async () => {
    const accepted = await promptInstall();
    recheckStandalone();
    if (accepted || getIsPwaStandalone()) dismiss();
  };

  if (isStandalone || sessionDismissed || dismissed) return null;

  const showAndroid = platform === "android" && canUseNativePrompt;
  const showIos = platform === "ios";
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
                type="button"
                onClick={dismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {showAndroid && (
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => void installAndroid()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-brand text-white font-bold text-[14px] rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  Instalar gratis
                </button>
              </div>
            )}

            {showIos && !iosGuide && (
              <div className="px-4 pb-4">
                <button
                  type="button"
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
                    Selecciona <span className="font-bold">&quot;Añadir a inicio&quot;</span>
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
