"use client";

import { useState, useEffect, useRef } from "react";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { X, Banknote, Building2, PiggyBank, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Transaction, TransactionCategory, Account } from "@/lib/types/transaction";
import { useInvalidateTransactions } from "@/lib/hooks/use-invalidate-transactions";
import { useOfflineQueue, type OfflineTransactionPayload } from "@/lib/hooks/use-offline-queue";

// ─── Account helpers ─────────────────────────────────────────────────────────

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote, CHECKING: Building2, SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard, INVESTMENT: TrendingUp, OTHER: Wallet,
};

function AccountIcon({ type }: { type: string }) {
  const Icon = ACCOUNT_ICONS[type] ?? Wallet;
  return <Icon className="w-3.5 h-3.5" />;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function extractErrorMessage(error: { message?: string; errors?: Record<string, string[]> } | undefined): string {
  if (!error) return "Error al registrar";
  if (error.errors) {
    const firstField = Object.values(error.errors)[0];
    if (firstField?.[0]) return firstField[0];
  }
  return error.message ?? "Error al registrar";
}

// ─── Animation variants ─────────────────────────────────────────────────────

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

// ─── Props ──────────────────────────────────────────────────────────────────

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "INCOME" | "EXPENSE";
  editingTransaction?: Transaction | null;
}

