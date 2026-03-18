"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Contact } from "@/lib/types/shared";

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await api.contacts.getAll();
      if (!res.success) throw new Error(res.error?.message ?? "Error al cargar contactos");
      return (res.data ?? []) as Contact[];
    },
    staleTime: 30_000,
  });
}

export function useInviteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => api.contacts.invite(email),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useAcceptContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.contacts.accept(id),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useRemoveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.contacts.remove(id),
    onSuccess: (res) => {
      if (!res.success) return;
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
