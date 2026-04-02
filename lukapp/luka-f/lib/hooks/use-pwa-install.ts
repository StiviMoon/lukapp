"use client";

import { useState, useEffect, useCallback } from "react";

/** Evento no estándar que dispara Chrome/Edge antes de poder instalar la PWA. */
export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function getIsPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari
  // @ts-expect-error navigator.standalone solo existe en WebKit
  if (window.navigator.standalone === true) return true;
  return false;
}

export type PwaHintsPlatform = "ios" | "android" | "desktop" | "other";

/** Para textos de ayuda: dónde está el usuario. */
export function detectPwaHintsPlatform(): PwaHintsPlatform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  const isChrome = /chrome/.test(ua) && !/edge|edg\//.test(ua);
  if (isChrome) return "desktop";
  return "other";
}

/**
 * Estado compartido entre el banner inferior y Ajustes:
 * `beforeinstallprompt` y comprobación de modo standalone.
 */
export function usePwaInstallPrompt() {
  const [isStandalone, setStandalone] = useState(false);
  const [platform, setPlatform] = useState<PwaHintsPlatform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEventLike | null>(null);

  useEffect(() => {
    setStandalone(getIsPwaStandalone());
    setPlatform(detectPwaHintsPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEventLike);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setStandalone(getIsPwaStandalone());
    return outcome === "accepted";
  }, [deferredPrompt]);

  const recheckStandalone = useCallback(() => {
    setStandalone(getIsPwaStandalone());
  }, []);

  return {
    isStandalone,
    platform,
    canUseNativePrompt: deferredPrompt !== null,
    promptInstall,
    recheckStandalone,
  };
}
