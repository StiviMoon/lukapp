"use client";

import { useEffect, useState } from "react";

/**
 * Altura aproximada del teclado virtual (iOS Safari / Chrome Android / PWA).
 * Útil para añadir padding inferior a bottom sheets con inputs.
 */
export function useKeyboardBottomInset(active: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active) {
      setInset(0);
      return;
    }
    if (typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const overlap = Math.max(
        0,
        window.innerHeight - vv.height - Math.max(0, vv.offsetTop)
      );
      setInset(overlap);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setInset(0);
    };
  }, [active]);

  return inset;
}
