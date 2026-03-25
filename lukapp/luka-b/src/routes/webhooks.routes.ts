import { Router, Request, Response } from "express";
import { subscriptionService } from "@/services/subscription.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

function getRawBody(req: Request): string {
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }
  if (typeof req.body === "string") {
    return req.body;
  }
  return "";
}

function getEventsChecksum(req: Request): string | undefined {
  const h = req.headers;
  const a = h["x-events-checksum"];
  const b = h["x-event-checksum"];
  const v = (Array.isArray(a) ? a[0] : a) ?? (Array.isArray(b) ? b[0] : b);
  return typeof v === "string" ? v : undefined;
}

/**
 * POST /api/webhooks/wompi
 * Debe montarse con express.raw({ type: "application/json" }) para validar el checksum.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const rawBody = getRawBody(req);
    const checksum = getEventsChecksum(req);

    await subscriptionService.handleWebhook(rawBody, undefined, checksum);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Webhook Wompi] Error:", error);
    const formatted = formatError(error);
    res.status(formatted.statusCode).json({ received: false, error: formatted });
  }
});

export default router;
