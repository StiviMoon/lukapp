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
    mutationFn: (data: { name: string; targetAmount: number; savedAmount?: number; emoji?: string; deadline?: string }) =>
      api.savingGoals.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}

export function useUpdateSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; savedAmount?: number; name?: string; targetAmount?: number; emoji?: string; deadline?: string; completed?: boolean }) =>
      api.savingGoals.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}

export function useDeleteSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.savingGoals.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saving-goals"] }),
  });
}
