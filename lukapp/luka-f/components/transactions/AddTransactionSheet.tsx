"use client";

import { useState, useEffect, useRef, lazy } from "react";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TransactionCategory } from "@/lib/types/transaction";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
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
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AddTransactionSheet({
  isOpen,
  onClose,
  defaultType = "EXPENSE",
}: AddTransactionSheetProps) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<"INCOME" | "EXPENSE">(defaultType);
  const [rawAmount, setRawAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setRawAmount("");
      setDescription("");
      setNewCategoryInput("");
      // Focus amount input after animation settles
      const timer = setTimeout(() => amountInputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultType]);

  // Fetch categories
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.getAll(),
    enabled: isOpen,
    staleTime: 60_000,
  });

  const categories =
    (categoriesRes?.data as TransactionCategory[] | undefined) ?? [];

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId && !newCategoryInput) {
      setSelectedCategoryId(categories[0].id);
      setSelectedCategoryName(categories[0].name);
    }
  }, [categories, selectedCategoryId, newCategoryInput]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      const amount = parseFloat(rawAmount);
      const categoryName = newCategoryInput.trim() || selectedCategoryName;
      return api.voice.save({
        type,
        amount,
        description: description.trim() || undefined,
        suggestedCategoryName: categoryName,
        categoryId: newCategoryInput.trim() ? null : selectedCategoryId,
      });
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al registrar");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "month"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("✓ Registrado");
      handleClose();
    },
    onError: () => {
      toast.error("Error de conexión al guardar");
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
  const canSubmit = parsedAmount > 0 && !saveMutation.isPending;

  // Handle numeric-only input
  const handleAmountChange = (val: string) => {
    // Allow digits only, strip leading zeros
    const cleaned = val.replace(/[^0-9]/g, "");
    setRawAmount(cleaned === "" ? "" : String(parseInt(cleaned, 10)));
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
                Registrar movimiento
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
                      ? "bg-emerald-500 text-white shadow-sm"
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
                    type === "INCOME" ? "text-emerald-500" : "text-foreground"
                  )}
                />
                <p className="text-sm text-muted-foreground font-nums">
                  {parsedAmount > 0
                    ? formatCOP(parsedAmount)
                    : "Ingresa un monto"}
                </p>
              </div>

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
              <Input
                type="text"
                placeholder="Nueva categoría..."
                value={newCategoryInput}
                onChange={(e) => handleNewCategoryType(e.target.value)}
                className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
              />

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
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!canSubmit}
                  className="w-full"
                >
                  {saveMutation.isPending ? "Registrando..." : "Registrar"}
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
  const { isOpen, defaultType, close } = useAddTransactionStore();
  return (
    <AddTransactionSheet isOpen={isOpen} onClose={close} defaultType={defaultType} />
  );
}
