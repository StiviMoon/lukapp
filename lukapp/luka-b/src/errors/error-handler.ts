import { AppError, ValidationError } from "./app-error";

/**
 * Resultado de una operación que puede fallar
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Wrapper para manejar errores en funciones async
 */
export const handleError = <T>(
  fn: () => Promise<T>
): Promise<Result<T, AppError>> => {
  return fn()
    .then((data) => ({ success: true, data } as const))
    .catch((error) => ({
      success: false,
      error:
        error instanceof AppError
          ? error
          : new AppError(
              error?.message ?? "Error desconocido",
              500,
              "INTERNAL_ERROR"
            ),
    }));
};

/**
 * Formatea un error para respuesta
 */
export const formatError = (error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
} => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      ...(error instanceof ValidationError && { errors: error.errors }),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    message: "Error desconocido",
    statusCode: 500,
    code: "INTERNAL_ERROR",
  };
};

