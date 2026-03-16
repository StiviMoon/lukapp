import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/errors";

/**
 * Middleware para validar el body de la request con Zod
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        next(
          new ValidationError("Error de validación en el body", errors)
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware para validar los query params con Zod
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        next(
          new ValidationError("Error de validación en los query params", errors)
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware para validar los params de la URL con Zod
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        next(
          new ValidationError("Error de validación en los params", errors)
        );
      } else {
        next(error);
      }
    }
  };
};

