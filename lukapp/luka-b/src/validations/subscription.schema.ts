import { z } from "zod";

export const billingCycleSchema = z.enum(["MONTHLY", "YEARLY"]);

export const subscriptionCheckoutSchema = z.object({
  billingCycle: billingCycleSchema,
});

export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutSchema>;
