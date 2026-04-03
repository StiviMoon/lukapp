"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mqNarrow = window.matchMedia("(max-width: 767px)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fn = () => cb();
  mqNarrow.addEventListener("change", fn);
  mqReduce.addEventListener("change", fn);
  return () => {
    mqNarrow.removeEventListener("change", fn);
    mqReduce.removeEventListener("change", fn);
  };
}

function snapshot() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function serverSnapshot() {
  return false;
}

/** Móvil o prefers-reduced-motion: menos JS de motion y menos trabajo en compositor. */
export function useReduceLandingMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
