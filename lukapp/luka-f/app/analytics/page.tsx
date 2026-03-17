"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, format, addMonths, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Transaction } from "@/lib/types/transaction";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n);
}

type TxType = "EXPENSE" | "INCOME";

interface CategoryRow {
  name: string;
  amount: number;
  count: number;
  pct: number;      // % del total del tipo
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-muted-foreground/10" />
        <div className="h-1.5 rounded-full bg-muted-foreground/10" />
      </div>
      <div className="h-3.5 w-16 rounded bg-muted-foreground/10" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeType,   setActiveType]   = useState<TxType>("EXPENSE");

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: txData, isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", "month", year, month],
    queryFn: async () => {
      const res = await api.transactions.getAll({
        startDate: startOfMonth(currentMonth),
        endDate:   endOfMonth(currentMonth),
        limit: 500,
      });
      if (!res.success) throw new Error(res.error?.message ?? "Error");
      return (res.data ?? []) as Transaction[];
    },
    staleTime: 2 * 60_000,
  });

  const transactions = txData ?? [];

  // Totales del mes
  const totalIncome  = useMemo(() =>
    transactions.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0),
  [transactions]);
  const totalExpense = useMemo(() =>
    transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
  [transactions]);

  // Breakdown por categoría
  const categories: CategoryRow[] = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    const total = activeType === "EXPENSE" ? totalExpense : totalIncome;

    for (const tx of transactions.filter(t => t.type === activeType)) {
      const key  = tx.category?.name ?? "Sin categoría";
      const prev = map.get(key) ?? { amount: 0, count: 0 };
      map.set(key, { amount: prev.amount + Number(tx.amount), count: prev.count + 1 });
    }

    return Array.from(map.entries())
      .map(([name, { amount, count }]) => ({
        name, amount, count,
        pct: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, activeType, totalIncome, totalExpense]);

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: es });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const activeTotal = activeType === "EXPENSE" ? totalExpense : totalIncome;

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden max-w-sm mx-auto">

      {/* ═══ HEADER FIJO ═══ */}
      <div className="flex-none px-5 pt-12 pb-4 space-y-4">

        {/* Título */}
        <h1 className="text-[22px] font-bold text-foreground font-display">Analíticas</h1>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-bold text-foreground">{monthTitle}</p>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Cards resumen */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            <div className="h-16 rounded-2xl bg-muted-foreground/10" />
            <div className="h-16 rounded-2xl bg-muted-foreground/10" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveType("INCOME")}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-3.5 py-3 transition-all duration-150 active:scale-95 text-left",
                activeType === "INCOME"
                  ? "bg-emerald-500/20 ring-2 ring-emerald-500/40"
                  : "bg-emerald-500/10",
              )}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">
                  Ingresos
                </p>
                <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 font-nums leading-tight truncate">
                  {formatCOP(totalIncome)}
                </p>
              </div>
            </button>
            <button
              onClick={() => setActiveType("EXPENSE")}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-3.5 py-3 transition-all duration-150 active:scale-95 text-left",
                activeType === "EXPENSE"
                  ? "bg-rose-500/20 ring-2 ring-rose-500/40"
                  : "bg-rose-500/10",
              )}
            >
              <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-400/70">
                  Gastos
                </p>
                <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400 font-nums leading-tight truncate">
                  {formatCOP(totalExpense)}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Label sección */}
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 px-1">
          Por categoría · {activeType === "EXPENSE" ? "Gastos" : "Ingresos"}
        </p>
      </div>

      {/* ═══ LISTA SCROLLEABLE ═══ */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-32 space-y-2">

        {isLoading ? (
          <>
            <RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton />
          </>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[24px] bg-card gap-2">
            <p className="text-sm font-semibold text-muted-foreground/40">
              Sin {activeType === "EXPENSE" ? "gastos" : "ingresos"} este mes
            </p>
            <p className="text-xs text-muted-foreground/25">Registra tu primer movimiento</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <CategoryCard
              key={cat.name}
              cat={cat}
              total={activeTotal}
              type={activeType}
              rank={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat, type, rank,
}: {
  cat: CategoryRow; total: number; type: TxType; rank: number;
}) {
  const isExpense = type === "EXPENSE";
  const barColor  = isExpense ? "bg-rose-500" : "bg-emerald-500";
  const pctColor  = isExpense ? "text-rose-500" : "text-emerald-500";

  // Initial letter for the avatar
  const letter = cat.name.charAt(0).toUpperCase();

  // Subtle bg for the rank icon
  const avatarBg = isExpense
    ? "bg-rose-500/10 text-rose-500"
    : "bg-emerald-500/10 text-emerald-500";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card">
      {/* Letter avatar */}
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold", avatarBg)}>
        {letter}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[13px] font-semibold text-foreground truncate">{cat.name}</p>
          <span className={cn("text-[11px] font-bold ml-2 shrink-0", pctColor)}>
            {cat.pct.toFixed(0)}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${Math.max(cat.pct, 2)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          {cat.count} {cat.count === 1 ? "movimiento" : "movimientos"}
        </p>
      </div>

      {/* Amount */}
      <p className="text-[13px] font-bold text-foreground font-nums shrink-0 ml-2">
        {formatCOP(cat.amount)}
      </p>
    </div>
  );
}
