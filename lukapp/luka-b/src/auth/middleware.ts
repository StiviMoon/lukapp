import { Request, Response, NextFunction } from "express";
import { createSupabaseClient } from "./supabase";
import { UnauthorizedError } from "@/errors";

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

