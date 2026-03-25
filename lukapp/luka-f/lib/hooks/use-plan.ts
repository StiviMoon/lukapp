"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api/client";

/**
 * Hook principal de planes.
 * Expone el plan actual, si es Premium, y la mutación para cancelar renovación.
 *
 * IMPORTANTE: No hay "downgrade instantáneo" — cuando el usuario cancela,
 * el plan sigue ACTIVO hasta planExpiresAt. Solo se desactiva el auto-renew.
 */
export function usePlan() {
  const { data: profile, isLoading } = useProfile();

  const cancelMutation = useApiMutation<void, void>({
    mutationFn: () => api.subscription.cancelAutoRenew() as Promise<any>,
    invalidateQueries: [["profile"], ["subscription-status"]],
  });

  return {
    plan:      profile?.plan ?? "FREE",
    isPremium: profile?.plan === "PREMIUM",
    isLoading,
    cancelSubscription: () => cancelMutation.mutate(),
    isCancelling: cancelMutation.isPending,
  };
}
