import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { pushService } from "@/services/push.service";

const router = Router();

router.use(authenticate);

/**
 * GET /api/push/vapid-key
 * Retorna la VAPID public key para suscripciones push
 */
router.get("/vapid-key", (_req: Request, res: Response) => {
  const key = pushService.getVapidPublicKey();
  res.json({ success: true, data: { key } });
});

/**
 * POST /api/push/subscribe
 * Guarda la suscripción push del usuario
 */
router.post("/subscribe", async (req: Request, res: Response): Promise<void> => {
  const { endpoint, p256dh, auth } = req.body;
  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ success: false, error: { message: "Datos de suscripción inválidos" } });
    return;
  }
  await pushService.subscribe(req.userId!, { endpoint, p256dh, auth });
  res.json({ success: true });
});

/**
 * DELETE /api/push/subscribe
 * Elimina la suscripción push del usuario
 */
router.delete("/subscribe", async (req: Request, res: Response): Promise<void> => {
  const { endpoint } = req.body;
  if (!endpoint) {
    res.status(400).json({ success: false, error: { message: "Endpoint requerido" } });
    return;
  }
  await pushService.unsubscribe(endpoint);
  res.json({ success: true });
});

export default router;
