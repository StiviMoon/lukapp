"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { X, CheckCircle2, AlertCircle, RotateCcw, ArrowRight, Mic, ChevronDown, Send, Banknote, Building2, PiggyBank, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";
import { useVoiceRecognition } from "@/lib/hooks/use-voice-recognition";
import { useInvalidateTransactions } from "@/lib/hooks/use-invalidate-transactions";
import { VoiceWaveform } from "./VoiceWaveform";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Transaction, TransactionCategory, Account } from "@/lib/types/transaction";

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote, CHECKING: Building2, SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard, INVESTMENT: TrendingUp, OTHER: Wallet,
};

function AccountIcon({ type }: { type: string }) {
  const Icon = ACCOUNT_ICONS[type] ?? Wallet;
  return <Icon className="w-3.5 h-3.5" />;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Variantes de animación ──────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.05 } },
};

const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 28, stiffness: 280 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 22, stiffness: 300 },
  },
};

// ─── Componente principal ────────────────────────────────────────────────────

export function VoiceModal() {
  const {
    isOpen,
    phase,
    transcript,
    interimTranscript,
    parsedTxs,
    errorMessage,
    closeVoice,
    setTranscript,
    setInterim,
    setPhase,
    setParsedTxs,
    setError,
    reset,
  } = useVoiceStore();

  const queryClient = useQueryClient();
  const invalidateTransactions = useInvalidateTransactions();

  // Drafts locales: para 1 movimiento se edita directo; para muchos se edita por selección
  const [drafts, setDrafts] = useState<Array<{
    type: "INCOME" | "EXPENSE";
    amount: number;
    description?: string;
    suggestedCategoryName: string;
    categoryId: string | null;
    accountId: string | null;
    confidence: "high" | "medium" | "low";
    rawTranscript: string;
  }>>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Estado local para edición del item seleccionado
  const [editAmount,       setEditAmount]       = useState("");
  const [editDescription,  setEditDescription]  = useState("");
  const [editCategoryId,   setEditCategoryId]   = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showCatPicker,    setShowCatPicker]    = useState(false);
  const [editAccountId,    setEditAccountId]    = useState<string | null>(null);

  // Categorías del usuario (del cache — staleTime 5min)
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.getAll(),
    enabled: phase === "confirming",
    staleTime: 5 * 60_000,
  });
  const categories = (categoriesRes?.data as TransactionCategory[] | undefined) ?? [];

  // Cuentas del usuario
  const { data: accountsRes } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
    staleTime: 60_000,
  });
  const accounts = (accountsRes?.data as Account[] | undefined) ?? [];

  // Sincronizar drafts cuando llega parsedTxs
  useEffect(() => {
    if (parsedTxs && parsedTxs.length > 0) {
      setDrafts(parsedTxs);
      setSelectedIdx(0);
    } else {
      setDrafts([]);
      setSelectedIdx(0);
    }
  }, [parsedTxs]);

  // Sincronizar campos editables cuando cambia item seleccionado
  useEffect(() => {
    const tx = drafts[selectedIdx];
    if (!tx) return;
    setEditAmount(String(tx.amount));
    setEditDescription(tx.description ?? "");
    setEditCategoryId(tx.categoryId ?? null);
    setEditCategoryName(tx.suggestedCategoryName ?? "");
    setNewCategoryInput("");
    setShowCatPicker(false);
    // Cuenta: usar la detectada por IA, o la primera disponible como fallback
    setEditAccountId(tx.accountId ?? (accounts.length > 0 ? accounts[0].id : null));
  }, [drafts, selectedIdx, accounts]);

  // ── Callbacks del reconocimiento de voz ──
  const handleInterim = useCallback(
    (text: string) => setInterim(text),
    [setInterim]
  );

  const handleFinal = useCallback(
    async (finalText: string) => {
      if (!finalText.trim()) return;

      setTranscript(finalText.trim());
      setPhase("processing");

      try {
        // Traer categorías del usuario para mejor matching
        const categoriesRes = await api.categories.getAll();
        const categories =
          (categoriesRes.data as Array<{ id: string; name: string; type: string }>) ?? [];

        const currentAccounts = (accountsRes?.data as Account[] | undefined) ?? [];
        const result = await api.voice.parse({
          transcript: finalText.trim(),
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
          })),
          accounts: currentAccounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
          })),
        });

        if (!result.success || !result.data) {
          setError(result.error?.message ?? "No pude interpretar eso");
          setPhase("error");
          return;
        }

        const txs = (result.data ?? []).map((t: any) => ({ ...t, rawTranscript: finalText.trim(), accountId: t.accountId ?? null }));
        setParsedTxs(txs);
        setPhase("confirming");
      } catch {
        setError("Error de conexión, intenta de nuevo");
        setPhase("error");
      }
    },
    [setTranscript, setPhase, setParsedTxs, setError]
  );

  const handleRecognitionError = useCallback(
    (message: string) => {
      setError(message);
      setPhase("error");
    },
    [setError, setPhase]
  );

  const { isSupported, startListening, stopListening } = useVoiceRecognition({
    onInterim: handleInterim,
    onFinal: handleFinal,
    onError: handleRecognitionError,
  });

  // ── Timer (UI tipo WhatsApp) ─────────────────────────────────────────────
  const [recordStartMs, setRecordStartMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isOpen || phase !== "listening") {
      setRecordStartMs(null);
      setElapsedMs(0);
      return;
    }
    const start = Date.now();
    setRecordStartMs(start);
    const id = setInterval(() => setElapsedMs(Date.now() - start), 250);
    return () => clearInterval(id);
  }, [isOpen, phase]);

  const elapsedLabel = useMemo(() => {
    const totalSec = Math.floor((elapsedMs || 0) / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [elapsedMs]);

  // ── Iniciar escucha cuando el modal abre ──
  useEffect(() => {
    if (isOpen && phase === "listening") {
      if (!isSupported) {
        setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
        setPhase("error");
        return;
      }
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phase]);

  // ── Fase done: invalidar cache y cerrar ──
  useEffect(() => {
    if (phase === "done") {
      toast.success("Transacción registrada");
      invalidateTransactions();
      const timer = setTimeout(() => closeVoice(), 1400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, closeVoice]);

  // ── Guardar transacción ──
  const handleConfirm = async () => {
    if (!drafts.length) return;

    // Guardar cambios del item seleccionado al draft antes de confirmar
    const selected = drafts[selectedIdx];
    if (!selected) return;

    const amountSelected = parseFloat(editAmount);
    if (!amountSelected || amountSelected <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    const finalCategoryNameSel = newCategoryInput.trim() || editCategoryName;
    const finalCategoryIdSel =
      finalCategoryNameSel.trim().length > 0
        ? (newCategoryInput.trim() ? null : editCategoryId)
        : null;

    const nextDrafts = drafts.map((d, idx) =>
      idx === selectedIdx
        ? {
            ...d,
            amount: amountSelected,
            description: editDescription || undefined,
            suggestedCategoryName: finalCategoryNameSel || d.suggestedCategoryName,
            categoryId: finalCategoryIdSel ?? d.categoryId,
            accountId: editAccountId ?? d.accountId,
          }
        : d
    );
    setDrafts(nextDrafts);

    // Optimistic update: actualizar balance y lista antes de la respuesta del servidor
    await queryClient.cancelQueries({ queryKey: ["transactions"] });
    await queryClient.cancelQueries({ queryKey: ["balance"] });

    const prevTransactions = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]);
    const prevBalance = queryClient.getQueryData<number>(["balance"]);

    const totalDelta = nextDrafts.reduce((sum, t) => {
      const amt = Number(t.amount) || 0;
      return sum + (t.type === "EXPENSE" ? -amt : amt);
    }, 0);
    queryClient.setQueryData<number>(["balance"], (old) => (old ?? 0) + totalDelta);

    const nowIso = new Date().toISOString();
    queryClient.setQueryData<Transaction[]>(["transactions", "recent"], (old) => {
      const optimistic = nextDrafts.map((t, i) => ({
        id: `optimistic-${Date.now()}-${i}`,
        type: t.type,
        amount: String(t.amount),
        description: t.description || undefined,
        date: nowIso,
        createdAt: nowIso,
        account: { id: "", name: "Efectivo", type: "CASH" },
        category: t.suggestedCategoryName
          ? { id: t.categoryId ?? "opt", name: t.suggestedCategoryName, type: t.type }
          : null,
      }));
      return [...optimistic, ...(old ?? [])];
    });

    setPhase("saving");

    try {
      const payload = nextDrafts.map((t) => ({
        type: t.type,
        amount: t.amount,
        description: t.description || undefined,
        suggestedCategoryName: t.suggestedCategoryName,
        categoryId: t.categoryId,
        accountId: t.accountId ?? undefined,
        date: new Date().toISOString(),
      }));

      const txRes = await api.voice.save(payload.length === 1 ? payload[0] : payload);

      if (!txRes.success) {
        // Rollback
        if (prevBalance !== undefined) queryClient.setQueryData(["balance"], prevBalance);
        if (prevTransactions !== undefined) queryClient.setQueryData(["transactions", "recent"], prevTransactions);
        setError(txRes.error?.message ?? "Error al guardar la transacción");
        setPhase("error");
        return;
      }

      setPhase("done");
    } catch {
      // Rollback
      if (prevBalance !== undefined) queryClient.setQueryData(["balance"], prevBalance);
      if (prevTransactions !== undefined) queryClient.setQueryData(["transactions", "recent"], prevTransactions);
      setError("Error de conexión al guardar");
      setPhase("error");
    }
  };

  // ── Reintentar ──
  const handleRetry = () => {
    reset();
    setPhase("listening");
  };

  // ── Cerrar deteniendo el mic ──
  const handleClose = () => {
    stopListening();
    closeVoice();
  };

  // ─── Render por fase ────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (phase) {
      case "idle":
        return (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5 py-2"
          >
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Registrar por voz</p>
              <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed">
                Di algo como{" "}
                <span className="font-semibold text-foreground/80">“gasté 50k en comida”</span>{" "}
                o{" "}
                <span className="font-semibold text-foreground/80">“recibí 2 millones de nómina”</span>.
                <br />
                También puedes decir varios movimientos seguidos.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPhase("listening")}
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center",
                  "bg-primary text-primary-foreground shadow-sm",
                  "hover:bg-primary/90 transition-colors active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                aria-label="Empezar a grabar"
              >
                <Mic className="w-7 h-7" strokeWidth={2.2} />
              </button>
              <p className="text-[11px] text-muted-foreground/60">
                Toca para empezar
              </p>
            </div>

            <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground">
              Cancelar
            </Button>
          </motion.div>
        );

      case "listening":
        return (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Barra superior: dot + timer */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Grabando
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground/60 font-nums tabular-nums">
                {elapsedLabel}
              </span>
            </div>

            <VoiceWaveform isListening={true} />

            {/* Lo que va detectando el micrófono */}
            <div className="w-full min-h-[44px] flex items-center justify-center px-2">
              <p className="text-sm text-muted-foreground/70 text-center leading-relaxed">
                {interimTranscript && interimTranscript !== "..."
                  ? `"${interimTranscript}"`
                  : "Habla normal. Cuando termines, toca Enviar."}
              </p>
            </div>

            {/* Barra inferior tipo WhatsApp */}
            <div className="w-full flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="h-12 w-12 rounded-full bg-muted/60 hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground"
                aria-label="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 h-12 rounded-full bg-muted/40 px-4 flex items-center text-[12px] text-muted-foreground/60">
                {recordStartMs ? "Grabando…" : "Preparando…"}
              </div>

              <button
                type="button"
                onClick={() => {
                  // UX: parar el timer/estado de grabación inmediatamente
                  // (el MediaRecorder se detiene y luego llega el transcript en onstop)
                  setInterim("Procesando…");
                  setPhase("processing");
                  stopListening();
                }}
                className={cn(
                  "h-12 w-12 rounded-full bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors active:scale-[0.98]",
                  "flex items-center justify-center",
                )}
                aria-label="Enviar"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="flex flex-col items-center gap-6 py-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Analizando...
            </p>

            <VoiceWaveform isListening={false} isProcessing={true} />

            {transcript && (
              <p className="text-sm text-muted-foreground text-center px-4 italic">
                &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>
        );

      case "confirming":
        if (!drafts.length) return null;
        // Nota: en multi-movimiento, editamos el item seleccionado.
        // Al confirmar, se guardan todos los drafts (con el seleccionado actualizado).
        const current = drafts[selectedIdx] ?? drafts[0];
        return (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5 py-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {drafts.length > 1 ? `¿Registrar ${drafts.length} movimientos?` : "¿Registrar esto?"}
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reintentar
              </button>
            </div>

            {drafts.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {drafts.map((tx, idx) => (
                  <button
                    key={`${idx}-${tx.type}-${tx.amount}`}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-[0.98]",
                      idx === selectedIdx
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tx.type === "INCOME" ? "↑" : "↓"} {formatCOP(Number(tx.amount) || 0)}
                  </button>
                ))}
              </div>
            )}

            {/* Card de transacción */}
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    current.type === "INCOME"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {current.type === "INCOME" ? "Ingreso" : "Gasto"}
                </span>
                {current.confidence === "low" && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ Revisa el monto
                  </span>
                )}
              </div>

              {/* Monto editable */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Monto
                </p>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-0 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                />
                {editAmount && (
                  <p className="text-xs text-muted-foreground">
                    {formatCOP(parseFloat(editAmount) || 0)}
                  </p>
                )}
              </div>

              {/* Categoría editable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Categoría
                  </p>
                  <button
                    onClick={() => setShowCatPicker(v => !v)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary active:scale-95 transition-transform"
                  >
                    Cambiar
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showCatPicker && "rotate-180")} />
                  </button>
                </div>

                {/* Chip de categoría actual */}
                <span className="inline-flex text-xs font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-full">
                  {newCategoryInput.trim() || editCategoryName || "Sin categoría"}
                </span>

                {/* Picker expandible */}
                <AnimatePresence>
                  {showCatPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden space-y-2"
                    >
                      {/* Chips de categorías existentes */}
                      {categories.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap pt-1">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setEditCategoryId(cat.id);
                                setEditCategoryName(cat.name);
                                setNewCategoryInput("");
                                setShowCatPicker(false);
                              }}
                              className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                                editCategoryId === cat.id && !newCategoryInput
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Input nueva categoría */}
                      <Input
                        placeholder="Nueva categoría..."
                        value={newCategoryInput}
                        onChange={e => {
                          setNewCategoryInput(e.target.value);
                          if (e.target.value.trim()) {
                            setEditCategoryId(null);
                            setEditCategoryName("");
                          }
                        }}
                        className="h-8 text-sm bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cuenta */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Cuenta
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setEditAccountId(acc.id)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                          editAccountId === acc.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <AccountIcon type={acc.type} />
                        {acc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción editable */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Descripción
                </p>
                <Input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  className="text-sm h-auto py-1 px-0 border-0 border-b rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full gap-2">
              {drafts.length > 1 ? `Confirmar ${drafts.length}` : "Confirmar"}{" "}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground">
              Cancelar
            </Button>
          </motion.div>
        );

      case "saving":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <VoiceWaveform isListening={false} isProcessing={true} />
            <p className="text-sm text-muted-foreground">Guardando transacción...</p>
          </div>
        );

      case "done":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 300 }}
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </motion.div>
            <p className="text-base font-semibold text-foreground">
              Transacción registrada
            </p>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center gap-5 py-4">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <p className="text-sm text-center text-muted-foreground px-2">
              {errorMessage ?? "Ocurrió un error inesperado"}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={handleRetry} className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Intentar de nuevo
              </Button>
              <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground">
                Cancelar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="voice-backdrop"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="voice-sheet"
            className="fixed bottom-0 left-0 right-0 z-[61] max-w-sm mx-auto rounded-t-[32px] px-6 pt-5 pb-10"
            style={{
              backgroundColor: "var(--background)",
              borderTop: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-6 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {renderContent()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
