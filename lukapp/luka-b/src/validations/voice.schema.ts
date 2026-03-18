import { z } from "zod";

/**
 * Esquemas Zod para validación de voz
 */

export const parseVoiceSchema = z.object({
  transcript: z
    .string()
    .min(1, "El transcript no puede estar vacío")
    .max(500, "Texto demasiado largo"),
  categories: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
      })
    )
    .optional(),
  accounts: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        type: z.string(),
      })
    )
    .optional(),
});

export type ParseVoiceInput = z.infer<typeof parseVoiceSchema>;
