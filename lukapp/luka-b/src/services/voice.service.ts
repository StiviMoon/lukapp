import Groq from "groq-sdk";
import { AppError } from "@/errors/app-error";

function extractJSON(text: string): ParsedTransaction[] | null {
  const stripped = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const arrayMatch = stripped.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch {}
  }

  const objMatch = stripped.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(`[${objMatch[0]}]`); } catch {}
  }

  try {
    const parsed = JSON.parse(stripped);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {}

  return null;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ParsedTransaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  suggestedCategoryName: string;
  categoryId: string | null;
  accountId: string | null;
  description: string;
  confidence: "high" | "medium" | "low";
}

// Categorías base para el contexto de la IA (Colombia / LatAm)
const BASE_CATEGORIES = `
GASTOS comunes (EXPENSE):
- Alimentación: comida, almuerzo, desayuno, cena, restaurante, domicilio, mercado, supermercado, snack, bebida, tinto, café, rappi, ifood
- Transporte: bus, SITP, taxi, Uber, Didi, gasolina, metro, tren, peaje, parqueadero, moto, bicicleta
- Vivienda: arriendo, alquiler, agua, luz, gas, internet, cable, administración, conjunto, servicios públicos
- Salud: médico, farmacia, droga, droguería, cita médica, examen, EPS, medicina, medicamento, hospital, clínica, dentista, óptica
- Educación: universidad, colegio, curso, libro, útiles, matrícula, pensión, carrera, capacitación, certificado
- Entretenimiento: cine, Netflix, Spotify, YouTube, videojuego, concierto, streaming, Disney+, HBO, Prime, bar, trago, rumba, parque
- Ropa y calzado: ropa, zapatos, tenis, accesorios, vestido, camisa, pantalón, maleta, bolso, jean
- Tecnología: celular, computador, laptop, tablet, electrónico, software, app, recarga, plan datos, minutos
- Deudas y cuotas: crédito, cuota, préstamo, intereses, tarjeta de crédito, cuota banco, deuda
- Mascotas: veterinario, concentrado, vacuna mascota, accesorios mascota, perro, gato
- Cuidado personal: peluquería, barbería, spa, belleza, gimnasio, gym, cosmético, perfume
- Hogar: mueble, electrodoméstico, decoración, limpieza, aseo, detergente, escoba
- Regalos: regalo, detalle, flores, presente
- Otros gastos: varios, otro gasto, misceláneo

INGRESOS comunes (INCOME):
- Salario: sueldo, salario, nómina, quincena, pago mensual, pago del trabajo, me pagaron del trabajo
- Freelance: proyecto, cliente, trabajo independiente, honorarios, consultoría, me pagaron por trabajo
- Ventas: vendí, venta, negocio, mercancía, artículo vendido
- Inversiones: dividendos, rendimientos, intereses, CDT, acciones, cripto, retorno
- Préstamo recibido: me prestaron, préstamo, crédito recibido
- Regalo recibido: me regalaron, regalo de dinero, mesada, propina
- Reembolso: me devolvieron, reembolso, devolución, reintegro, cashback
- Arriendo cobrado: cobré arriendo, inquilino pagó
- Otros ingresos: ingreso extra, bonificación, prima, auxilio`.trim();

