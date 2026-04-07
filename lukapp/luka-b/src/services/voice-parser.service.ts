import type { ParsedTransaction, PeriodicityValue } from "@/services/voice.service";

// ─── Mapas de palabras → números ───────────────────────────────────────────

const WORD_NUMBERS: Record<string, number> = {
  un: 1, uno: 1, una: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300,
  cuatrocientos: 400, quinientos: 500, seiscientos: 600,
  setecientos: 700, ochocientos: 800, novecientos: 900,
};

// ─── Keywords de tipo ───────────────────────────────────────────────────────

const EXPENSE_KEYWORDS = [
  "gasté", "gaste", "pagué", "pague", "compré", "compre",
  "me costó", "me costo", "saqué", "saque", "debité", "debite",
  "invertí en", "inverti en", "pedí", "pedi", "ordené", "ordene",
  "transferí", "transferi", "presté", "preste",
];

const INCOME_KEYWORDS = [
  "recibí", "recibi", "me pagaron", "cobré", "cobre", "gané", "gane",
  "me depositaron", "ingresó", "ingreso", "llegó", "llego",
  "vendí", "vendi", "me prestaron", "me regalaron",
  "salario", "sueldo", "nómina", "nomina", "quincena",
  "me llegó", "me llego", "me cayó", "me cayo",
];

// ─── Categorías por keywords ────────────────────────────────────────────────

interface CategoryRule {
  name: string;
  type: "INCOME" | "EXPENSE" | "BOTH";
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  // GASTOS
  {
    name: "Alimentación",
    type: "EXPENSE",
    keywords: [
      "comida", "almuerzo", "desayuno", "cena", "restaurante", "domicilio",
      "mercado", "supermercado", "snack", "bebida", "tinto", "café", "cafe",
      "rappi", "ifood", "uber eats", "fruta", "verdura", "tienda",
    ],
  },
  {
    name: "Transporte",
    type: "EXPENSE",
    keywords: [
      "bus", "sitp", "taxi", "uber", "didi", "gasolina", "metro",
      "tren", "peaje", "parqueadero", "moto", "bicicleta", "transporte",
    ],
  },
  {
    name: "Vivienda",
    type: "EXPENSE",
    keywords: [
      "arriendo", "alquiler", "agua", "luz", "gas", "internet", "cable",
      "administración", "administracion", "conjunto", "servicios", "recibo",
    ],
  },
  {
    name: "Salud",
    type: "EXPENSE",
    keywords: [
      "médico", "medico", "farmacia", "droga", "droguería", "drogueria",
      "cita", "eps", "medicina", "medicamento", "hospital", "clínica",
      "clinica", "dentista", "óptica", "optica",
    ],
  },
  {
    name: "Educación",
    type: "EXPENSE",
    keywords: [
      "universidad", "colegio", "curso", "libro", "útiles", "utiles",
      "matrícula", "matricula", "pensión", "pension", "carrera", "capacitación",
    ],
  },
  {
    name: "Entretenimiento",
    type: "EXPENSE",
    keywords: [
      "cine", "netflix", "spotify", "youtube", "videojuego", "concierto",
      "streaming", "disney", "hbo", "prime", "bar", "trago", "rumba",
      "parque", "juego",
    ],
  },
  {
    name: "Ropa",
    type: "EXPENSE",
    keywords: [
      "ropa", "zapatos", "tenis", "accesorios", "vestido", "camisa",
      "pantalón", "pantalon", "maleta", "bolso", "jean",
    ],
  },
  {
    name: "Tecnología",
    type: "EXPENSE",
    keywords: [
      "celular", "computador", "laptop", "tablet", "electrónico",
      "electronico", "software", "recarga", "plan datos", "minutos",
    ],
  },
  {
    name: "Mascotas",
    type: "EXPENSE",
    keywords: [
      "veterinario", "concentrado", "mascota", "perro", "gato", "vacuna",
    ],
  },
  {
    name: "Cuidado personal",
    type: "EXPENSE",
    keywords: [
      "peluquería", "peluqueria", "barbería", "barberia", "spa", "belleza",
      "gimnasio", "gym", "cosmético", "cosmetico", "perfume",
    ],
  },
  {
    name: "Deudas",
    type: "EXPENSE",
    keywords: [
      "crédito", "credito", "cuota", "préstamo", "prestamo", "intereses",
      "tarjeta", "banco", "deuda",
    ],
  },
  // INGRESOS
  {
    name: "Salario",
    type: "INCOME",
    keywords: [
      "sueldo", "salario", "nómina", "nomina", "quincena", "pago mensual",
      "trabajo", "empresa",
    ],
  },
  {
    name: "Freelance",
    type: "INCOME",
    keywords: [
      "proyecto", "cliente", "freelance", "honorarios", "consultoría",
      "consultoria", "independiente",
    ],
  },
  {
    name: "Ventas",
    type: "INCOME",
    keywords: ["vendí", "vendi", "venta", "negocio", "mercancía", "mercancia"],
  },
  {
    name: "Reembolso",
    type: "INCOME",
    keywords: [
      "devolvieron", "reembolso", "devolución", "devolucion", "reintegro",
      "cashback",
    ],
  },
];

