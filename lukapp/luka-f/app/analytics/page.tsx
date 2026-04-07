"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfMonth, endOfMonth, format, addMonths, subMonths, eachMonthOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Settings2,
  AlertCircle, Zap, Clock, Target, Download, RefreshCw, Crown, Repeat2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api, type AnalyticsSummary, type RecurringExpense, type BudgetProjection, type RecurringEntry } from "@/lib/api/client";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { usePlan } from "@/lib/hooks/use-plan";
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

/** Compacto: 1.2M, 450k, etc. */
function formatCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)    return `$${(n / 1_000).toFixed(0)}k`;
  return formatCOP(n);
}

type TxType = "EXPENSE" | "INCOME";

interface CategoryRow {
  name: string;
  amount: number;
  count: number;
  pct: number;
}

const CATEGORY_GRADIENTS = [
  ["#7C6FCD", "#9B8FE8"],
  ["#4ABFA3", "#6DDBC2"],
  ["#E8794A", "#F5A07A"],
  ["#D95F7F", "#EF89A4"],
  ["#5B8DD9", "#7BADF0"],
  ["#5DAF3E", "#82CC60"],
  ["#D4A820", "#EEC84A"],
  ["#A16AE8", "#C298F5"],
  ["#4BBFBF", "#72DCDC"],
  ["#E85454", "#F58080"],
];

