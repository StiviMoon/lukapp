import { z } from "zod";
import { TransactionType, Periodicity } from "@prisma/client";

/**
 * Esquemas Zod para validación de transacciones
 */

export const transactionTypeSchema = z.nativeEnum(TransactionType);

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("ID de cuenta inválido"),
  categoryId: z.string().uuid("ID de categoría inválido").optional(),
  type: transactionTypeSchema,
  amount: z
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(999999999.99, "Monto demasiado grande"),
  description: z.string().max(500).optional(),
  date: z.coerce.date().default(() => new Date()).optional(),
  periodicity: z.nativeEnum(Periodicity).default("ONCE").optional(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .extend({
    id: z.string().uuid("ID inválido"),
  });

export const transactionIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const getTransactionsSchema = z.object({
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  categoryId: z.string().uuid("ID de categoría inválido").optional(),
  type: transactionTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionIdInput = z.infer<typeof transactionIdSchema>;
export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;