// ─── Separadores de multi-movimiento ───────────────────────────────────────

const MULTI_SEPARATORS = /\s*,\s*|\s+y también\s+|\s+y\s+(?=\d)|,\s*y\s+/i;

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quitar acentos
}

/**
 * Extrae el monto numérico de una frase en español colombiano.
 * Soporta: "50k", "50 mil", "2 millones", "un palo", "quinientos", "50000"
 */
function extractAmount(text: string): number | null {
  const t = normalize(text);

  // 1. Número con "k" → multiplicar por 1000
  const kMatch = t.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (kMatch) return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1000);

  // 2. Número con "m" o "millones/millón"
  const mMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m\b|millon(?:es)?)/);
  if (mMatch) return Math.round(parseFloat(mMatch[1].replace(",", ".")) * 1_000_000);

  // 3. "medio palo" → 500000
  if (t.includes("medio palo")) return 500_000;

  // 4. "un palo" / "N palos" → millones
  const paloMatch = t.match(/(\d+|un|uno)\s+palo(?:s)?/);
  if (paloMatch) {
    const n = WORD_NUMBERS[paloMatch[1]] ?? parseInt(paloMatch[1]);
    if (!isNaN(n)) return n * 1_000_000;
  }

  // 5. Número + "mil" (ej: "50 mil", "doscientos mil")
  const milMatch = t.match(/(\d+(?:[.,]\d+)?)\s+mil\b/);
  if (milMatch) return Math.round(parseFloat(milMatch[1].replace(",", ".")) * 1000);

  // 6. Palabra + "mil" (ej: "cincuenta mil")
  for (const [word, val] of Object.entries(WORD_NUMBERS)) {
    const milWordRe = new RegExp(`\\b${word}\\s+mil\\b`);
    if (milWordRe.test(t)) return val * 1000;
  }

  // 7. Número + "millones/millón"
  const millonesMatch = t.match(/(\d+)\s+millon(?:es)?/);
  if (millonesMatch) return parseInt(millonesMatch[1]) * 1_000_000;

  // 8. Palabra numérica sola (ej: "quinientos")
  for (const [word, val] of Object.entries(WORD_NUMBERS)) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(t) && val >= 100) return val; // ej: "quinientos" → 500
  }

  // 9. Número puro (con o sin puntos de miles)
  const pureMatch = t.match(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/);
  if (pureMatch) {
    const cleaned = pureMatch[1].replace(/\./g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    if (!isNaN(n) && n > 0) return n;
  }

  return null;
}

/**
 * Detecta el tipo de transacción (INCOME o EXPENSE).
 * Retorna null si es ambiguo.
 */
function detectType(text: string): "INCOME" | "EXPENSE" | null {
  const t = normalize(text);

  for (const kw of EXPENSE_KEYWORDS) {
    if (t.includes(normalize(kw))) return "EXPENSE";
  }
  for (const kw of INCOME_KEYWORDS) {
    if (t.includes(normalize(kw))) return "INCOME";
  }
  return null;
}

/**
 * Infiere la categoría más probable a partir del texto.
 * Considera las categorías del usuario si hay coincidencia por nombre.
 */
function inferCategory(
  text: string,
  type: "INCOME" | "EXPENSE",
  userCategories: Array<{ id: string; name: string; type: string }>
): { name: string; id: string | null } {
  const t = normalize(text);

  // 1. Buscar coincidencia en categorías del usuario
  for (const cat of userCategories) {
    if (cat.type !== type) continue;
    const catNorm = normalize(cat.name);
    if (t.includes(catNorm)) return { name: cat.name, id: cat.id };
  }

  // 2. Buscar por keywords de las reglas
  for (const rule of CATEGORY_RULES) {
    if (rule.type !== "BOTH" && rule.type !== type) continue;
    for (const kw of rule.keywords) {
      if (t.includes(normalize(kw))) {
        // ¿Hay categoría del usuario con este nombre?
        const userMatch = userCategories.find(
          (c) => c.type === type && normalize(c.name) === normalize(rule.name)
        );
        return { name: rule.name, id: userMatch?.id ?? null };
      }
    }
  }

  // 3. Fallback genérico
  const fallback = type === "EXPENSE" ? "Otros gastos" : "Otros ingresos";
  const userFallback = userCategories.find(
    (c) => c.type === type && normalize(c.name) === normalize(fallback)
  );
  return { name: fallback, id: userFallback?.id ?? null };
}

/**
 * Infiere la cuenta del usuario si se menciona en el texto.
 */
function inferAccount(
  text: string,
  userAccounts: Array<{ id: string; name: string; type: string }>
): string | null {
  const t = normalize(text);
  for (const acc of userAccounts) {
    if (t.includes(normalize(acc.name))) return acc.id;
  }
  return null;
}

