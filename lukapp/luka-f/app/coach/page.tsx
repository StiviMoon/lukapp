"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Sparkles, Crown, Trash2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCoachChat } from "@/lib/hooks/use-coach";
import { usePlan } from "@/lib/hooks/use-plan";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { cn } from "@/lib/utils";

// ─── Renderer de markdown para burbujas ──────────────────────────────────────

function ChatMarkdown({ content, isUser = false }: { content: string; isUser?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className={cn("font-bold", isUser ? "text-white" : "text-foreground")}>
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
    }, 28);
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
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 380, damping: 30 }}
      className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, #3d0ab5, #5913ef)",
            boxShadow: "0 2px 8px rgba(89,19,239,0.35)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] px-4 py-3 rounded-[20px] text-[14px] leading-relaxed",
          isUser
            ? "text-white rounded-tr-sm"
            : "bg-card border border-border/60 text-foreground rounded-tl-sm",
        )}
        style={
          isUser
            ? {
                background: "linear-gradient(135deg, #4510c8, #5913ef)",
                boxShadow: "0 2px 12px rgba(89,19,239,0.25)",
              }
            : undefined
        }
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
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
      {/* Avatar grande */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-[28px] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #2a08a8, #5913ef)",
            boxShadow: "0 8px 32px rgba(89,19,239,0.35)",
          }}
        >
          <Sparkles className="w-9 h-9 text-white" strokeWidth={1.8} />
        </div>
        {/* Crown badge */}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
          <Crown className="w-3.5 h-3.5 text-amber-900" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground font-display">
          Coach IA es Premium
        </h2>
        <p className="text-sm text-muted-foreground/60 leading-relaxed">
          Hazte Premium y habla con Luka — tu compinche financiero que conoce tus datos y te ayuda a crecer de verdad.
        </p>
      </div>

      {/* Benefits */}
      <div className="w-full space-y-2.5">
        {[
          "Chat ilimitado con contexto real de tus finanzas",
          "Insights diarios personalizados",
          "Análisis de tendencias y forecast",
        ].map((b) => (
          <div key={b} className="flex items-start gap-2.5 text-left">
            <div className="w-5 h-5 rounded-full bg-lime/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-lime" strokeWidth={3} />
            </div>
            <p className="text-[13px] text-muted-foreground/70 leading-snug">{b}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/upgrade")}
        className="flex items-center gap-2 px-8 py-3.5 font-bold text-[14px] rounded-2xl transition-all active:scale-95"
        style={{
          background: "#baea0f",
          color: "#0A0A0A",
          boxShadow: "0 4px 16px rgba(200,212,0,0.35)",
        }}
      >
        <Crown className="w-4 h-4" />
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
  const { data: profile } = useProfile();
  const firstName = profile?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "parcero";
  const { messages, sendMessage, isStreaming, streamingContent, clearChat, latestAssistantIdx } = useCoachChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-purple-muted animate-spin"
          style={{ borderColor: "rgba(89,19,239,0.2)", borderTopColor: "#5913ef" }}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto overflow-hidden">

      {/* Header */}
      <header className="flex-none px-5 pt-12 pb-4 flex items-center justify-between border-b border-border/30">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/60 hover:text-foreground transition-colors active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Luka identity */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3d0ab5, #5913ef)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[16px] font-bold text-foreground font-display">Luka</span>
            {/* Status dot */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
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
                  content={`¡Ey ${firstName}! Soy Luka, tu coach financiero.\n\nTengo acceso a tus datos — cuentas, gastos, presupuestos. Pregúntame lo que quieras sobre tu plata y te doy una respuesta honesta y con datos reales.\n\n¿Por dónde arrancamos?`}
                />
                <div className="flex flex-col gap-2 ml-11">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-[0.98]"
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

            {/* Indicador "escribiendo" antes del primer chunk */}
            {isStreaming && !streamingContent && (
              <div className="flex gap-2.5 justify-start">
                <div
                  className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #3d0ab5, #5913ef)" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <div className="px-4 py-3 bg-card border border-border/60 rounded-[20px] rounded-tl-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-muted/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — glassmorphism iOS-style */}
          <div
            className="flex-none px-4 pt-3 border-t border-border/20"
            style={{
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all"
              style={{
                background: "color-mix(in srgb, var(--card) 80%, transparent)",
                border: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
              }}
            >
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
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isStreaming
                    ? "linear-gradient(135deg, #4510c8, #5913ef)"
                    : undefined,
                }}
                aria-label="Enviar"
              >
                <Send className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
              </motion.button>
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
