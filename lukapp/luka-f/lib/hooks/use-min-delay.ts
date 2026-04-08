"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Muestra skeleton durante al menos `minMs` ms SOLO cuando hay una carga real sin datos previos.
 *
 * Reglas:
 * - Si `hasData=true` → devuelve false inmediatamente (datos en caché: sin skeleton).
 * - Si al montar isLoading=false → devuelve false inmediatamente.
 * - Si hay carga real → skeleton hasta que (a) termine Y (b) pasen minMs.
 * - minMs por defecto: 300ms (evita flash de skeleton demasiado corto).
 */
export function useMinDelay(isLoading: boolean, minMs = 300, hasData = false): boolean {
  const wasLoadingOnMount = useRef(isLoading && !hasData);
  const [minElapsed, setMinElapsed] = useState(!isLoading || hasData);

  useEffect(() => {
    if (!wasLoadingOnMount.current) return;
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (hasData) return false;
  if (!wasLoadingOnMount.current) return false;
  return isLoading || !minElapsed;
}
