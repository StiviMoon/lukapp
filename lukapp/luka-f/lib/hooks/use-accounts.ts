"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Account } from "@/lib/types/transaction";

export function useAccounts(includeInactive = false) {
  return useQuery<Account[]>({
    queryKey: includeInactive ? ["accounts", "all"] : ["accounts"],
    queryFn: async () => {
      const res = await api.accounts.getAll(includeInactive ? { includeInactive: true } : undefined);
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar cuentas");
      return (res.data ?? []) as Account[];
    },
    staleTime: 60_000,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type: string;
      balance?: number;
      color?: string | null;
      icon?: string | null;
    }) => api.accounts.create(data),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      name?: string;
      type?: string;
      color?: string | null;
      icon?: string | null;
    }) => api.accounts.update(id, data),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.accounts.delete(id),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
