"use client";

import { useProfile } from "./use-profile";

export type Currency = "COP" | "USD";

export function useCurrency() {
  const { data: profile } = useProfile();
  const currency: Currency = (profile?.currency as Currency) ?? "COP";

  function formatAmount(n: number): string {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n);
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(n);
  }

  function formatCompact(n: number): string {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (currency === "USD") {
      if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(1)}k`;
      return `${sign}$${abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2)}`;
    }
    // COP
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`;
    return `${sign}$${Math.round(abs).toLocaleString("es-CO")}`;
  }

  return { currency, formatAmount, formatCompact };
}
