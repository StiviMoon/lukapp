import { z } from "zod";

export const inviteContactSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const contactIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type InviteContactInput = z.infer<typeof inviteContactSchema>;
export type ContactIdInput = z.infer<typeof contactIdSchema>;
