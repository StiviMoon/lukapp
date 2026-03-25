/**
 * Precios Premium — fuente única de verdad (COP, centavos).
 * El frontend puede mostrar estos valores vía GET /subscription/pricing;
 * el cobro siempre se calcula aquí en el servidor.
 */
export const PREMIUM_MONTHLY_CENTS = 1490000; // $14.900 COP
export const YEARLY_DISCOUNT_PERCENT = 33;    // $119.796 COP/año (~$9.983/mes equivalente)

export type BillingCycle = "MONTHLY" | "YEARLY";

export type PremiumPricing = {
  billingCycle: BillingCycle;
  baseAmountCents: number;
  finalAmountCents: number;
  discountPercent: number;
  durationDays: number;
  /** Precio mostrable por mes equivalente (anual / 12), solo informativo */
  equivalentMonthlyCents?: number;
};

export function computePremiumPricing(cycle: BillingCycle): PremiumPricing {
  if (cycle === "MONTHLY") {
    return {
      billingCycle: "MONTHLY",
      baseAmountCents: PREMIUM_MONTHLY_CENTS,
      finalAmountCents: PREMIUM_MONTHLY_CENTS,
      discountPercent: 0,
      durationDays: 30,
    };
  }

  const baseAmountCents = PREMIUM_MONTHLY_CENTS * 12;
  const finalAmountCents = Math.round(
    baseAmountCents * (1 - YEARLY_DISCOUNT_PERCENT / 100)
  );

  return {
    billingCycle: "YEARLY",
    baseAmountCents,
    finalAmountCents,
    discountPercent: YEARLY_DISCOUNT_PERCENT,
    durationDays: 365,
    equivalentMonthlyCents: Math.round(finalAmountCents / 12),
  };
}
