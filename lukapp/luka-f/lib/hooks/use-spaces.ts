"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { SharedSpace, SpaceStatusResponse, SharedTransaction, SharedOverview } from "@/lib/types/shared";

export function useMySpaces() {
  return useQuery<SharedSpace[]>({
    queryKey: ["spaces"],
    queryFn: async () => {
      const res = await api.spaces.getAll();
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar salas");
      return (res.data ?? []) as SharedSpace[];
    },
    staleTime: 30_000,
  });
}

export function useSpaceStatus(id: string) {
  return useQuery<SpaceStatusResponse>({
    queryKey: ["spaces", id, "status"],
    queryFn: async () => {
      const res = await api.spaces.getStatus(id);
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar estado");
      return res.data as SpaceStatusResponse;
    },
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useSpaceTransactions(id: string) {
  return useQuery<SharedTransaction[]>({
    queryKey: ["spaces", id, "transactions"],
    queryFn: async () => {
      const res = await api.spaces.getTransactions(id);
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar transacciones");
      return (res.data ?? []) as SharedTransaction[];
    },
    enabled: !!id,
  });
}

export function useSharedOverview() {
  return useQuery<SharedOverview>({
    queryKey: ["spaces", "overview"],
    queryFn: async () => {
      const res = await api.spaces.getOverview();
      if (!res.success) throw new Error(res.error?.message ?? "Error");
      return res.data as SharedOverview;
    },
    staleTime: 60_000,
  });
}

export function useCreateSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contactId: string; name?: string }) => api.spaces.create(data),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useUpdateSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, salary }: { id: string; salary: number }) =>
      api.spaces.updateSalary(id, salary),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
      qc.invalidateQueries({ queryKey: ["spaces", "overview"] });
    },
  });
}

export function useCreateSharedBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { categoryName: string; percentage: number } }) =>
      api.spaces.createBudget(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
    },
  });
}

export function useDeleteSharedBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, budgetId }: { id: string; budgetId: string }) =>
      api.spaces.deleteBudget(id, budgetId),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
    },
  });
}

export function useAddSharedTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { amount: number; sharedBudgetId?: string; description?: string; date?: string };
    }) => api.spaces.addTransaction(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces", id, "transactions"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
      qc.invalidateQueries({ queryKey: ["spaces", "overview"] });
    },
  });
}

export function useUpdateSharedTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      txId,
      data,
    }: {
      id: string;
      txId: string;
      data: { amount?: number; sharedBudgetId?: string | null; description?: string | null };
    }) => api.spaces.updateTransaction(id, txId, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces", id, "transactions"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
      qc.invalidateQueries({ queryKey: ["spaces", "overview"] });
    },
  });
}

export function useRequestSpaceDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.spaces.requestDeletion(id),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["spaces", id] });
      qc.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useCancelSpaceDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.spaces.cancelDeletion(id),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["spaces", id] });
      qc.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useConfirmSpaceDeletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.spaces.confirmDeletion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useDeleteSharedTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, txId }: { id: string; txId: string }) =>
      api.spaces.deleteTransaction(id, txId),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["spaces", id, "transactions"] });
      qc.invalidateQueries({ queryKey: ["spaces", id, "status"] });
      qc.invalidateQueries({ queryKey: ["spaces", "overview"] });
    },
  });
}
