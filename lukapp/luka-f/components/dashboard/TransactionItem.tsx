"use client";

import { isToday, isYesterday, differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";
import type { Transaction } from "@/lib/types/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#7C6FCD", // violet
  "#4ABFA3", // teal
  "#E8794A", // orange
  "#D95F7F", // pink
  "#5B8DD9", // blue
  "#8BC34A", // green
  "#F4C542", // yellow
  "#A16AE8", // purple
  "#4BBFBF", // cyan
  "#E85454", // red
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  const diff = differenceInDays(new Date(), date);
  if (diff < 7) return `Hace ${diff} días`;
  return format(date, "d MMM", { locale: es });
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { type, amount, description, date, category } = transaction;

  const categoryName = category?.name ?? (type === "INCOME" ? "Ingreso" : "Gasto");
  const color = hashColor(categoryName);
  const initial = categoryName.charAt(0).toUpperCase();
  const numAmount = Number(amount);
  const isIncome = type === "INCOME";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/40 active:scale-[0.98] transition-all duration-150 text-left"
    >
      {/* Category circle */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
          {categoryName}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight truncate">
            {description}
          </p>
        )}
      </div>

      {/* Amount + date */}
      <div className="flex flex-col items-end shrink-0 gap-0.5">
        <span
          className={`text-[14px] font-bold font-nums leading-tight ${
            isIncome ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCOP(numAmount)}
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-medium">
          {relativeDate(date)}
        </span>
      </div>
    </button>
  );
}
