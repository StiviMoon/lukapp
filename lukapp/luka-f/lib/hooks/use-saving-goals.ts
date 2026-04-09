"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: string;
  savedAmount: string;
  emoji: string | null;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
}

export function useSavingGoals() {
  return useQuery<SavingGoal[]>({
    queryKey: ["saving-goals"],
    queryFn: async () => {
      const res = await api.savingGoals.getAll();
      if (!res.success) throw new Error(res.error?.message ?? "Error");
      return (res.data ?? []) as SavingGoal[];
    },
    staleTime: 30_000,
  });
}

export function useCreateSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      targetAmount: number;
      savedAmount?: number;
      emoji?: string;
      deadline?: string;
    }) => {
      const res = await api.savingGoals.create(data);
      if (!res.success) throw new Error(res.error?.message ?? "No se pudo crear la meta");
      return res.data;
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["saving-goals"] }),
        qc.invalidateQueries({ queryKey: ["budget-projection"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "summary"] }),
      ]),
  });
}

export function useUpdateSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      savedAmount?: number;
      name?: string;
      targetAmount?: number;
      emoji?: string;
      deadline?: string;
      completed?: boolean;
    }) => {
      const res = await api.savingGoals.update(id, data);
      if (!res.success) throw new Error(res.error?.message ?? "No se pudo actualizar la meta");
      return res.data;
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["saving-goals"] }),
        qc.invalidateQueries({ queryKey: ["budget-projection"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "summary"] }),
      ]),
  });
}

export function useDeleteSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.savingGoals.delete(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["saving-goals"] }),
        qc.invalidateQueries({ queryKey: ["budget-projection"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "summary"] }),
      ]),
  });
}
