import { z } from "zod";

export const createSpaceSchema = z.object({
  contactId: z.string().uuid("ID de contacto inválido"),
  name: z.string().max(60, "Nombre demasiado largo").optional(),
});

export const updateSalarySchema = z.object({
  salary: z.number().positive("El salario debe ser mayor a 0"),
});

export const createSharedBudgetSchema = z.object({
  categoryName: z.string().min(1, "El nombre es requerido").max(80, "Nombre demasiado largo"),
  percentage: z.number().min(1, "El porcentaje debe ser al menos 1").max(100, "El porcentaje no puede superar 100"),
});

export const updateSharedBudgetSchema = createSharedBudgetSchema.partial();

export const addSharedTransactionSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  sharedBudgetId: z.string().uuid("ID de presupuesto inválido").optional(),
  description: z.string().max(255).optional(),
  date: z.coerce.date().optional(),
});

export const updateSharedTransactionSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0").optional(),
  sharedBudgetId: z.string().uuid("ID de presupuesto inválido").nullable().optional(),
  description: z.string().max(255).nullable().optional(),
});

export const spaceIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const spaceBudgetParamsSchema = z.object({
  id: z.string().uuid("ID inválido"),
  budgetId: z.string().uuid("ID de presupuesto inválido"),
});

export const spaceTxParamsSchema = z.object({
  id: z.string().uuid("ID inválido"),
  txId: z.string().uuid("ID de transacción inválido"),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
export type CreateSharedBudgetInput = z.infer<typeof createSharedBudgetSchema>;
export type UpdateSharedBudgetInput = z.infer<typeof updateSharedBudgetSchema>;
export type AddSharedTransactionInput = z.infer<typeof addSharedTransactionSchema>;
export type UpdateSharedTransactionInput = z.infer<typeof updateSharedTransactionSchema>;
