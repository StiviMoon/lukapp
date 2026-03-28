"use client";

import { isToday, isYesterday, format } from "date-fns";
import { es } from "date-fns/locale";
import type { Transaction } from "@/lib/types/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Gradientes suaves por índice de color (iOS-style)
const CATEGORY_GRADIENTS = [
  ["#7C6FCD", "#9B8FE8"], // violet
  ["#4ABFA3", "#6DDBC2"], // teal
  ["#E8794A", "#F5A07A"], // orange
  ["#D95F7F", "#EF89A4"], // pink
  ["#5B8DD9", "#7BADF0"], // blue
  ["#5DAF3E", "#82CC60"], // green
  ["#D4A820", "#EEC84A"], // yellow
  ["#A16AE8", "#C298F5"], // purple
  ["#4BBFBF", "#72DCDC"], // cyan
  ["#E85454", "#F58080"], // red
];

function hashIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % CATEGORY_GRADIENTS.length;
}

function relativeDate(dateStr: string): string | null {
  const date = new Date(dateStr);
  if (isToday(date)) return null; // No mostrar fecha si es hoy — más limpio
  if (isYesterday(date)) return "Ayer";
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
  const idx          = hashIndex(categoryName);
  const [colorFrom, colorTo] = CATEGORY_GRADIENTS[idx];
  const initial      = categoryName.charAt(0).toUpperCase();
  const numAmount    = Number(amount);
  const isIncome     = type === "INCOME";
  const dateLabel    = relativeDate(date);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/40 active:scale-[0.97] transition-all duration-150 text-left"
    >
      {/* Category avatar — gradient */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white text-[13px] font-bold shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        }}
      >
        {initial}
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
          {categoryName}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground/55 mt-0.5 leading-tight truncate">
            {description}
          </p>
        )}
      </div>

      {/* Amount + date */}
      <div className="flex flex-col items-end shrink-0 gap-0.5">
        <span
          className={`text-[15px] font-bold font-nums leading-tight tabular-nums ${
            isIncome ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCOP(numAmount)}
        </span>
        {dateLabel && (
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            {dateLabel}
          </span>
        )}
      </div>
    </button>
  );
}
