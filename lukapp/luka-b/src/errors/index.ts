/**
 * Índice de exportaciones para manejo de errores
 */

export {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "./app-error";

export { formatError, handleError, type Result } from "./error-handler";

