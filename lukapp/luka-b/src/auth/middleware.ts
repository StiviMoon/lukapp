import { Request, Response, NextFunction } from "express";
import { createSupabaseClient } from "./supabase";
import { UnauthorizedError, ForbiddenError } from "@/errors";
import { profileRepository } from "@/repositories/profile.repository";

/**
 * Extiende Request para incluir userId
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware de autenticación para Express
 * Verifica el token de acceso de Supabase en el header Authorization
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token de autenticación requerido");
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token con Supabase
    const supabase = createSupabaseClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError("Token inválido o expirado");
    }

    // Agregar userId y user al request
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
    };

    // Garantizar que el perfil exista en la BD (upsert silencioso)
    // Necesario porque Supabase crea el usuario en auth.users pero no
    // en la tabla Profile de Prisma. Sin esto, crear cuentas/transacciones falla.
    if (user.email) {
      await profileRepository.upsert(user.id, user.email);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware que requiere plan Premium activo
 * Usar después de `authenticate`
 */
export const requirePremium = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const profile = await profileRepository.findByUserId(userId);

    const now = new Date();
    const isPremiumActive =
      profile?.plan === "PREMIUM" &&
      (!profile.planExpiresAt || profile.planExpiresAt > now);

    if (!isPremiumActive) {
      throw new ForbiddenError("Esta función requiere el plan Premium");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token, verifica; si no, continúa sin userId
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const supabase = createSupabaseClient(token);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        req.userId = user.id;
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin autenticación
    next();
  }
};

