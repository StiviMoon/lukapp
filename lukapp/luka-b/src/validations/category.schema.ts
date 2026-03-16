import { z } from "zod";
import { TransactionType } from "@prisma/client";

/**
 * Esquemas Zod para validación de categorías
 */

export const transactionTypeSchema = z.nativeEnum(TransactionType);

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  type: transactionTypeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido").optional(),
  icon: z.string().max(50).optional(),
  isDefault: z.boolean().default(false).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid("ID inválido"),
});

export const categoryIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdInput = z.infer<typeof categoryIdSchema>;

