import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { financialAnalyticsService } from "@/services/financial-analytics.service";
import { formatError } from "@/errors/error-handler";

const router = Router();
router.use(authenticate);

router.get("/summary", async (req: Request, res: Response) => {
  try {
    const summary = await financialAnalyticsService.getSummary(req.userId!);
    res.setHeader("X-Analytics-Calc-Ms", String(summary.debug.calculationMs));
    res.setHeader("X-Analytics-Payload-Bytes", String(summary.debug.payloadBytes));
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

export default router;
