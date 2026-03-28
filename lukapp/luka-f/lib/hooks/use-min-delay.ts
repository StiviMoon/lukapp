"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Muestra skeleton durante al menos `minMs` ms SOLO cuando hay una carga real.
 * Si los datos ya están en caché (isLoading=false desde el primer render),
 * devuelve false inmediatamente — sin delay artificial, sin skeleton innecesario.
 */
export function useMinDelay(isLoading: boolean, minMs = 380): boolean {
  // ¿Hubo una carga real en el montaje?
  const wasLoadingOnMount = useRef(isLoading);
  const [minElapsed, setMinElapsed] = useState(!isLoading); // si ya cargó, elapsed=true

  useEffect(() => {
    // Solo activar el timer si había carga real al montar
    if (!wasLoadingOnMount.current) return;
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Si no hubo carga real al montar: nunca mostrar skeleton
  if (!wasLoadingOnMount.current) return false;

  // Si hubo carga real: skeleton mientras carga O mientras no pasó el tiempo mínimo
  return isLoading || !minElapsed;
}