// ─── Detección de periodicidad ────────────────────────────────────────────────

const PERIODICITY_RULES: Array<{ pattern: RegExp; value: PeriodicityValue }> = [
  // DAILY
  { pattern: /cada d[ií]a|todos los d[ií]as|diari(o|a|amente)/i, value: "DAILY" },
  // WEEKLY
  { pattern: /cada semana|semanal(mente)?|cada 7 d[ií]as|todos los (lunes|martes|miércoles|miercoles|jueves|viernes|sábados?|sabados?|domingos?)/i, value: "WEEKLY" },
  // BI_WEEKLY
  { pattern: /cada 15 d[ií]as|quincenal(mente)?|cada dos semanas|cada quince/i, value: "BI_WEEKLY" },
  // MONTHLY — palabras clave + ingresos laborales fijos
  { pattern: /cada mes|mensual(mente)?|todos los meses|mes a mes/i, value: "MONTHLY" },
  // QUARTERLY
  { pattern: /cada tres meses|trimestral(mente)?|cada trimestre/i, value: "QUARTERLY" },
  // YEARLY
  { pattern: /cada a[ñn]o|anual(mente)?|todos los a[ñn]os|una vez al a[ñn]o|soat|predial|impuesto de renta/i, value: "YEARLY" },
];

// Palabras que implican ingreso/gasto mensual recurrente aunque no se diga explícitamente
const IMPLICIT_MONTHLY_INCOME = /salario|sueldo|n[oó]mina|quincena|pago del mes/i;
const IMPLICIT_MONTHLY_EXPENSE = /arriendo|alquiler|administraci[oó]n|cuota del cr[eé]dito|mensualidad/i;

function detectPeriodicity(
  text: string,
  type: "INCOME" | "EXPENSE"
): PeriodicityValue {
  for (const rule of PERIODICITY_RULES) {
    if (rule.pattern.test(text)) return rule.value;
  }
  if (type === "INCOME" && IMPLICIT_MONTHLY_INCOME.test(text)) return "MONTHLY";
  if (type === "EXPENSE" && IMPLICIT_MONTHLY_EXPENSE.test(text)) return "MONTHLY";
  return "ONCE";
}

/**
 * Parsea un segmento de texto en una sola transacción.
 * Retorna null si no puede determinar monto o tipo con confianza.
 */
function parseSegment(
  segment: string,
  userCategories: Array<{ id: string; name: string; type: string }>,
  userAccounts: Array<{ id: string; name: string; type: string }>
): ParsedTransaction | null {
  const amount = extractAmount(segment);
  if (!amount) return null;

  const type = detectType(segment);
  if (!type) return null;

  const { name: categoryName, id: categoryId } = inferCategory(
    segment,
    type,
    userCategories
  );
  const accountId = inferAccount(segment, userAccounts);
  const periodicity = detectPeriodicity(segment, type);

  // Construir descripción corta (máx 4 palabras relevantes)
  const descWords = normalize(segment)
    .replace(/\d+/g, "")
    .replace(/\bk\b|\bmil\b|\bmillon(es)?\b|\bpalo(s)?\b/g, "")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !EXPENSE_KEYWORDS.map(normalize).includes(w) &&
        !INCOME_KEYWORDS.map(normalize).includes(w)
    )
    .slice(0, 4)
    .join(" ");

  const description = descWords.trim() || categoryName;

  // Confianza: high si categoría específica, medium si es fallback
  const isFallback = categoryName === "Otros gastos" || categoryName === "Otros ingresos";
  const confidence: "high" | "medium" = isFallback ? "medium" : "high";

  return {
    type,
    amount,
    suggestedCategoryName: categoryName,
    categoryId,
    accountId,
    description,
    confidence,
    periodicity,
  };
}

// ─── Servicio principal ─────────────────────────────────────────────────────

export class VoiceParserService {
  /**
   * Intenta parsear el transcript sin IA usando reglas.
   * Retorna array de transacciones si lo logra, null si debe caer a Llama.
   */
  parse(
    transcript: string,
    userCategories: Array<{ id: string; name: string; type: string }> = [],
    userAccounts: Array<{ id: string; name: string; type: string }> = []
  ): ParsedTransaction[] | null {
    if (!transcript.trim()) return null;

    // Dividir en segmentos para multi-movimiento
    const segments = transcript
      .split(MULTI_SEPARATORS)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    if (segments.length === 0) return null;

    const results: ParsedTransaction[] = [];

    for (const segment of segments) {
      const parsed = parseSegment(segment, userCategories, userAccounts);
      if (!parsed) {
        // Un segmento no resolvible → caer a IA si hay múltiples
        // Si es segmento único, también caer a IA
        return null;
      }
      results.push(parsed);
    }

    return results.length > 0 ? results : null;
  }
}

export const voiceParserService = new VoiceParserService();
