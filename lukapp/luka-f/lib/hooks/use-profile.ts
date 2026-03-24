"use client";

import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";

export type UserPlan = "FREE" | "PREMIUM";

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  currency: string;
  plan: UserPlan;
  planActivatedAt: string | null;
  planExpiresAt: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene el perfil completo del usuario autenticado.
 * Incluye plan (FREE/PREMIUM) y estado de onboarding.
 */
export function useProfile() {
  return useApiQuery<UserProfile>({
    queryKey: ["profile"],
    endpoint: "/profile",
    staleTime: 5 * 60_000, // plan y onboarding cambian muy raramente
  });
}

/**
 * Muta el nombre o moneda del perfil.
 */
export function useUpdateProfile() {
  return useApiMutation<UserProfile, { fullName?: string; currency?: string }>({
    mutationFn: (data) => api.profile.update(data) as Promise<any>,
    successMessage: "Perfil actualizado",
    invalidateQueries: [["profile"]],
  });
}

/**
 * Completa el onboarding del usuario.
 */
export function useCompleteOnboarding() {
  return useApiMutation<UserProfile, void>({
    mutationFn: () => api.profile.completeOnboarding() as Promise<any>,
    invalidateQueries: [["profile"]],
  });
}
