"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfMonth, endOfMonth, format, addMonths, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Settings2 } from "lucide-react";
import { api, type AnalyticsSummary } from "@/lib/api/client";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { TransactionDetailSheet } from "@/components/dashboard/TransactionDetailSheet";
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
  pct: number;
}

const CATEGORY_COLORS = [
  "#7C6FCD","#4ABFA3","#E8794A","#D95F7F",
  "#5B8DD9","#8BC34A","#F4C542","#A16AE8",
  "#4BBFBF","#E85454",
];
function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_COLORS[h % CATEGORY_COLORS.length];
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return <div className="h-[70px] rounded-2xl bg-muted-foreground/10 animate-pulse" />;
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-muted-foreground/10" />
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
      </div>
      <div className="h-4 w-14 rounded bg-muted-foreground/10" />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      {/* Summary cards */}
      <div className="px-5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        {/* Balance row */}
        <div className="h-10 rounded-2xl bg-muted-foreground/10 animate-pulse" />
      </div>
      {/* Category rows */}
      <div className="px-5 space-y-2 pt-4">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </>
  );
}

function AnalyticsSummarySkeleton() {
  return (
    <div className="px-5 pb-3">
      <div className="h-[120px] rounded-2xl bg-muted-foreground/10 animate-pulse" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [currentMonth,      setCurrentMonth]      = useState(() => new Date());
  const [activeType,        setActiveType]        = useState<TxType>("EXPENSE");
  const [selectedCategory,  setSelectedCategory]  = useState<string | null>(null);
  const [selectedTx,        setSelectedTx]        = useState<Transaction | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [analyticsView,     setAnalyticsView]     = useState<"simple" | "advanced">("simple");

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: txData, isLoading: txRawLoading } = useQuery<Transaction[]>({
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

  const { data: mathData, isLoading: mathLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      const res = await api.analytics.getSummary();
      if (!res.success || !res.data) throw new Error(res.error?.message ?? "Error");
      return res.data;
    },
    staleTime: 60_000,
  });

  const isLoading    = useMinDelay(txRawLoading);
  const transactions = txData ?? [];

  const totalIncome  = useMemo(() => transactions.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const net          = totalIncome - totalExpense;

  // Breakdown por categoría (para el tipo activo)
  const categoryRows: CategoryRow[] = useMemo(() => {
    const map   = new Map<string, { amount: number; count: number }>();
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

  const visibleCategoryRows = useMemo(
    () => (showAllCategories ? categoryRows : categoryRows.slice(0, 5)),
    [categoryRows, showAllCategories],
  );

  // Transacciones filtradas (para el drill-down de categoría)
  const filteredTxs = useMemo(() => {
    return transactions
      .filter(t => t.type === activeType)
      .filter(t => !selectedCategory || (t.category?.name ?? "Sin categoría") === selectedCategory)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeType, selectedCategory]);

  const selectedTotal = useMemo(
    () => filteredTxs.reduce((s, t) => s + Number(t.amount), 0),
    [filteredTxs],
  );

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: es });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  // Cambio de tipo limpia el filtro de categoría
  const handleTypeChange = (type: TxType) => {
    setActiveType(type);
    setSelectedCategory(null);
    setShowAllCategories(false);
  };

  return (
    <>
      <div className="h-dvh flex flex-col bg-background overflow-hidden max-w-sm mx-auto">

        {/* ═══ HEADER FIJO ═══ */}
        <div className="flex-none px-5 pt-12 pb-3 space-y-4">

          {/* Título + ajustes + navegación de mes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-bold text-foreground font-display">Analíticas</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/settings")}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-card border border-border/60 text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95"
                aria-label="Ajustes"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground/70">{monthTitle}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentMonth(m => subMonths(m, 1));
                  setSelectedCategory(null);
                  setShowAllCategories(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(m => addMonths(m, 1));
                  setSelectedCategory(null);
                  setShowAllCategories(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors active:scale-95"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

        </div>

        {/* ═══ CONTENIDO SCROLLEABLE ═══ */}
        <div className="flex-1 overflow-y-auto overscroll-contain pt-2 pb-32">

          {isLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {/* Analiticas matematicas integradas */}
              {mathLoading ? (
                <AnalyticsSummarySkeleton />
              ) : mathData ? (
                <div className="px-5 pb-3">
                  <div className="flex gap-1.5 rounded-xl bg-muted/50 p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("simple")}
                      className={cn(
                        "flex-1 rounded-lg py-2 text-[11px] font-semibold transition-colors",
                        analyticsView === "simple"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Resumen
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("advanced")}
                      className={cn(
                        "flex-1 rounded-lg py-2 text-[11px] font-semibold transition-colors",
                        analyticsView === "advanced"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Más detalle
                    </button>
                  </div>

                  {analyticsView === "simple" ? (
                    <div className="rounded-2xl border border-border/60 bg-card px-3.5 py-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0",
                            mathData.health.level === "estable"
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/12"
                              : mathData.health.level === "riesgo"
                              ? "text-amber-800 dark:text-amber-400 bg-amber-500/12"
                              : "text-rose-700 dark:text-rose-400 bg-rose-500/12",
                          )}
                        >
                          {mathData.health.level === "estable"
                            ? "Vas bien"
                            : mathData.health.level === "riesgo"
                            ? "Ojo ahí"
                            : "Atención"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                          {mathData.health.score}/100
                        </span>
                      </div>
                      <p className="text-[13px] leading-snug text-foreground font-medium">
                        {mathData.today.insight}
                      </p>
                      <p className="text-[12px] leading-snug text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Tip: </span>
                        {mathData.today.action}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                        <span className="text-[11px] text-muted-foreground">En ~30 días</span>
                        <span
                          className={cn(
                            "text-[15px] font-bold font-nums tabular-nums",
                            mathData.forecast.next30Days >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {formatCOP(mathData.forecast.next30Days)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-card px-3.5 py-3 space-y-2.5 text-[12px]">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Números extra (si te sirven)
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground shrink-0">Gasto por día</span>
                          <span className="font-semibold font-nums text-right">{formatCOP(mathData.balances.burnRateDaily)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground shrink-0">Te alcanza para</span>
                          <span className="font-semibold font-nums text-right">
                            {mathData.balances.runwayDays != null ? `${mathData.balances.runwayDays} días` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground shrink-0">~90 días</span>
                          <span className={cn(
                            "font-semibold font-nums text-right",
                            mathData.forecast.next90Days >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                          )}>
                            {formatCOP(mathData.forecast.next90Days)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/80 pt-0.5">
                        Confianza del cálculo:{" "}
                        {mathData.forecast.confidence === "alta"
                          ? "alta"
                          : mathData.forecast.confidence === "media"
                          ? "media"
                          : "baja (poca historia)"}
                      </p>
                      {mathData.alerts.length > 0 && (
                        <ul className="pt-1 space-y-1 border-t border-border/50">
                          {mathData.alerts.slice(0, 2).map((alert) => (
                            <li key={alert} className="text-[11px] text-rose-600 dark:text-rose-400 leading-snug pl-2 border-l-2 border-rose-500/40">
                              {alert}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Summary cards */}
              <div className="px-5 space-y-2 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Ingresos */}
                  <button
                    onClick={() => handleTypeChange("INCOME")}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-left transition-all duration-200 active:scale-95",
                      activeType === "INCOME"
                        ? "bg-emerald-500/18 ring-[1.5px] ring-emerald-500/50"
                        : "bg-emerald-500/8 hover:bg-emerald-500/12",
                    )}
                    style={{
                      background: activeType === "INCOME"
                        ? "color-mix(in srgb, #10b981 18%, transparent)"
                        : "color-mix(in srgb, #10b981 8%, transparent)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/60">Ingresos</span>
                    </div>
                    <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 font-nums leading-none truncate">
                      {formatCOP(totalIncome)}
                    </p>
                    <p className="text-[10px] text-emerald-600/50 dark:text-emerald-400/40 mt-1 font-medium">
                      {transactions.filter(t => t.type === "INCOME").length} movs.
                    </p>
                  </button>

                  {/* Gastos */}
                  <button
                    onClick={() => handleTypeChange("EXPENSE")}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-left transition-all duration-200 active:scale-95",
                    )}
                    style={{
                      background: activeType === "EXPENSE"
                        ? "color-mix(in srgb, #f43f5e 18%, transparent)"
                        : "color-mix(in srgb, #f43f5e 8%, transparent)",
                      boxShadow: activeType === "EXPENSE" ? "0 0 0 1.5px color-mix(in srgb, #f43f5e 50%, transparent)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-400/60">Gastos</span>
                    </div>
                    <p className="text-[18px] font-black text-rose-600 dark:text-rose-400 font-nums leading-none truncate">
                      {formatCOP(totalExpense)}
                    </p>
                    <p className="text-[10px] text-rose-600/50 dark:text-rose-400/40 mt-1 font-medium">
                      {transactions.filter(t => t.type === "EXPENSE").length} movs.
                    </p>
                  </button>
                </div>

                {/* Balance neto del mes */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-2xl",
                  net >= 0 ? "bg-emerald-500/8" : "bg-rose-500/8",
                )}
                  style={{ background: net >= 0 ? "color-mix(in srgb, #10b981 6%, transparent)" : "color-mix(in srgb, #f43f5e 6%, transparent)" }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Balance del mes
                  </span>
                  <span className={cn(
                    "text-[15px] font-black font-nums",
                    net >= 0 ? "text-emerald-500" : "text-rose-500",
                  )}>
                    {net >= 0 ? "+" : ""}{formatCOP(net)}
                  </span>
                </div>
              </div>

              {/* Category breakdown / transaction list */}
              {categoryRows.length === 0 ? (
                <div className="px-5 pt-4">
                  <div className="flex flex-col items-center justify-center py-20 rounded-[24px] bg-card gap-2">
                    <p className="text-sm font-semibold text-muted-foreground/40">
                      Sin {activeType === "EXPENSE" ? "gastos" : "ingresos"} este mes
                    </p>
                    <p className="text-xs text-muted-foreground/25">Registra tu primer movimiento</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Chips de filtro por categoría ── */}
                  <div className="px-5 pt-3 pb-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                      {/* Chip "Todas" */}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95",
                          !selectedCategory
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Todas
                      </button>

                      {categoryRows.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => setSelectedCategory(prev => prev === cat.name ? null : cat.name)}
                          className={cn(
                            "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95",
                            selectedCategory === cat.name
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: hashColor(cat.name) }}
                          />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Vista según filtro ── */}
                  <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                      /* Breakdown de categorías */
                      <motion.div
                        key="breakdown"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="px-5 space-y-2"
                      >
                        {visibleCategoryRows.map(cat => (
                          <CategoryCard
                            key={cat.name}
                            cat={cat}
                            type={activeType}
                            onSelect={() => setSelectedCategory(cat.name)}
                          />
                        ))}

                        {categoryRows.length > 5 && (
                          <button
                            onClick={() => setShowAllCategories(prev => !prev)}
                            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-muted/70 text-foreground/80 hover:bg-muted transition-colors"
                          >
                            {showAllCategories
                              ? "Mostrar menos"
                              : `Mostrar más (${categoryRows.length - 5} categorías)`}
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      /* Lista de transacciones de la categoría */
                      <motion.div
                        key={`txlist-${selectedCategory}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="px-5 space-y-2"
                      >
                        {/* Sub-header de la categoría seleccionada */}
                        <div className="flex items-center justify-between py-1 px-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: hashColor(selectedCategory) }}
                            />
                            <p className="text-[13px] font-bold text-foreground">{selectedCategory}</p>
                            <span className="text-[11px] text-muted-foreground/50 font-medium">
                              · {filteredTxs.length} {filteredTxs.length === 1 ? "mov." : "movs."}
                            </span>
                          </div>
                          <p className={cn(
                            "text-[15px] font-black font-nums",
                            activeType === "INCOME" ? "text-emerald-500" : "text-rose-500",
                          )}>
                            {activeType === "INCOME" ? "+" : "-"}{formatCOP(selectedTotal)}
                          </p>
                        </div>

                        {filteredTxs.length === 0 ? (
                          <div className="flex items-center justify-center py-12 rounded-[20px] bg-card">
                            <p className="text-sm text-muted-foreground/40">Sin movimientos</p>
                          </div>
                        ) : (
                          filteredTxs.map(tx => (
                            <TransactionItem
                              key={tx.id}
                              transaction={tx}
                              onClick={() => setSelectedTx(tx)}
                            />
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <TransactionDetailSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat, type, onSelect,
}: {
  cat: CategoryRow; type: TxType; onSelect: () => void;
}) {
  const isExpense = type === "EXPENSE";
  const color     = hashColor(cat.name);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/40 active:scale-[0.98] transition-all duration-150 text-left"
    >
      {/* Color dot avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {cat.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[13px] font-semibold text-foreground truncate">{cat.name}</p>
          <span className="text-[11px] font-bold ml-2 shrink-0 text-muted-foreground/50">
            {cat.pct.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(cat.pct, 2)}%`,
              backgroundColor: color,
              opacity: 0.7,
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          {cat.count} {cat.count === 1 ? "movimiento" : "movimientos"}
        </p>
      </div>

      {/* Amount */}
      <p className={cn(
        "text-[14px] font-bold font-nums shrink-0 ml-1",
        isExpense ? "text-rose-500" : "text-emerald-500",
      )}>
        {formatCOP(cat.amount)}
      </p>
    </button>
  );
}