function hashIndex(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % CATEGORY_GRADIENTS.length;
}
function hashColor(name: string) {
  return CATEGORY_GRADIENTS[hashIndex(name)][0];
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl bg-muted-foreground/10 animate-pulse", className)} />;
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-muted-foreground/10" />
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
      </div>
      <div className="h-4 w-16 rounded bg-muted-foreground/10" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-3.5 pt-3.5 pb-3 animate-pulse">
      <div className="h-2.5 w-28 rounded-full bg-muted-foreground/10 mb-4" />
      {/* Fake chart bars */}
      <div className="flex items-end gap-2 h-[100px] px-1">
        {[60, 85, 45, 70, 90, 55].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-stretch justify-end">
            <div
              className="rounded-t bg-muted-foreground/10"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="h-2 w-16 rounded-full bg-muted-foreground/10" />
        <div className="h-2 w-14 rounded-full bg-muted-foreground/10" />
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-3 px-5 pt-1">
      {/* Tabs */}
      <div className="h-9 rounded-xl bg-muted-foreground/10 animate-pulse" />
      {/* Health card */}
      <CardSkeleton className="h-[120px]" />
      {/* Chart */}
      <ChartSkeleton />
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <CardSkeleton className="h-[80px]" />
        <CardSkeleton className="h-[80px]" />
      </div>
      <CardSkeleton className="h-[44px]" />
      {/* Category rows */}
      <div className="space-y-2 pt-1">
        <RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function exportCSV(transactions: Transaction[], monthLabel: string) {
  const rows = [
    ["Fecha", "Tipo", "Categoría", "Descripción", "Monto"].join(","),
    ...transactions.map((t) =>
      [
        new Date(t.date).toLocaleDateString("es-CO"),
        t.type === "INCOME" ? "Ingreso" : "Gasto",
        t.category?.name ?? "Sin categoría",
        `"${(t.description ?? "").replace(/"/g, '""')}"`,
        Number(t.amount).toFixed(0),
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lukapp-${monthLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isPremium } = usePlan();
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

  const {
    data: mathData,
    isLoading: mathLoading,
    isError: mathError,
  } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      const res = await api.analytics.getSummary();
      if (!res.success || !res.data) throw new Error(res.error?.message ?? "Error");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  // Datos de tendencia 6 meses para el gráfico
  const last6Months = useMemo(() => {
    return eachMonthOfInterval({
      start: subMonths(currentMonth, 5),
      end: currentMonth,
    }).map(m => ({
      month: format(m, "MMM", { locale: es }),
      year: m.getFullYear(),
      monthIdx: m.getMonth(),
    }));
  }, [currentMonth]);

  const { data: chartTxData, isLoading: chartLoading } = useQuery<{ month: string; income: number; expense: number }[]>({
    queryKey: ["analytics", "chart6m", year, month],
    queryFn: async () => {
      const results = await Promise.allSettled(
        last6Months.map(async ({ month, year, monthIdx }) => {
          const start = startOfMonth(new Date(year, monthIdx));
          const end   = endOfMonth(new Date(year, monthIdx));
          const res   = await api.transactions.getAll({ startDate: start, endDate: end, limit: 500 });
          const txs   = res.success ? ((res.data ?? []) as Transaction[]) : [];
          return {
            month,
            income:  txs.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0),
            expense: txs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
          };
        }),
      );
      return results
        .filter((r): r is PromiseFulfilledResult<{ month: string; income: number; expense: number }> => r.status === "fulfilled")
        .map(r => r.value);
    },
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const { data: recurringData } = useQuery<RecurringExpense[]>({
    queryKey: ["analytics", "recurring"],
    queryFn: async () => {
      const res = await api.analytics.getRecurring();
      if (!res.success || !res.data) return [];
      return res.data;
    },
    staleTime: 10 * 60_000,
    enabled: isPremium,
    retry: 0,
  });

  const isLoading    = useMinDelay(txRawLoading || mathLoading || chartLoading);
  const transactions = txData ?? [];

  const totalIncome  = useMemo(() => transactions.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const net          = totalIncome - totalExpense;

  const categoryRows: CategoryRow[] = useMemo(() => {
    const map   = new Map<string, { amount: number; count: number }>();
    const total = activeType === "EXPENSE" ? totalExpense : totalIncome;
    for (const tx of transactions.filter(t => t.type === activeType)) {
      const key  = tx.category?.name ?? "Sin categoría";
      const prev = map.get(key) ?? { amount: 0, count: 0 };
      map.set(key, { amount: prev.amount + Number(tx.amount), count: prev.count + 1 });
    }
    return Array.from(map.entries())
      .map(([name, { amount, count }]) => ({ name, amount, count, pct: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, activeType, totalIncome, totalExpense]);

  const visibleCategoryRows = useMemo(
    () => (showAllCategories ? categoryRows : categoryRows.slice(0, 5)),
    [categoryRows, showAllCategories],
  );

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

  const handleTypeChange = (type: TxType) => {
    setActiveType(type);
    setSelectedCategory(null);
    setShowAllCategories(false);
  };

  return (
    <>
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

        {/* ═══ HEADER ═══ */}
        <div className="flex-none px-5 pt-12 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-foreground font-display">Analíticas</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(transactions, format(currentMonth, "yyyy-MM", { locale: es }))}
                title="Exportar CSV"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-card border border-border/60 text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-card border border-border/60 text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setCurrentMonth(m => subMonths(m, 1)); setSelectedCategory(null); setShowAllCategories(false); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-[15px] font-semibold text-foreground">{monthTitle}</span>
            <button
              onClick={() => { setCurrentMonth(m => addMonths(m, 1)); setSelectedCategory(null); setShowAllCategories(false); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ═══ CONTENIDO ═══ */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-app-scroll">
          {isLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 px-5 pt-1"
            >

              {/* ── Sección analíticas math ── */}
              {mathLoading ? (
                <>
                  <div className="h-9 rounded-xl bg-muted-foreground/10 animate-pulse" />
                  <CardSkeleton className="h-[120px]" />
                  <ChartSkeleton />
                </>
              ) : mathError || !mathData ? (
                /* Error o sin datos: fallback graceful — NO crash */
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground/70">Análisis no disponible</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                      Registra más movimientos para activar el análisis financiero automático.
                    </p>
                  </div>
                </div>
              ) : (
                /* Analíticas disponibles */
                <>
                  {/* Tabs */}
                  <div className="flex gap-1.5 rounded-xl bg-muted/50 p-1">
                    {(["simple", "advanced"] as const).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setAnalyticsView(view)}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-[11px] font-semibold transition-all",
                          analyticsView === view
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {view === "simple" ? "Resumen" : "Más detalle"}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {analyticsView === "simple" ? (
                      <motion.div
                        key="simple"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3"
                      >
                        {/* Health score card */}
                        <div className="rounded-2xl border border-border/60 bg-card px-4 py-3.5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              {/* Score badge */}
                              <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[14px] tabular-nums shrink-0"
                                style={{
                                  background: mathData.health.level === "estable"
                                    ? "linear-gradient(135deg, var(--brand-lime-dark), var(--brand-lime))"
                                    : mathData.health.level === "riesgo"
                                    ? "linear-gradient(135deg, #B88A1E, #E0B84C)"
                                    : "linear-gradient(135deg, #8B2E3A, #C45A67)",
                                  color: "#1c1c1c",
                                  boxShadow: mathData.health.level === "estable"
                                    ? "0 3px 14px rgba(186,234,15,0.45)"
                                    : mathData.health.level === "riesgo"
                                    ? "0 3px 10px rgba(224,184,76,0.45)"
                                    : "0 3px 10px rgba(196,90,103,0.45)",
                                }}
                              >
                                {mathData.health.score}
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-foreground">
                                  {mathData.health.level === "estable" ? "Finanzas estables" : mathData.health.level === "riesgo" ? "Riesgo moderado" : "Requiere atención"}
                                </p>
                                <p className="text-[10px] text-muted-foreground/50">Score de salud financiera</p>
                              </div>
                            </div>
                            {/* Forecast 30d */}
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-muted-foreground/40 mb-0.5">En 30 días</p>
                              <p className={cn(
                                "text-[14px] font-bold font-nums tabular-nums",
                                (mathData.forecast?.next30Days ?? 0) >= 0 ? "text-lime" : "text-rose-500",
                              )}>
                                {(mathData.forecast?.next30Days ?? 0) >= 0 ? "+" : ""}
                                {formatCompact(mathData.forecast?.next30Days ?? 0)}
                              </p>
                            </div>
                          </div>

                          <p className="text-[13px] leading-relaxed text-foreground/75">
                            {mathData.today?.insight}
                          </p>

                          {mathData.today?.action && (
                            <div className="flex items-start gap-2 pt-2 border-t border-border/40">
                              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[12px] leading-relaxed text-muted-foreground/70">
                                <span className="font-semibold text-foreground/60">Acción: </span>
                                {mathData.today.action}
                              </p>
                            </div>
                          )}

                          {/* Razones del score — chips contextuales */}
                          {(mathData.health.reasons?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {mathData.health.reasons.map((reason) => (
                                <span
                                  key={reason}
                                  className={cn(
                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium leading-tight",
                                    mathData.health.level === "estable"
                                      ? "bg-lime/10 text-lime-dark dark:text-lime"
                                      : mathData.health.level === "riesgo"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                                  )}
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Alertas activas — solo visible si llegan del backend (Premium) */}
                        {(mathData.alerts?.length ?? 0) > 0 && (
                          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/6 px-4 py-3 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600/60 dark:text-amber-400/60">
                              Alertas financieras
                            </p>
                            {mathData.alerts!.map((alert) => (
                              <div key={alert} className="flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-foreground/75 leading-snug">{alert}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Gráfico tendencia */}
                        {chartTxData && chartTxData.length > 1 ? (
                          <div className="rounded-2xl border border-border/60 bg-card px-3.5 pt-3.5 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
                              Tendencia — últimos 6 meses
                            </p>
                            <ResponsiveContainer width="100%" height={120}>
                              <AreaChart data={chartTxData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="var(--brand-lime)" stopOpacity={0.45} />
                                    <stop offset="95%" stopColor="var(--brand-lime)" stopOpacity={0.02} />
                                  </linearGradient>
                                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#C45A67" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#C45A67" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                                <XAxis
                                  dataKey="month"
                                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.4 }}
                                  axisLine={false} tickLine={false}
                                />
                                <YAxis
                                  tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                                  tick={{ fontSize: 9, fill: "currentColor", opacity: 0.35 }}
                                  axisLine={false} tickLine={false} width={36}
                                />
                                <Tooltip
                                  contentStyle={{
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    padding: "8px 12px",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                  }}
                                  formatter={(val: number | undefined, name: string | undefined) => [
                                    formatCOP(val ?? 0),
                                    name === "income" ? "Ingresos" : "Gastos",
                                  ]}
                                  labelStyle={{ fontWeight: 600, marginBottom: 4, fontSize: 11 }}
                                  cursor={{ stroke: "rgba(128,128,128,0.15)", strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="income"  stroke="var(--brand-lime)" strokeWidth={2} fill="url(#gradIncome)"  dot={false} />
                                <Area type="monotone" dataKey="expense" stroke="#C45A67" strokeWidth={2} fill="url(#gradExpense)" dot={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                            <div className="flex items-center gap-4 mt-2 px-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: "var(--brand-lime)" }} />
                                <span className="text-[10px] text-muted-foreground/50 font-medium">Ingresos</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: "#C45A67" }} />
                                <span className="text-[10px] text-muted-foreground/50 font-medium">Gastos</span>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Comparativa mes a mes */}
                        {chartTxData && chartTxData.length >= 2 && (() => {
                          const last = chartTxData[chartTxData.length - 1];
                          const prev = chartTxData[chartTxData.length - 2];
                          const expPct = prev.expense > 0 ? ((last.expense - prev.expense) / prev.expense) * 100 : 0;
                          const incPct = prev.income > 0 ? ((last.income - prev.income) / prev.income) * 100 : 0;
                          return (
                            <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
                                Vs mes anterior ({prev.month})
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1">Ingresos</p>
                                  <p className={cn("text-[15px] font-bold font-nums", incPct >= 0 ? "text-lime" : "text-rose-500")}>
                                    {incPct >= 0 ? "+" : ""}{incPct.toFixed(1)}%
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/50">{formatCompact(last.income)}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1">Gastos</p>
                                  <p className={cn("text-[15px] font-bold font-nums", expPct <= 0 ? "text-lime" : "text-rose-500")}>
                                    {expPct >= 0 ? "+" : ""}{expPct.toFixed(1)}%
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/50">{formatCompact(last.expense)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    ) : (
                      /* ── Más detalle ── */
                      <motion.div
                        key="advanced"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-[12px] font-bold text-foreground/70">Métricas financieras</p>
                          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Basadas en tu historial real</p>
                        </div>

                        <div className="divide-y divide-border/40">
                          {/* Burn rate */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                              <Zap className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-foreground">Gasto diario promedio</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Cuánto quemas por día este mes</p>
                            </div>
                            <p className="text-[14px] font-bold font-nums text-rose-500 tabular-nums shrink-0">
                              {formatCompact(mathData.balances?.burnRateDaily ?? 0)}
                            </p>
                          </div>

                          {/* Runway */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-foreground">Días que te alcanza</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Con el ritmo actual de gastos</p>
                            </div>
                            <p className="text-[14px] font-bold font-nums text-brand-blue tabular-nums shrink-0">
                              {mathData.balances?.runwayDays != null ? `${mathData.balances.runwayDays}d` : "—"}
                            </p>
                          </div>

                          {/* Forecast 30d */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                              <Target className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-foreground">Proyección 30 días</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                Confianza: {mathData.forecast?.confidence === "alta" ? "alta ●●●" : mathData.forecast?.confidence === "media" ? "media ●●○" : "baja ●○○"}
                              </p>
                            </div>
                            <p className={cn(
                              "text-[14px] font-bold font-nums tabular-nums shrink-0",
                              (mathData.forecast?.next30Days ?? 0) >= 0 ? "text-lime" : "text-rose-500",
                            )}>
                              {(mathData.forecast?.next30Days ?? 0) >= 0 ? "+" : ""}{formatCompact(mathData.forecast?.next30Days ?? 0)}
                            </p>
                          </div>

                          {/* Forecast 60d */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-foreground">Proyección 60 días</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Tendencia bimestral</p>
                            </div>
                            <p className={cn(
                              "text-[14px] font-bold font-nums tabular-nums shrink-0",
                              (mathData.forecast?.next60Days ?? 0) >= 0 ? "text-lime" : "text-rose-500",
                            )}>
                              {(mathData.forecast?.next60Days ?? 0) >= 0 ? "+" : ""}{formatCompact(mathData.forecast?.next60Days ?? 0)}
                            </p>
                          </div>

                          {/* Forecast 90d */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                              <TrendingUp className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-foreground">Proyección 90 días</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Tendencia trimestral</p>
                            </div>
                            <p className={cn(
                              "text-[14px] font-bold font-nums tabular-nums shrink-0",
                              (mathData.forecast?.next90Days ?? 0) >= 0 ? "text-lime" : "text-rose-500",
                            )}>
                              {(mathData.forecast?.next90Days ?? 0) >= 0 ? "+" : ""}{formatCompact(mathData.forecast?.next90Days ?? 0)}
                            </p>
                          </div>
                        </div>

                        {/* Alertas */}
                        {(mathData.alerts?.length ?? 0) > 0 && (
                          <div className="px-4 py-3 border-t border-border/40 space-y-2">
                            {mathData.alerts!.slice(0, 3).map((alert) => (
                              <div key={alert} className="flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-foreground/70 leading-snug">{alert}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* ── Summary cards (ingresos / gastos / neto) ── */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Ingresos */}
                  <button
                    onClick={() => handleTypeChange("INCOME")}
                    className="rounded-2xl px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: activeType === "INCOME"
                        ? "color-mix(in srgb, var(--brand-lime) 18%, transparent)"
                        : "color-mix(in srgb, var(--brand-lime) 8%, transparent)",
                      boxShadow: activeType === "INCOME" ? "0 0 0 1.5px color-mix(in srgb, var(--brand-lime) 45%, transparent)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-lime" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-lime-dark/60 dark:text-lime/50">
                        Ingresos
                      </span>
                    </div>
                    <p className="text-[17px] font-black text-lime-dark dark:text-lime font-nums leading-none">
                      {formatCompact(totalIncome)}
                    </p>
                    <p className="text-[10px] text-lime-dark/40 dark:text-lime/35 mt-1.5 font-medium">
                      {transactions.filter(t => t.type === "INCOME").length} movimientos
                    </p>
                  </button>

                  {/* Gastos */}
                  <button
                    onClick={() => handleTypeChange("EXPENSE")}
                    className="rounded-2xl px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: activeType === "EXPENSE"
                        ? "color-mix(in srgb, #f43f5e 18%, transparent)"
                        : "color-mix(in srgb, #f43f5e 8%, transparent)",
                      boxShadow: activeType === "EXPENSE" ? "0 0 0 1.5px color-mix(in srgb, #f43f5e 45%, transparent)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600/60 dark:text-rose-400/50">
                        Gastos
                      </span>
                    </div>
                    <p className="text-[17px] font-black text-rose-600 dark:text-rose-400 font-nums leading-none">
                      {formatCompact(totalExpense)}
                    </p>
                    <p className="text-[10px] text-rose-600/40 dark:text-rose-400/35 mt-1.5 font-medium">
                      {transactions.filter(t => t.type === "EXPENSE").length} movimientos
                    </p>
                  </button>
                </div>

                {/* Balance neto */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{
                    background: net >= 0
                      ? "color-mix(in srgb, var(--brand-lime) 7%, transparent)"
                      : "color-mix(in srgb, #f43f5e 7%, transparent)",
                  }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                      Balance del mes
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                      {net >= 0 ? "Ahorraste" : "Gastaste más de lo que entraste"}
                    </p>
                  </div>
                  <p className={cn(
                    "text-[18px] font-black font-nums tabular-nums",
                    net >= 0 ? "text-lime" : "text-rose-500",
                  )}>
                    {net >= 0 ? "+" : ""}{formatCompact(net)}
                  </p>
                </div>
              </div>

              {/* ── Gastos recurrentes (Premium) ── */}
              {isPremium ? (
                (recurringData?.length ?? 0) > 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                      <p className="text-[12px] font-bold text-foreground/80">Gastos recurrentes</p>
                      <span className="ml-auto text-[10px] text-muted-foreground/40 font-medium">{recurringData!.length} detectados</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {recurringData!.map((item) => {
                        const today = new Date();
                        const nextDate = new Date(item.nextExpectedDate + "T00:00:00");
                        const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / 86_400_000);
                        const freqLabel = item.frequency === "monthly" ? "Mensual" : item.frequency === "biweekly" ? "Quincenal" : "Semanal";
                        const isOverdue = daysUntil < 0;
                        const isSoon = daysUntil >= 0 && daysUntil <= 3;
                        return (
                          <div key={`${item.name}-${item.frequency}`} className="flex items-center gap-3 px-4 py-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                              <RefreshCw className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground truncate">{item.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-brand-blue/10 text-brand-blue">
                                  {freqLabel}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-medium",
                                  isOverdue ? "text-rose-500" : isSoon ? "text-amber-500" : "text-muted-foreground/50",
                                )}>
                                  {isOverdue
                                    ? `Vencido hace ${Math.abs(daysUntil)}d`
                                    : daysUntil === 0
                                    ? "Vence hoy"
                                    : `En ${daysUntil} días`}
                                </span>
                              </div>
                            </div>
                            <p className="text-[14px] font-bold font-nums text-rose-500 tabular-nums shrink-0">
                              -{formatCompact(item.averageAmount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3.5 flex items-start gap-3">
                  <Crown className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground/80">Gastos recurrentes</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5 leading-snug">
                      Detecta automáticamente Netflix, arriendo, suscripciones y más. Disponible en Premium.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Category breakdown / tx list ── */}
              {categoryRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-[24px] bg-card gap-2">
                  <p className="text-sm font-semibold text-muted-foreground/40">
                    Sin {activeType === "EXPENSE" ? "gastos" : "ingresos"} este mes
                  </p>
                  <p className="text-xs text-muted-foreground/25">Registra tu primer movimiento</p>
                </div>
              ) : (
                <>
                  {/* Chips de filtro */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-0.5">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={cn(
                        "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95",
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
                          "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95",
                          selectedCategory === cat.name
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hashColor(cat.name) }} />
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                      <motion.div
                        key="breakdown"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-2"
                      >
                        {visibleCategoryRows.map(cat => (
                          <CategoryCard key={cat.name} cat={cat} type={activeType} onSelect={() => setSelectedCategory(cat.name)} />
                        ))}
                        {categoryRows.length > 5 && (
                          <button
                            onClick={() => setShowAllCategories(prev => !prev)}
                            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-muted/50 text-foreground/70 hover:bg-muted transition-colors"
                          >
                            {showAllCategories ? "Mostrar menos" : `Ver ${categoryRows.length - 5} más`}
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`txlist-${selectedCategory}`}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-2"
                      >
                        {/* Sub-header */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hashColor(selectedCategory) }} />
                            <p className="text-[13px] font-bold text-foreground">{selectedCategory}</p>
                            <span className="text-[11px] text-muted-foreground/50">· {filteredTxs.length} movs.</span>
                          </div>
                          <p className={cn("text-[15px] font-black font-nums", activeType === "INCOME" ? "text-lime" : "text-rose-500")}>
                            {activeType === "INCOME" ? "+" : "-"}{formatCompact(selectedTotal)}
                          </p>
                        </div>
                        {filteredTxs.length === 0 ? (
                          <div className="flex items-center justify-center py-12 rounded-[20px] bg-card">
                            <p className="text-sm text-muted-foreground/40">Sin movimientos</p>
                          </div>
                        ) : (
                          filteredTxs.map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
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
      <BudgetProjectionPanel />
    </>
  );
}

// ─── Budget Projection Panel (sección dentro de Analytics) ───────────────────

const PERIOD_LABELS: Record<string, string> = {
  ONCE: "Único", DAILY: "Diario", WEEKLY: "Semanal",
  BI_WEEKLY: "Quincenal", MONTHLY: "Mensual",
  QUARTERLY: "Trimestral", YEARLY: "Anual",
};

function RecurringRow({ entry }: { entry: RecurringEntry }) {
  const isIncome = entry.type === "INCOME";
  const fmt = (n: number) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold",
          isIncome ? "bg-lime/10 text-lime-700 dark:text-lime-400" : "bg-rose-500/10 text-rose-500"
        )}>
          {isIncome ? "+" : "-"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {entry.categoryName ?? entry.description ?? "Sin categoría"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {PERIOD_LABELS[entry.periodicity]} · equiv. {fmt(entry.monthlyMin)}/mes
          </p>
        </div>
      </div>
      <p className={cn("text-xs font-bold flex-shrink-0 ml-2",
        isIncome ? "text-lime-700 dark:text-lime-400" : "text-rose-500"
      )}>
        {fmt(entry.amount)}
      </p>
    </div>
  );
}

function BudgetProjectionPanel() {
  const { data: res, isLoading } = useQuery({
    queryKey: ["budget-projection"],
    queryFn: () => api.analytics.getBudgetProjection(),
    staleTime: 10 * 60_000,
  });

  const p = res?.data as BudgetProjection | undefined;

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n);

  const fmtRange = (min: number, max: number) =>
    min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;

  if (isLoading) return null;
  if (!p) return null;

  const hasAny = p.recurringIncome.length > 0 || p.recurringExpenses.length > 0;

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-2 mb-4 mt-6">
        <Repeat2 className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-base font-black text-foreground">Proyección mensual</h2>
      </div>

      {!hasAny ? (
        <div className="rounded-3xl bg-card border border-border/40 p-6 text-center">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm font-semibold text-foreground mb-1">Sin datos recurrentes</p>
          <p className="text-xs text-muted-foreground">
            Al registrar ingresos y gastos con frecuencia (mensual, anual…), aquí verás cuánto te cuesta vivir y cuánto necesitas ganar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Resumen tarjetas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-lime/8 border border-lime/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ingresos fijos/mes</p>
              <p className="text-lg font-black text-foreground">
                {p.monthlyIncomeMin > 0
                  ? fmtRange(p.monthlyIncomeMin, p.monthlyIncomeMax)
                  : "Sin registrar"}
              </p>
            </div>
            <div className="rounded-2xl bg-rose-500/8 border border-rose-500/15 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Gastos fijos/mes</p>
              <p className="text-lg font-black text-foreground">
                {fmtRange(p.monthlyExpenseMin, p.monthlyExpenseMax)}
              </p>
            </div>
          </div>

          {/* Costo de vida */}
          <div className="rounded-2xl bg-card border border-border/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Te cuesta vivir</p>
            <p className="text-2xl font-black text-foreground">
              {fmtRange(p.monthlyExpenseMin, p.monthlyExpenseMax)}
              <span className="text-sm font-semibold text-muted-foreground"> /mes</span>
            </p>
            {p.deficitMax > 0 && (
              <p className="text-xs text-rose-500 font-semibold mt-2">
                ⚠️ Déficit estimado: {fmtRange(p.deficitMin, p.deficitMax)}/mes
              </p>
            )}
          </div>

          {/* Necesitas ganar */}
          {(p.goalContributionNeeded > 0 || p.monthlyExpenseMin > 0) && (
            <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Necesitas ganar</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Para vivir</p>
                  <p className="text-xs font-bold text-foreground">{fmtRange(p.monthlyExpenseMin, p.monthlyExpenseMax)}/mes</p>
                </div>
                {p.goalContributionNeeded > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Para tus metas</p>
                    <p className="text-xs font-bold text-foreground">+ {fmt(p.goalContributionNeeded)}/mes</p>
                  </div>
                )}
                <div className="border-t border-border/30 pt-1.5 flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Total mínimo</p>
                  <p className="text-sm font-black text-foreground">{fmtRange(p.totalNeededMin, p.totalNeededMax)}/mes</p>
                </div>
              </div>
            </div>
          )}

          {/* Detalle ingresos */}
          {p.recurringIncome.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Ingresos recurrentes</p>
              {p.recurringIncome.map((e) => <RecurringRow key={e.id} entry={e} />)}
            </div>
          )}

          {/* Detalle gastos */}
          {p.recurringExpenses.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Gastos recurrentes</p>
              {p.recurringExpenses.map((e) => <RecurringRow key={e.id} entry={e} />)}
            </div>
          )}

          {/* Candidatos sugeridos */}
          {p.recurringCandidates.length > 0 && (
            <div className="rounded-2xl bg-muted/30 border border-border/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">💡 Podrían ser recurrentes</p>
              <div className="space-y-2">
                {p.recurringCandidates.map((c) => (
                  <div key={c.categoryName} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{c.categoryName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.count} veces · prom. {fmt(c.avgAmount)} · sugerido: {PERIOD_LABELS[c.suggestedPeriodicity]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ cat, type, onSelect }: { cat: CategoryRow; type: TxType; onSelect: () => void }) {
  const isExpense = type === "EXPENSE";
  const idx       = hashIndex(cat.name);
  const [c1, c2]  = CATEGORY_GRADIENTS[idx];

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/40 active:scale-[0.98] transition-all duration-150 text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        {cat.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[13px] font-semibold text-foreground truncate">{cat.name}</p>
          <span className="text-[11px] font-bold ml-2 shrink-0 text-muted-foreground/45">{cat.pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(cat.pct, 2)}%`, backgroundColor: c1, opacity: 0.75 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          {cat.count} {cat.count === 1 ? "movimiento" : "movimientos"} ·{" "}
          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cat.amount)}
        </p>
      </div>

      <p className={cn("text-[14px] font-bold font-nums shrink-0 ml-1", isExpense ? "text-rose-500" : "text-lime")}>
        {formatCompact(cat.amount)}
      </p>
    </button>
  );
}
