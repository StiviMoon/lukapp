import { z } from "zod";
import { AccountType } from "@prisma/client";

/**
 * Esquemas Zod para validación de cuentas
 */

export const accountTypeSchema = z.nativeEnum(AccountType);

export const createAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  type: accountTypeSchema,
  balance: z.number().min(0).default(0).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido").optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().uuid("ID inválido"),
});

export const accountIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountIdInput = z.infer<typeof accountIdSchema>;

