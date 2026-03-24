"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Sparkles, Crown, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCoachChat } from "@/lib/hooks/use-coach";
import { usePlan } from "@/lib/hooks/use-plan";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

// ─── Renderer de markdown para burbujas ──────────────────────────────────────

function ChatMarkdown({ content, isUser = false }: { content: string; isUser?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className={cn("font-bold", isUser ? "text-primary-foreground" : "text-foreground")}>
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="mt-1 mb-1 pl-3 flex flex-col gap-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="mt-1 mb-1 pl-4 flex flex-col gap-0.5 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="leading-snug">{children}</li>,
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-black/10 text-[12px] font-mono">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── Typewriter — revela texto palabra a palabra ──────────────────────────────

function TypewriterMarkdown({ content, isUser = false }: { content: string; isUser?: boolean }) {
  const words = content.split(" ");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= words.length) clearInterval(interval);
    }, 28); // ~35 palabras/segundo — se siente como escritura rápida
    return () => clearInterval(interval);
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = words.slice(0, shown).join(" ");
  return (
    <>
      <ChatMarkdown content={visible} isUser={isUser} />
      {shown < words.length && (
        <span className="inline-block w-1.5 h-3.5 bg-purple-muted/60 rounded-sm ml-0.5 animate-pulse align-text-bottom" />
      )}
    </>
  );
}

// ─── Sugerencias de inicio ────────────────────────────────────────────────────

const SUGGESTIONS = [
  "¿Cómo voy este mes?",
  "¿En qué me estoy gastando más plata?",
  "¿Puedo ahorrar más? ¿Cómo?",
  "Dame la regla del 50/30/20 con mis datos",
  "¿Estoy por encima o abajo del presupuesto?",
];

// ─── Bubble de mensaje ────────────────────────────────────────────────────────

function MessageBubble({
  role,
  content,
  isStreaming = false,
  typewrite = false,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  typewrite?: boolean;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-purple-brand/20 border border-purple-brand/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-muted" strokeWidth={2} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        )}
      >
        {typewrite && !isUser ? (
          <TypewriterMarkdown content={content} isUser={isUser} />
        ) : (
          <ChatMarkdown content={content} isUser={isUser} />
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-purple-muted/60 rounded-sm ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate() {
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
      <div className="w-16 h-16 rounded-3xl bg-purple-brand/15 border border-purple-brand/25 flex items-center justify-center">
        <Crown className="w-7 h-7 text-purple-muted" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground font-display mb-2">
          Coach IA es Premium
        </h2>
        <p className="text-sm text-muted-foreground/60 leading-relaxed">
          Hazte Premium y habla con Luka — tu compinche financiero que conoce tus datos y te ayuda a crecer de verdad.
        </p>
      </div>
      <button
        onClick={() => router.push("/upgrade")}
        className="flex items-center gap-2 px-6 py-3 bg-lime text-background font-bold text-[14px] rounded-2xl hover:bg-lime-dark transition-colors active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        Activar Premium
      </button>
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
      >
        Volver
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoachPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium, isLoading: planLoading } = usePlan();
  const { messages, sendMessage, isStreaming, streamingContent, clearChat, latestAssistantIdx } = useCoachChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (planLoading) {
    return (
      <div className="h-dvh flex flex-col bg-background max-w-sm mx-auto items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-brand/30 border-t-purple-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background max-w-sm mx-auto overflow-hidden">

      {/* Header */}
      <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between border-b border-border/30">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/60 hover:text-foreground transition-colors active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-muted" />
            <span className="text-[15px] font-bold text-foreground font-display">Luka</span>
          </div>
          <span className="text-[10px] text-muted-foreground/40 font-medium -mt-0.5">
            Coach Financiero IA
          </span>
        </div>

        <button
          onClick={clearChat}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/40 hover:text-destructive/70 transition-colors active:scale-90"
          aria-label="Limpiar chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </header>

      {!isPremium ? (
        <PremiumGate />
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-3">

            {/* Mensaje de bienvenida */}
            {messages.length === 0 && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <MessageBubble
                  role="assistant"
                  content={`¡Ey parcero! Soy Luka, tu coach financiero 🤝\n\nTengo acceso a tus datos — cuentas, gastos, presupuestos. Pregúntame lo que quieras sobre tu plata y te doy una respuesta honesta y con datos reales.\n\n¿Por dónde arrancamos?`}
                />
                <div className="flex flex-col gap-2 ml-10">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-card border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors active:scale-[0.98]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Historial */}
            <AnimatePresence>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  typewrite={i === latestAssistantIdx}
                />
              ))}
            </AnimatePresence>

            {/* Respuesta en streaming */}
            {isStreaming && streamingContent && (
              <MessageBubble
                role="assistant"
                content={streamingContent}
                isStreaming
              />
            )}

            {/* Indicador de "escribiendo" antes del primer chunk */}
            {isStreaming && !streamingContent && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-purple-brand/20 border border-purple-brand/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-muted" strokeWidth={2} />
                </div>
                <div className="px-4 py-3 bg-card border border-border rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-muted/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-none px-4 pt-2 border-t border-border/30" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary/40 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntale a Luka..."
                rows={1}
                className="flex-1 bg-transparent resize-none text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none leading-relaxed max-h-32"
                style={{ scrollbarWidth: "none" }}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Enviar"
              >
                <Send className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/25 text-center mt-2">
              Luka usa tus datos reales · las respuestas son orientativas
            </p>
          </div>
        </>
      )}
    </div>
  );
}
