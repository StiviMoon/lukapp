import { z } from "zod";
import { BudgetPeriod } from "@prisma/client";

/**
 * Esquemas Zod para validación de presupuestos
 */

export const budgetPeriodSchema = z.nativeEnum(BudgetPeriod);

const budgetBaseSchema = z.object({
  categoryId: z.string().uuid("ID de categoría inválido").optional(),
  amount: z
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(999999999.99, "Monto demasiado grande"),
  period: budgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const createBudgetSchema = budgetBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

// Schema para actualización (sin refine para evitar problemas con .partial())
const updateBudgetBaseSchema = budgetBaseSchema.partial();

// Schema completo para update con validación de fechas
export const updateBudgetSchema = updateBudgetBaseSchema.extend({
  id: z.string().uuid("ID inválido"),
}).refine(
  (data) => {
    // Solo validar fechas si ambas están presentes
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

// Schema para validar solo el body (sin ID y sin refinements)
export const updateBudgetBodySchema = updateBudgetBaseSchema.refine(
  (data) => {
    // Solo validar fechas si ambas están presentes
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

export const budgetIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type UpdateBudgetBodyInput = z.infer<typeof updateBudgetBodySchema>;
export type BudgetIdInput = z.infer<typeof budgetIdSchema>;

