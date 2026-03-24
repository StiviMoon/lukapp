"use client";

import { useProfile, type UserPlan } from "@/lib/hooks/use-profile";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";
import type { UserProfile } from "@/lib/hooks/use-profile";

/**
 * Hook principal de planes.
 * Expone el plan actual, si es Premium, y la mutación para cambiar de plan.
 */
export function usePlan() {
  const { data: profile, isLoading } = useProfile();

  const updatePlanMutation = useApiMutation<UserProfile, UserPlan>({
    mutationFn: (plan) => api.profile.updatePlan(plan) as Promise<any>,
    invalidateQueries: [["profile"]],
  });

  return {
    plan: profile?.plan ?? "FREE",
    isPremium: profile?.plan === "PREMIUM",
    isLoading,
    activatePremium: () => updatePlanMutation.mutate("PREMIUM"),
    deactivatePremium: () => updatePlanMutation.mutate("FREE"),
    isUpdating: updatePlanMutation.isPending,
  };
}
