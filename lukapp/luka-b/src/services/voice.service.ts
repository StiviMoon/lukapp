import Groq from "groq-sdk";
import { AppError } from "@/errors/app-error";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ParsedTransaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  suggestedCategoryName: string;
  categoryId: string | null;
  description: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Servicio para interpretar transcripts de voz con Groq (Llama 3.3 70B) — gratis
 */
export class VoiceService {
  async parseTranscript(
    transcript: string,
    categories?: Array<{ id: string; name: string; type: string }>
  ): Promise<ParsedTransaction> {
    const categoryContext =
      categories && categories.length > 0
        ? `\nCategorías disponibles del usuario:\n${categories
            .map((c) => `- ID: ${c.id}, Nombre: "${c.name}", Tipo: ${c.type}`)
            .join("\n")}`
        : "";

    const prompt = `Eres un asistente financiero que extrae información de transacciones en español colombiano.

El usuario dijo: "${transcript}"
${categoryContext}

Extrae la información de la transacción y responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "type": "INCOME" o "EXPENSE",
  "amount": <número positivo sin símbolos de moneda>,
  "suggestedCategoryName": "<categoría en español>",
  "categoryId": "<UUID de la categoría si coincide con las disponibles, o null>",
  "description": "<descripción corta y limpia en español>",
  "confidence": "high" o "medium" o "low"
}

Reglas para el monto:
- "mil" = 1000, "dos mil" = 2000, "50 mil" = 50000
- "un millón" = 1000000, "2 millones" = 2000000
- Si hay símbolo $ o COP, ignóralo y solo toma el número
- El monto SIEMPRE es positivo

Reglas para el tipo:
- "gasté", "pagué", "compré", "me costó", "débito", "saqué" → EXPENSE
- "recibí", "me pagaron", "ingresé", "salario", "sueldo", "cobré", "gané" → INCOME

Reglas para la categoría:
- Si hay categorías disponibles, intenta coincidir el categoryId exacto
- Si no hay coincidencia exacta, pon null en categoryId
- Siempre rellena suggestedCategoryName con una categoría en español
- Ejemplos: "comida"→Alimentación, "bus"/"transporte"→Transporte, "salario"→Salario, "arriendo"→Vivienda

Reglas de confianza:
- "high": monto claro, tipo claro
- "medium": monto aproximado o tipo inferido por contexto
- "low": monto o tipo ambiguos

Responde SOLO el JSON, sin texto adicional, sin markdown, sin bloques de código.`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        temperature: 0.1, // baja temperatura para respuestas más consistentes
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!text) {
        throw new AppError("Respuesta vacía del asistente", 500, "AI_ERROR");
      }

      // Extraer JSON aunque venga con texto extra
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError(
          "No pude interpretar la respuesta del asistente",
          500,
          "AI_PARSE_ERROR"
        );
      }

      const parsed = JSON.parse(jsonMatch[0]) as ParsedTransaction;

      if (
        !parsed.type ||
        !["INCOME", "EXPENSE"].includes(parsed.type) ||
        !parsed.amount ||
        parsed.amount <= 0
      ) {
        throw new AppError(
          "No pude entender el monto de la transacción",
          422,
          "PARSE_ERROR"
        );
      }

      return parsed;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof SyntaxError) {
        throw new AppError(
          "No pude interpretar la respuesta del asistente",
          500,
          "AI_PARSE_ERROR"
        );
      }
      throw new AppError(
        "Error al procesar con inteligencia artificial",
        503,
        "AI_UNAVAILABLE"
      );
    }
  }
}

export const voiceService = new VoiceService();