type SaveVars = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  suggestedCategoryName: string;
  categoryId: string | null;
  accountId: string | null;
  date: string;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function AddTransactionSheet({
  isOpen,
  onClose,
  defaultType = "EXPENSE",
  editingTransaction = null,
}: AddTransactionSheetProps) {
  const queryClient = useQueryClient();
  const invalidateTransactions = useInvalidateTransactions();
  const { isOnline, enqueue: enqueueOffline } = useOfflineQueue();

  const [type, setType] = useState<"INCOME" | "EXPENSE">(defaultType);
  const [rawAmount, setRawAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editingTransaction);

  // Reset / prefill state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setSubmitAttempted(false);
      if (editingTransaction) {
        setType(editingTransaction.type);
        setRawAmount(String(Math.trunc(Number(editingTransaction.amount) || 0)));
        setDescription(editingTransaction.description ?? "");
        setNewCategoryInput("");
        if (editingTransaction.category) {
          setSelectedCategoryId(editingTransaction.category.id);
          setSelectedCategoryName(editingTransaction.category.name);
        } else {
          setSelectedCategoryId(null);
          setSelectedCategoryName("");
        }
        setSelectedAccountId(editingTransaction.account?.id ?? null);
      } else {
        setType(defaultType);
        setRawAmount("");
        setDescription("");
        setNewCategoryInput("");
        setSelectedCategoryId(null);
        setSelectedCategoryName("");
        setSelectedAccountId(null);
      }
      // Focus amount input after animation settles
      const timer = setTimeout(() => amountInputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultType, editingTransaction]);

  // Fetch categories
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.getAll(),
    enabled: isOpen,
    staleTime: 5 * 60_000,
  });

  const categories =
    (categoriesRes?.data as TransactionCategory[] | undefined) ?? [];

  // Fetch accounts
  const { data: accountsRes } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
    enabled: isOpen,
    staleTime: 60_000,
  });

  const accounts = (accountsRes?.data as Account[] | undefined) ?? [];

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId && !newCategoryInput) {
      setSelectedCategoryId(categories[0].id);
      setSelectedCategoryName(categories[0].name);
    }
  }, [categories, selectedCategoryId, newCategoryInput]);

  // Auto-select first account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Create mutation (optimistic)
  const createMutation = useMutation({
    mutationFn: (vars: SaveVars) => api.voice.save({
      type: vars.type,
      amount: vars.amount,
      description: vars.description,
      suggestedCategoryName: vars.suggestedCategoryName,
      categoryId: vars.categoryId,
      accountId: vars.accountId,
      date: vars.date,
    }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      await queryClient.cancelQueries({ queryKey: ["balance"] });

      const prevTransactions = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]);
      const prevBalance = queryClient.getQueryData<number>(["balance"]);

      const delta = variables.type === "EXPENSE" ? -variables.amount : variables.amount;
      queryClient.setQueryData<number>(["balance"], (old) => (old ?? 0) + delta);

      queryClient.setQueryData<Transaction[]>(["transactions", "recent"], (old) => {
        const optimistic: Transaction = {
          id: `optimistic-${Date.now()}`,
          type: variables.type,
          amount: String(variables.amount),
          description: variables.description,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          account: { id: "", name: "Efectivo", type: "CASH" },
          category: variables.categoryId
            ? { id: variables.categoryId, name: variables.suggestedCategoryName, type: variables.type }
            : null,
        };
        return [optimistic, ...(old ?? [])];
      });

      return { prevTransactions, prevBalance };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevBalance !== undefined) {
        queryClient.setQueryData(["balance"], context.prevBalance);
      }
      if (context?.prevTransactions !== undefined) {
        queryClient.setQueryData(["transactions", "recent"], context.prevTransactions);
      }
      toast.error("Error de conexión al guardar");
    },
    onSuccess: async (res, _vars, context) => {
      if (!res.success) {
        // Rollback optimistic update on API-level error
        if (context?.prevBalance !== undefined) {
          queryClient.setQueryData(["balance"], context.prevBalance);
        }
        if (context?.prevTransactions !== undefined) {
          queryClient.setQueryData(["transactions", "recent"], context.prevTransactions);
        }
        toast.error(extractErrorMessage(res.error));
        return;
      }
      await invalidateTransactions();
      toast.success("✓ Registrado");
      handleClose();
    },
  });

  // Update mutation (no optimistic — por simplicidad y consistencia)
  const updateMutation = useMutation({
    mutationFn: async (vars: SaveVars & { id: string; date: string }) =>
      api.transactions.update(vars.id, {
        type: vars.type,
        amount: vars.amount,
        description: vars.description,
        categoryId: vars.categoryId,
        accountId: vars.accountId ?? undefined,
        date: vars.date,
      }),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(extractErrorMessage(res.error));
        return;
      }
      await invalidateTransactions();
      toast.success("✓ Actualizado");
      handleClose();
    },
    onError: () => {
      toast.error("Error de conexión al actualizar");
    },
  });

  const handleClose = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName("");
    onClose();
  };

  const handleChipSelect = (cat: TransactionCategory) => {
    setSelectedCategoryId(cat.id);
    setSelectedCategoryName(cat.name);
    setNewCategoryInput("");
  };

  const handleNewCategoryType = (val: string) => {
    setNewCategoryInput(val);
    if (val.trim()) {
      setSelectedCategoryId(null);
      setSelectedCategoryName("");
    }
  };

  const parsedAmount = parseFloat(rawAmount) || 0;
  const effectiveCategoryName = newCategoryInput.trim() || selectedCategoryName;
  const canSubmit =
    parsedAmount > 0 &&
    effectiveCategoryName.length > 0 &&
    !createMutation.isPending &&
    !updateMutation.isPending;

  // Handle numeric-only input
  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setRawAmount(cleaned === "" ? "" : String(parseInt(cleaned, 10)));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const categoryName = newCategoryInput.trim() || selectedCategoryName;
    if (!categoryName) return;

    const vars: SaveVars = {
      type,
      amount: parseFloat(rawAmount),
      description: description.trim() || undefined,
      suggestedCategoryName: categoryName,
      categoryId: newCategoryInput.trim() ? null : selectedCategoryId,
      accountId: selectedAccountId,
      date: editingTransaction?.date ?? new Date().toISOString(),
    };

    // Modo offline: guardar en IDB
    if (!isOnline && !editingTransaction) {
      try {
        const payload: OfflineTransactionPayload = {
          type: vars.type,
          amount: vars.amount,
          description: vars.description,
          suggestedCategoryName: vars.suggestedCategoryName,
          categoryId: vars.categoryId,
          accountId: vars.accountId,
          date: vars.date,
        };
        await enqueueOffline(payload);
        toast.info("Sin conexión — se enviará automáticamente");
        handleClose();

        // Registrar Background Sync si está disponible
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          try {
            const reg = await navigator.serviceWorker.ready;
            await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-transactions");
          } catch (err) {
            console.log("[AddTransactionSheet] Background Sync no disponible:", err);
          }
        }
        return;
      } catch (err) {
        console.error("[AddTransactionSheet] Enqueue error:", err);
        toast.error("Error al guardar sin conexión");
        return;
      }
    }

    // Modo edición offline
    if (!isOnline && editingTransaction) {
      toast.warning("Necesitas conexión para editar");
      return;
    }

    // Modo online: llamada directa a la API
    if (editingTransaction) {
      updateMutation.mutate({ ...vars, id: editingTransaction.id, date: vars.date });
    } else {
      createMutation.mutate(vars);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="add-tx-backdrop"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="add-tx-sheet"
            className="fixed bottom-0 left-0 right-0 z-[61] max-w-sm mx-auto rounded-t-[32px] px-6 pt-5 pb-10"
            style={{
              backgroundColor: "var(--background)",
              borderTop:
                "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
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

            <div className="flex flex-col gap-6 pt-1">

              {/* Title */}
              <p className="text-sm font-semibold text-foreground">
                {isEditing ? "Editar movimiento" : "Registrar movimiento"}
              </p>

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/50">
                <button
                  onClick={() => setType("EXPENSE")}
                  className={cn(
                    "py-3 rounded-xl text-sm font-bold transition-all duration-200",
                    type === "EXPENSE"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Gasto
                </button>
                <button
                  onClick={() => setType("INCOME")}
                  className={cn(
                    "py-3 rounded-xl text-sm font-bold transition-all duration-200",
                    type === "INCOME"
                      ? "bg-lime text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Ingreso
                </button>
              </div>

              {/* Amount input */}
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rawAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className={cn(
                    "w-full text-center text-5xl font-black font-nums bg-transparent border-0 outline-none focus:outline-none placeholder:text-muted-foreground/30",
                    type === "INCOME" ? "text-lime" : "text-foreground"
                  )}
                />
                <p className="text-sm text-muted-foreground font-nums">
                  {parsedAmount > 0
                    ? formatCOP(parsedAmount)
                    : "Ingresa un monto"}
                </p>
              </div>

              {/* Account chips */}
              {accounts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                    Cuenta
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150",
                          selectedAccountId === acc.id
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

              {/* Category chips */}
              {categories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                    Categoría
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleChipSelect(cat)}
                        className={cn(
                          "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150",
                          selectedCategoryId === cat.id && !newCategoryInput
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* New category input */}
              <div className="flex flex-col gap-1">
                <Input
                  type="text"
                  placeholder={categories.length === 0 ? "Categoría (requerido)" : "Nueva categoría..."}
                  value={newCategoryInput}
                  onChange={(e) => handleNewCategoryType(e.target.value)}
                  className={cn(
                    "bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40",
                    submitAttempted && effectiveCategoryName.length === 0 &&
                      "ring-1 ring-destructive/60 bg-destructive/5"
                  )}
                />
                {submitAttempted && effectiveCategoryName.length === 0 && (
                  <p className="text-[11px] text-destructive/80 px-1">
                    Elige o escribe una categoría
                  </p>
                )}
              </div>

              {/* Description */}
              <Input
                type="text"
                placeholder="Nota (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
              />

              {/* Submit */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
                  {isEditing
                    ? (updateMutation.isPending ? "Guardando..." : "Guardar cambios")
                    : (createMutation.isPending ? "Registrando..." : "Registrar")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="w-full text-muted-foreground"
                >
                  Cancelar
                </Button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Versión global — lee el store, sin necesidad de props.
 * Montar en layout.tsx junto al VoiceModal.
 */
export function GlobalAddTransactionSheet() {
  const { isOpen, defaultType, editingTransaction, close } = useAddTransactionStore();
  return (
    <AddTransactionSheet
      isOpen={isOpen}
      onClose={close}
      defaultType={defaultType}
      editingTransaction={editingTransaction}
    />
  );
}
