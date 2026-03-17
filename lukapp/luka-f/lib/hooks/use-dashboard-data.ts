"use client";

import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import { api } from "@/lib/api/client";
import type { Transaction, TransactionStats } from "@/lib/types/transaction";

// ─── Total balance ────────────────────────────────────────────────────────────

export function useTotalBalance() {
  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const res = await api.accounts.getTotalBalance();
      if (!res.success || res.data === undefined) {
        throw new Error(res.error?.message ?? "Error obteniendo balance");
      }
      return (res.data as { total: number }).total;
    },
    staleTime: 30_000,
  });
}

// ─── Month stats ──────────────────────────────────────────────────────────────

export function useMonthStats() {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  return useQuery({
    queryKey: ["stats", "month"],
    queryFn: async () => {
      const res = await api.transactions.getStats({ startDate, endDate });
      if (!res.success || res.data === undefined) {
        throw new Error(res.error?.message ?? "Error obteniendo estadísticas");
      }
      return res.data as TransactionStats;
    },
    staleTime: 30_000,
  });
}

// ─── Recent transactions ──────────────────────────────────────────────────────

export function useRecentTransactions(limit = 20) {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.transactions.getAll({ limit });
      if (!res.success || res.data === undefined) {
        throw new Error(res.error?.message ?? "Error obteniendo transacciones");
      }
      return res.data as Transaction[];
    },
    staleTime: 30_000,
  });
}
