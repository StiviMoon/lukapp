const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all|previous|prior)\s+instructions/gi,
  /ignora(r)?\s+(todas?\s+)?(las\s+)?instrucciones/gi,
  /system\s+prompt/gi,
  /prompt\s+injection/gi,
  /developer\s+message/gi,
  /reveal|mostrar|exponer|leak|filtrar/gi,
  /jailbreak/gi,
  /role:\s*(system|developer)/gi,
  /<\s*system\s*>/gi,
  /BEGIN\s+PROMPT/gi,
];

const MAX_MESSAGE_LENGTH = 600;

function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, " ");
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function sanitizeUserMessage(input: string): string {
  const safe = collapseWhitespace(stripControlChars(input));
  return safe.slice(0, MAX_MESSAGE_LENGTH);
}

export function hasPromptInjectionSignals(input: string): boolean {
  const text = input.toLowerCase();
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function safeFallbackForUnsafePrompt(): string {
  return "Puedo ayudarte con tus finanzas personales. Si quieres, cuentame un gasto o meta y lo revisamos juntos.";
}
