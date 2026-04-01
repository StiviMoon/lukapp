import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requirePremium } from "@/auth/middleware";
import { coachService } from "@/services/coach.service";
import { validateBody } from "@/middleware/validation";
import { createRateLimiter } from "@/middleware/rate-limit";
import { coachChatSchema } from "@/validations/coach.schema";

const router = Router();
router.use(authenticate);
const coachLimiter = createRateLimiter(20, 60_000);

/**
 * GET /api/coach/insight
 * Retorna el insight del día (cacheado o generado en el momento).
 * Disponible para todos los planes.
 */
router.get("/insight", requirePremium, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await coachService.getOrGenerateInsight(req.userId!);
    res.json({ success: true, data: { content } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/coach/suggestions
 * Retorna 5 preguntas sugeridas contextuales basadas en el estado financiero del usuario.
 * Solo Premium.
 */
router.get("/suggestions", requirePremium, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suggestions = await coachService.getSuggestions(req.userId!);
    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/coach/chat
 * Chat en streaming con el Coach IA. Solo plan Premium.
 *
 * Body: { messages: { role: "user" | "assistant", content: string }[] }
 * Response: Server-Sent Events con chunks de texto
 */
router.post("/chat", requirePremium, coachLimiter, validateBody(coachChatSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, error: { message: "messages requerido" } });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // desactiva buffering en nginx
    res.flushHeaders();

    for await (const chunk of coachService.streamChat(req.userId!, messages)) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[coach/chat] Error:", msg);
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/coach/history
 * Retorna el historial de chat persistido (últimos 40 mensajes).
 */
router.get("/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await coachService.getChatHistory(req.userId!);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/coach/history
 * Guarda un mensaje en el historial.
 * Body: { role: "user" | "assistant", content: string }
 */
router.post("/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, content } = req.body as { role: "user" | "assistant"; content: string };
    if (!role || !content || !["user", "assistant"].includes(role)) {
      res.status(400).json({ success: false, error: { message: "role y content son requeridos" } });
      return;
    }
    const message = await coachService.saveChatMessage(req.userId!, role, content);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/coach/history
 * Elimina todo el historial de chat del usuario.
 */
router.delete("/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await coachService.clearChatHistory(req.userId!);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
