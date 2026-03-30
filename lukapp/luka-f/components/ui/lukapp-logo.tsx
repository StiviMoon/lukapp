"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ─── Rutas SVG ────────────────────────────────────────────────────────────────
const ISOTIPO = {
  degradado: "/logos/isotipo%20lukapp_degradado-03.svg",
  blanco:    "/logos/isotipo%20lukapp_blanco-07.svg",
  negro:     "/logos/isotipo%20lukapp_negro-06.svg",
  morado:    "/logos/isotipo%20lukapp_morado-04.svg",
  verde:     "/logos/isotipo%20lukapp_verde-05.svg",
} as const;

const LOGOTIPO = {
  degradado: "/logos/logotipo%20lukapp_degradado.svg",
  blanco:    "/logos/logotipo%20lukapp_blanco.svg",
  negro:     "/logos/logotipo%20lukapp_negro.svg",
  morado:    "/logos/logotipo%20lukapp_morado.svg",
  verde:     "/logos/logotipo%20lukapp_verde.svg",
} as const;

// Ratio real del logotipo SVG: viewBox 835x400 ≈ 2.09:1
const LOGOTIPO_RATIO = 835 / 400;

// ─── Props ────────────────────────────────────────────────────────────────────
interface LukappLogoProps {
  /** "isotipo" = solo el símbolo | "logotipo" = símbolo + nombre */
  variant?: "isotipo" | "logotipo";
  /** Altura en px. El ancho se calcula por el ratio del SVG. */
  height?: number;
  /** Forzar una variante de color específica en lugar de la automática */
  color?: "degradado" | "blanco" | "negro" | "morado" | "verde" | "auto";
  className?: string;
  priority?: boolean;
}

/**
 * Logo oficial de lukapp.
 * - Por defecto usa el degradado (isotipo/logotipo degradado) en ambos modos.
 * - Con color="auto": dark → blanco, light → negro.
 * - El isotipo degradado funciona perfecto sobre fondos oscuros y claros.
 */
export function LukappLogo({
  variant = "isotipo",
  height = 32,
  color = "degradado",
  className,
  priority = false,
}: LukappLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Resolver qué color usar
  const resolvedColor =
    color === "auto"
      ? isDark ? "blanco" : "degradado"
      : color;

  const src =
    variant === "isotipo"
      ? ISOTIPO[resolvedColor]
      : LOGOTIPO[resolvedColor];

  const width =
    variant === "isotipo"
      ? height                     // cuadrado
      : Math.round(height * LOGOTIPO_RATIO);

  return (
    <Image
      src={src}
      alt="lukapp"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width: "auto", height, objectFit: "contain" }}
      unoptimized // SVGs no necesitan optimización de Next
    />
  );
}
