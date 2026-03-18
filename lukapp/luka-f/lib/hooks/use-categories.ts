"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Category } from "@/lib/types/budget";

export function useCategories(type?: "INCOME" | "EXPENSE") {
  return useQuery<Category[]>({
    queryKey: type ? ["categories", type] : ["categories"],
    queryFn: async () => {
      const res = await api.categories.getAll(type ? { type } : undefined);
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar categorías");
      return (res.data ?? []) as Category[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      color?: string | null;
      icon?: string | null;
    }) => api.categories.create(data),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      name?: string;
      color?: string | null;
      icon?: string | null;
    }) => api.categories.update(id, data),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
