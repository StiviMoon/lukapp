/**
 * Errores personalizados para la aplicación
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de autenticación (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "No autenticado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Error de autorización (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Error de validación",
    public errors?: Record<string, string[]>
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/**
 * Error de conflicto (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflicto de recursos") {
    super(message, 409, "CONFLICT");
  }
}

