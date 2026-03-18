"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import { api } from "@/lib/api/client";
import type { BudgetStatus, CreateBudgetPayload } from "@/lib/types/budget";

export function useBudgetStatus() {
  return useQuery<BudgetStatus[]>({
    queryKey: ["budgets", "status"],
    queryFn: async () => {
      const res = await api.budgets.getStatus();
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar presupuestos");
      return (res.data ?? []) as BudgetStatus[];
    },
    staleTime: 30_000,
  });
}

export function useInvalidateBudgets() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["budgets"] }),
      qc.invalidateQueries({ queryKey: ["budgets", "status"] }),
    ]);
}

export function currentMonthRange() {
  const now = new Date();
  return {
    startDate: startOfMonth(now).toISOString(),
    endDate: endOfMonth(now).toISOString(),
  };
}

export function useCreateBudget() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: (data: CreateBudgetPayload) => api.budgets.create(data),
    onSuccess: async (res) => {
      if (!res.success) return;
      await invalidate();
    },
  });
}

export function useUpdateBudget() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: ({ id, ...data }: CreateBudgetPayload & { id: string }) =>
      api.budgets.update(id, data),
    onSuccess: async (res) => {
      if (!res.success) return;
      await invalidate();
    },
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: (id: string) => api.budgets.delete(id),
    onSuccess: async (res) => {
      if (!res.success) return;
      await invalidate();
    },
  });
}
