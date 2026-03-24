import { z } from "zod";

const coachMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "El mensaje no puede estar vacio")
    .max(600, "El mensaje es demasiado largo"),
});

export const coachChatSchema = z.object({
  messages: z
    .array(coachMessageSchema)
    .min(1, "messages requerido")
    .max(20, "Maximo 20 mensajes por request"),
});

export type CoachChatInput = z.infer<typeof coachChatSchema>;
