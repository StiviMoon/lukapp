"use client";

import { useState, useEffect } from "react";

/**
 * Garantiza que el skeleton se muestre al menos `minMs` ms desde el montaje.
 * Evita el flash cuando los datos llegan muy rápido (caché, red rápida, etc.)
 * y da una sensación de carga profesional y pulida.
 *
 * Uso:
 *   const showSkeleton = useMinDelay(isLoading);
 *   if (showSkeleton) return <Skeleton />;
 */
export function useMinDelay(isLoading: boolean, minMs = 380): boolean {
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, []); // solo en el montaje inicial

  // Muestra skeleton si: datos aún cargando  O  tiempo mínimo no alcanzado
  return isLoading || !minElapsed;
}
