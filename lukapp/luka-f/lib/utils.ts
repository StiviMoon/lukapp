import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORY_COLORS = [
  "#7C6FCD", "#4ABFA3", "#E8794A", "#D95F7F",
  "#5B8DD9", "#8BC34A", "#F4C542", "#A16AE8",
  "#4BBFBF", "#E85454",
] as const;

export function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formato compacto para espacios reducidos (cards, badges).
 * $2M, $1.5M, $600K, $85K, $950
 */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const str = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${sign}$${str}M`;
  }
  if (abs >= 1_000) {
    const val = Math.round(abs / 1_000);
    return `${sign}$${val}K`;
  }
  return `${sign}$${Math.round(abs).toLocaleString("es-CO")}`;
}
