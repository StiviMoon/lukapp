import { Request, Response, NextFunction } from "express";
import { AppError } from "@/errors";
import { formatError } from "@/errors/error-handler";

/**
 * Middleware de manejo de errores global
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = formatError(err);

  // Log del error en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Respuesta de error
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.errors && { errors: error.errors }),
    },
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    },
  });
};

