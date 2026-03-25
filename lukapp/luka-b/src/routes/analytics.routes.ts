import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { financialAnalyticsService } from "@/services/financial-analytics.service";
import { profileRepository } from "@/repositories/profile.repository";
import { formatError } from "@/errors/error-handler";

const router = Router();
router.use(authenticate);

router.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const [summary, profile] = await Promise.all([
      financialAnalyticsService.getSummary(userId),
      profileRepository.findByUserId(userId),
    ]);

    const now = new Date();
    const isPremium =
      profile?.plan === "PREMIUM" &&
      profile?.planExpiresAt != null &&
      profile.planExpiresAt > now;

    // Datos base disponibles para todos los planes
    const data = {
      health: summary.health,
      today: summary.today,
      balances: {
        available: summary.balances.available,
        monthlyIncome: summary.balances.monthlyIncome,
        monthlyExpense: summary.balances.monthlyExpense,
        monthlyNet: summary.balances.monthlyNet,
        // Solo Premium
        ...(isPremium && {
          burnRateDaily: summary.balances.burnRateDaily,
          runwayDays: summary.balances.runwayDays,
        }),
      },
      forecast: {
        next30Days: summary.forecast.next30Days,
        // Solo Premium
        ...(isPremium && {
          next90Days: summary.forecast.next90Days,
          confidence: summary.forecast.confidence,
          trendDaily: summary.forecast.trendDaily,
        }),
      },
      // Solo Premium
      ...(isPremium && { alerts: summary.alerts }),
      debug: summary.debug,
    };

    res.setHeader("X-Analytics-Calc-Ms", String(summary.debug.calculationMs));
    res.setHeader("X-Analytics-Payload-Bytes", String(summary.debug.payloadBytes));
    res.json({ success: true, data });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

export default router;
