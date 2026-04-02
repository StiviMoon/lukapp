"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Muestra skeleton durante al menos `minMs` ms SOLO cuando hay una carga real.
 *
 * Reglas:
 * - Si al montar ya hay datos (isLoading=false) → devuelve false inmediatamente.
 * - Si al montar hay carga real → skeleton hasta que (a) termine Y (b) pasen minMs.
 * - Si los datos llegan antes de minMs → esperamos el resto del tiempo para evitar
 *   un flash de skeleton demasiado corto (peor que no mostrarlo).
 * - minMs por defecto: 300ms (suficiente para no ser un parpadeo, no tan largo que moleste).
 */
export function useMinDelay(isLoading: boolean, minMs = 300): boolean {
  const wasLoadingOnMount = useRef(isLoading);
  const [minElapsed, setMinElapsed] = useState(!isLoading);

  useEffect(() => {
    if (!wasLoadingOnMount.current) return;
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wasLoadingOnMount.current) return false;
  return isLoading || !minElapsed;
}
