import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "@/auth/middleware";
import { subscriptionService } from "@/services/subscription.service";
import { profileRepository } from "@/repositories/profile.repository";
import { formatError } from "@/errors/error-handler";
import type { BillingCycle } from "@prisma/client";

const router = Router();

/**
 * GET /api/subscription/pricing
 * Público: precios mensual/anual calculados en servidor (sin JWT).
 */
router.get("/pricing", (_req: Request, res: Response) => {
  try {
    const data = subscriptionService.getPublicPricing();
    res.json({ success: true, data });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({ success: false, error: formattedError });
  }
});

router.use(authenticate);

const checkoutSchema = z.object({
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
});

/**
 * POST /api/subscription/checkout
 * Crea una transacción en Wompi y retorna la URL de pago.
 * Body: { billingCycle: "MONTHLY" | "YEARLY" }
 */
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { billingCycle } = checkoutSchema.parse(req.body);

    const profile = await profileRepository.findByUserId(userId);

    if (!profile) {
      res.status(404).json({ success: false, error: { message: "Perfil no encontrado" } });
      return;
    }

    if (profile.plan === "PREMIUM" && profile.planExpiresAt && profile.planExpiresAt > new Date()) {
      res.status(409).json({
        success: false,
        error: { message: "Ya tienes un plan Premium activo" },
      });
      return;
    }

    const result = await subscriptionService.createCheckout(
      userId,
      profile.email,
      billingCycle as BillingCycle
    );
    res.json({ success: true, data: result });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({ success: false, error: formattedError });
  }
});

/**
 * GET /api/subscription/status
 * Devuelve el estado de la suscripción activa del usuario.
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const subscription = await subscriptionService.getActiveSubscription(req.userId!);
    res.json({ success: true, data: subscription ?? null });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({ success: false, error: formattedError });
  }
});

/**
 * DELETE /api/subscription/cancel
 * Cancela la renovación automática. El plan sigue activo hasta planExpiresAt.
 */
router.delete("/cancel", async (req: Request, res: Response) => {
  try {
    await subscriptionService.cancelAutoRenew(req.userId!);
    res.json({ success: true, data: { message: "Renovación automática cancelada. Tu plan sigue activo hasta su fecha de vencimiento." } });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({ success: false, error: formattedError });
  }
});

export default router;
