import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "@/auth/middleware";
import { profileRepository } from "@/repositories/profile.repository";
import { formatError } from "@/errors/error-handler";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).optional(),
});

/**
 * GET /api/profile
 * Retorna el perfil completo del usuario autenticado (incluye plan y onboarding)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await profileRepository.findByUserId(userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

/**
 * PUT /api/profile
 * Actualiza nombre y/o moneda del perfil
 */
router.put("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: "Datos inválidos", details: parsed.error.flatten() },
      });
      return;
    }

    const profile = await profileRepository.update(userId, parsed.data);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

/**
 * POST /api/profile/onboarding/complete
 * Marca el onboarding como completado para el usuario autenticado
 */
router.post("/onboarding/complete", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await profileRepository.completeOnboarding(userId);

    res.json({
      success: true,
      data: profile,
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
