import test from "node:test";
import assert from "node:assert/strict";
import {
  PREMIUM_MONTHLY_CENTS,
  YEARLY_DISCOUNT_PERCENT,
  computePremiumPricing,
} from "@/config/premium-pricing";

test("computePremiumPricing MONTHLY: sin descuento y 30 días", () => {
  const p = computePremiumPricing("MONTHLY");
  assert.equal(p.billingCycle, "MONTHLY");
  assert.equal(p.baseAmountCents, PREMIUM_MONTHLY_CENTS);
  assert.equal(p.finalAmountCents, PREMIUM_MONTHLY_CENTS);
  assert.equal(p.discountPercent, 0);
  assert.equal(p.durationDays, 30);
});

test("computePremiumPricing YEARLY: 10% sobre 12 meses y 365 días", () => {
  const p = computePremiumPricing("YEARLY");
  const base = PREMIUM_MONTHLY_CENTS * 12;
  const expectedFinal = Math.round(
    base * (1 - YEARLY_DISCOUNT_PERCENT / 100)
  );

  assert.equal(p.billingCycle, "YEARLY");
  assert.equal(p.baseAmountCents, base);
  assert.equal(p.finalAmountCents, expectedFinal);
  assert.equal(p.discountPercent, 10);
  assert.equal(p.durationDays, 365);
  assert.equal(p.equivalentMonthlyCents, Math.round(expectedFinal / 12));
});
