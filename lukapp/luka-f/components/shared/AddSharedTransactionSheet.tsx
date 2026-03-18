"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAddSharedTransaction, useUpdateSharedTransaction } from "@/lib/hooks/use-spaces";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import type { SharedBudget, SharedTransaction } from "@/lib/types/shared";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.05 } },
};

const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 28, stiffness: 280 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.25, ease: "easeIn" as const } },
};

interface AddSharedTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  budgets: SharedBudget[];
  defaultBudgetId?: string | null;
  editingTransaction?: SharedTransaction | null;
}

export function AddSharedTransactionSheet({
  isOpen,
  onClose,
  spaceId,
  budgets,
  defaultBudgetId,
  editingTransaction = null,
}: AddSharedTransactionSheetProps) {
  const isEditing = !!editingTransaction;

  const [rawAmount, setRawAmount] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  // Pre-fill when editing
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        const amountNum = Number(editingTransaction.amount);
        setRawAmount(amountNum.toLocaleString("es-CO"));
        setSelectedBudgetId(editingTransaction.sharedBudgetId ?? null);
        setDescription(editingTransaction.description ?? "");
      } else {
        setRawAmount("");
        setSelectedBudgetId(defaultBudgetId ?? null);
        setDescription("");
      }
    }
  }, [isOpen, editingTransaction, defaultBudgetId]);

  const { mutateAsync: addTx, isPending: adding } = useAddSharedTransaction();
  const { mutateAsync: updateTx, isPending: updating } = useUpdateSharedTransaction();
  const isPending = adding || updating;

  const amount = parseFloat(rawAmount.replace(/\./g, "").replace(",", ".")) || 0;

  const handleClose = () => {
    setRawAmount("");
    setSelectedBudgetId(null);
    setDescription("");
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, "");
    setRawAmount(val ? Number(val).toLocaleString("es-CO") : "");
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    let res;
    if (isEditing) {
      res = await updateTx({
        id: spaceId,
        txId: editingTransaction!.id,
        data: {
          amount,
          sharedBudgetId: selectedBudgetId,
          description: description.trim() || null,
        },
      });
    } else {
      res = await addTx({
        id: spaceId,
        data: {
          amount,
          sharedBudgetId: selectedBudgetId ?? undefined,
          description: description.trim() || undefined,
        },
      });
    }

    if (!res.success) {
      toast.error(res.error?.message ?? "Error al guardar");
      return;
    }

    haptics.success();
    toast.success(isEditing ? "Gasto actualizado" : "Gasto registrado");
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-60"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-60 bg-card rounded-t-3xl px-5 pt-5 pb-10 max-w-sm mx-auto"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? "Editar gasto" : "Gasto compartido"}
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Amount input */}
            <div className="flex items-center justify-center mb-6">
              <span className="text-3xl font-bold text-muted-foreground/40 mr-1">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className="text-4xl font-bold text-foreground bg-transparent outline-none text-center w-full placeholder:text-muted-foreground/20 font-nums tabular-nums"
              />
            </div>

            {/* Budget chips */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-muted-foreground/60 mb-2">Categoría</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedBudgetId(null)}
                  className={cn(
                    "shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors",
                    selectedBudgetId === null
                      ? "bg-primary text-white"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  Sin categoría
                </button>
                {budgets.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBudgetId(b.id)}
                    className={cn(
                      "shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors",
                      selectedBudgetId === b.id
                        ? "bg-primary text-white"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {b.categoryName}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nota (opcional)"
              className="w-full px-4 py-3 rounded-2xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/30 mb-4 transition-all"
            />

            {/* Save button */}
            <button
              onClick={handleSubmit}
              disabled={amount <= 0 || isPending}
              className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm font-bold disabled:opacity-40 transition-opacity active:scale-[0.98]"
            >
              {isPending ? "Guardando..." : isEditing ? "Actualizar gasto" : "Guardar gasto"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
