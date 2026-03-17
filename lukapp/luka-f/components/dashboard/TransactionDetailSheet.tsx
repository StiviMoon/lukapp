"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { api } from "@/lib/api/client";
import { useInvalidateTransactions } from "@/lib/hooks/use-invalidate-transactions";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "@/lib/types/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#7C6FCD",
  "#4ABFA3",
  "#E8794A",
  "#D95F7F",
  "#5B8DD9",
  "#8BC34A",
  "#F4C542",
  "#A16AE8",
  "#4BBFBF",
  "#E85454",
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Animation variants ───────────────────────────────────────────────────────

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

// ─── Row component ────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
        {label}
      </span>
      <span className="text-[13px] font-medium text-foreground text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionDetailSheet({
  transaction,
  onClose,
}: TransactionDetailSheetProps) {
  const isOpen = transaction !== null;

  return (
    <AnimatePresence>
      {isOpen && transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            key="detail-backdrop"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="detail-sheet"
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
              onClick={onClose}
              className="absolute top-5 right-6 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <TransactionDetailContent transaction={transaction} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Inner content (avoids hooks-in-conditional issues) ───────────────────────

function TransactionDetailContent({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const { type, amount, description, date, createdAt, account, category } = transaction;
  const invalidateTransactions = useInvalidateTransactions();
  const { openEdit } = useAddTransactionStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isIncome = type === "INCOME";
  const categoryName = category?.name ?? (isIncome ? "Ingreso" : "Gasto");
  const color = hashColor(categoryName);
  const numAmount = Number(amount);

  const txDate = new Date(date);
  const createdDate = new Date(createdAt);

  const fullDate = format(txDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const time = format(txDate, "hh:mm a");
  const createdDisplay = format(createdDate, "d MMM yyyy, hh:mm a", { locale: es });

  const deleteMutation = useMutation({
    mutationFn: async () => api.transactions.delete(transaction.id),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al eliminar");
        return;
      }
      await invalidateTransactions();
      toast.success("Transacción eliminada");
      onClose();
    },
    onError: () => toast.error("Error de conexión al eliminar"),
  });

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            isIncome
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isIncome ? "Ingreso" : "Gasto"}
        </span>
      </div>

      {/* Amount */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1.5">
          Monto
        </p>
        <p
          className={`text-[42px] font-black tracking-tight leading-none font-nums ${
            isIncome ? "text-emerald-500" : "text-foreground"
          }`}
        >
          {formatCOP(numAmount)}
        </p>
      </div>

      {/* Detail rows */}
      <div className="rounded-2xl bg-card px-4 py-1">
        <DetailRow
          label="Categoría"
          value={
            <span className="flex items-center gap-1.5 justify-end">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {categoryName}
            </span>
          }
        />
        <DetailRow label="Cuenta" value={account.name} />
        {description && <DetailRow label="Descripción" value={description} />}
        <DetailRow label="Fecha" value={fullDate} />
        <DetailRow label="Hora" value={time} />
        <DetailRow label="Registrado" value={createdDisplay} />
      </div>

      {/* Actions */}
      <div className="pt-1 flex flex-col gap-2">
        <Button
          type="button"
          onClick={() => {
            openEdit(transaction);
            onClose();
          }}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => setConfirmOpen(true)}
          className="w-full bg-red-500 text-white hover:bg-red-600/90 dark:bg-red-500 dark:hover:bg-red-600/90 shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Eliminar este registro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El balance y tus estadísticas se actualizarán.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-500 text-white hover:bg-red-600/90 shadow-sm"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                await deleteMutation.mutateAsync();
                setConfirmOpen(false);
              }}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
