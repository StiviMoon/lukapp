"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn, formatCOP } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { BudgetBar } from "./BudgetBar";
import {
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  currentMonthRange,
} from "@/lib/hooks/use-budgets";
import type { BudgetStatus } from "@/lib/types/budget";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface BudgetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  existingBudget: BudgetStatus | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BudgetSheet({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  existingBudget,
}: BudgetSheetProps) {
  const [rawAmount, setRawAmount] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const isEditing = Boolean(existingBudget);
  const isPending = createBudget.isPending || updateBudget.isPending || deleteBudget.isPending;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setRawAmount(
        existingBudget ? String(Math.trunc(Number(existingBudget.amount))) : ""
      );
      setConfirmDelete(false);
    }
  }, [isOpen, existingBudget]);

  const parsedAmount = parseFloat(rawAmount) || 0;
  const canSubmit = parsedAmount > 0 && !isPending;

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setRawAmount(cleaned === "" ? "" : String(parseInt(cleaned, 10)));
  };

  const handleSubmit = async () => {
    const { startDate, endDate } = currentMonthRange();

    if (isEditing && existingBudget) {
      const res = await updateBudget.mutateAsync({
        id: existingBudget.id,
        categoryId,
        amount: parsedAmount,
        period: "MONTHLY",
        startDate,
        endDate,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al actualizar presupuesto");
        return;
      }
      toast.success("Presupuesto actualizado");
    } else {
      const res = await createBudget.mutateAsync({
        categoryId,
        amount: parsedAmount,
        period: "MONTHLY",
        startDate,
        endDate,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al crear presupuesto");
        return;
      }
      toast.success("Presupuesto creado");
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!existingBudget) return;
    const res = await deleteBudget.mutateAsync(existingBudget.id);
    if (!res.success) {
      toast.error(res.error?.message ?? "Error al eliminar presupuesto");
      return;
    }
    toast.success("Presupuesto eliminado");
    onClose();
  };

  const monthLabel = format(new Date(), "MMMM yyyy", { locale: es });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — z-[70] para quedar sobre CategorySheet */}
          <motion.div
            key="budget-sheet-backdrop"
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Sheet — z-[71] */}
          <motion.div
            key="budget-sheet"
            className="fixed bottom-0 left-0 right-0 z-[71] max-w-sm mx-auto rounded-t-[32px] px-6 pt-5 pb-10"
            style={{
              backgroundColor: "var(--background)",
              borderTop: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.22)",
            }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-6 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-5">
              {/* Header */}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isEditing ? "Editar presupuesto" : "Crear presupuesto"}
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5 capitalize">
                  {categoryName} · {monthLabel}
                </p>
              </div>

              {/* Amount input */}
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rawAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full text-center text-5xl font-black font-nums bg-transparent border-0 outline-none focus:outline-none placeholder:text-muted-foreground/30 text-primary"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground font-nums">
                  {parsedAmount > 0 ? formatCOP(parsedAmount) : "Ingresa el límite mensual"}
                </p>
              </div>

              {/* Current progress preview (edit mode) */}
              {isEditing && existingBudget && (
                <div className="px-4 py-3.5 rounded-2xl bg-card">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 mb-2">
                    Este mes
                  </p>
                  <BudgetBar
                    spent={existingBudget.spent}
                    total={parsedAmount > 0 ? parsedAmount : Number(existingBudget.amount)}
                    percentage={
                      parsedAmount > 0
                        ? (existingBudget.spent / parsedAmount) * 100
                        : existingBudget.percentage
                    }
                    remaining={
                      parsedAmount > 0
                        ? parsedAmount - existingBudget.spent
                        : existingBudget.remaining
                    }
                    isExceeded={
                      parsedAmount > 0
                        ? existingBudget.spent > parsedAmount
                        : existingBudget.isExceeded
                    }
                    showAmounts
                  />
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
                  {isPending
                    ? "Guardando..."
                    : isEditing
                    ? "Actualizar presupuesto"
                    : "Guardar presupuesto"}
                </Button>

                {/* Delete (edit mode) */}
                {isEditing && !confirmDelete && (
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/8"
                  >
                    Eliminar presupuesto
                  </Button>
                )}
                {isEditing && confirmDelete && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 text-muted-foreground"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleteBudget.isPending}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                    >
                      {deleteBudget.isPending ? "Eliminando..." : "Confirmar"}
                    </Button>
                  </div>
                )}

                {!isEditing && (
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