export class VoiceService {
  async parseTranscript(
    transcript: string,
    categories?: Array<{ id: string; name: string; type: string }>,
    accounts?: Array<{ id: string; name: string; type: string }>
  ): Promise<ParsedTransaction[]> {
    const userCategories =
      categories && categories.length > 0
        ? `\nCategorías existentes del usuario (priorizar estas si coinciden):\n${categories
            .map((c) => `- ID: ${c.id} | Nombre: "${c.name}" | Tipo: ${c.type}`)
            .join("\n")}`
        : "\n(El usuario aún no tiene categorías propias — usar las categorías base)";

    const userAccounts =
      accounts && accounts.length > 0
        ? `\nCuentas del usuario (si el usuario menciona alguna, usar su ID en accountId):\n${accounts
            .map((a) => `- ID: ${a.id} | Nombre: "${a.name}" | Tipo: ${a.type}`)
            .join("\n")}`
        : "\n(El usuario no tiene cuentas configuradas — accountId: null)";

    const prompt = `Eres un asistente financiero experto en gastos e ingresos de Colombia y Latinoamérica.
Analiza lo que dijo el usuario y extrae UNA O VARIAS transacciones financieras.

Usuario dijo: "${transcript}"
${userCategories}
${userAccounts}

Referencia de categorías base:
${BASE_CATEGORIES}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown.
Debe ser SIEMPRE un array (lista) de transacciones. Si el usuario mencionó 1 movimiento, devuelve un array con 1 elemento.
Formato:
[
  {
    "type": "INCOME" o "EXPENSE",
    "amount": <número positivo, sin símbolos>,
    "suggestedCategoryName": "<nombre de categoría en español, preferir categorías del usuario si coinciden>",
    "categoryId": "<UUID exacto de la categoría del usuario si coincide perfectamente, o null>",
    "accountId": "<UUID exacto de la cuenta del usuario si la menciona, o null>",
    "description": "<descripción corta y natural en español, máximo 5 palabras>",
    "confidence": "high" | "medium" | "low"
  }
]

REGLAS DE MONTO (crítico):
- "mil" = 1000 | "5 mil" = 5000 | "50 mil" = 50000 | "cien mil" = 100000
- "un millón" = 1000000 | "dos millones" = 2000000 | "un palo" = 1000000
- "quinientos" = 500 | "doscientos mil" = 200000
- Ignorar símbolo $ y "COP" o "pesos"
- El monto SIEMPRE es positivo

REGLAS DE TIPO:
- EXPENSE: "gasté", "pagué", "compré", "me costó", "saqué", "debité", "invertí en", "pedí", "ordené"
- INCOME: "recibí", "me pagaron", "cobré", "gané", "me depositaron", "ingresó", "salario", "sueldo", "vendí"
- Si es ambiguo y menciona trabajo/sueldo/nómina → INCOME
- Si es ambiguo y menciona un producto/servicio → EXPENSE

REGLAS DE CATEGORÍA:
1. Primero buscar coincidencia en las categorías del usuario (por nombre similar o contexto)
2. Si hay coincidencia → poner su UUID en categoryId y su nombre en suggestedCategoryName
3. Si no hay coincidencia → categoryId: null, y usar la categoría base más apropiada en suggestedCategoryName
4. suggestedCategoryName siempre en español, nunca en inglés

REGLAS MULTI-MOVIMIENTO:
- Si el usuario menciona varios montos/categorías/acciones en una frase, devuelve un elemento por cada movimiento.
- Ejemplos: "500k en arriendo, 400k en comida" → 2 elementos.
- "pagué 2 recibos de 45 mil" → 2 elementos de 45000 cada uno, con categoría Vivienda/Servicios públicos (según contexto).
- Si el usuario mezcla ingresos y gastos, incluye ambos con su type correspondiente.

REGLAS DE CUENTA:
- Si el usuario dice "de Nequi", "del banco", "de Bancolombia", "de la tarjeta", "de mi cuenta de ahorros", etc. → busca la cuenta por nombre similar en la lista
- Si hay coincidencia → poner su UUID exacto en accountId
- Si no menciona ninguna cuenta específica → accountId: null

CONFIANZA:
- "high": monto y tipo completamente claros
- "medium": monto aproximado o tipo inferido por contexto
- "low": monto o tipo ambiguos o no mencionados explícitamente`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.05,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!text) {
        throw new AppError("Respuesta vacía del asistente", 500, "AI_ERROR");
      }

      const parsed = extractJSON(text);
      if (!parsed || parsed.length === 0) {
        throw new AppError(
          "No pude interpretar la respuesta del asistente",
          500,
          "AI_PARSE_ERROR"
        );
      }

      const cleaned = (parsed as ParsedTransaction[]).filter((p) =>
        p &&
        (p.type === "INCOME" || p.type === "EXPENSE") &&
        typeof p.amount === "number" &&
        p.amount > 0 &&
        typeof p.suggestedCategoryName === "string" &&
        p.suggestedCategoryName.trim().length > 0
      );

      if (cleaned.length === 0) {
        throw new AppError("No pude entender el monto de la transacción", 422, "PARSE_ERROR");
      }

      return cleaned;
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
