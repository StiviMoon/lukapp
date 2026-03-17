"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, format, addMonths, subMonths,
  parseISO, isToday, isSameMonth, addDays, startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays, List,
  ChevronLeft, ChevronRight, TrendingDown, TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api/client";
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

type TxMap = Map<string, Transaction[]>;

function groupByDate(txs: Transaction[]): TxMap {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = tx.date.slice(0, 10);
    map.set(key, [...(map.get(key) ?? []), tx]);
  }
  return map;
}

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="rounded-[28px] bg-card p-4 animate-pulse">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[...Array(7)].map((_, i) => <div key={i} className="h-5 rounded-lg bg-muted-foreground/10" />)}
      </div>
      {[...Array(6)].map((_, r) => (
        <div key={r} className="grid grid-cols-7 gap-1 mb-1">
          {[...Array(7)].map((_, c) => <div key={c} className="aspect-square rounded-xl bg-muted-foreground/10" />)}
        </div>
      ))}
    </div>
  );
}

function TxSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-muted-foreground/10" />
        <div className="h-2.5 w-20 rounded bg-muted-foreground/10" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-3.5 w-20 rounded bg-muted-foreground/10" />
        <div className="h-2 w-8 rounded bg-muted-foreground/10" />
      </div>
    </div>
  );
}

// ─── Full Calendar ─────────────────────────────────────────────────────────────

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function FullCalendar({
  month, selected, onSelect, txByDate,
}: {
  month: Date; selected: Date; onSelect: (d: Date) => void; txByDate: TxMap;
}) {
  const days = useMemo(() => buildCalendarDays(month), [month]);
  const selectedKey = format(selected, "yyyy-MM-dd");

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/35 py-1 select-none">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key    = format(day, "yyyy-MM-dd");
          const txs    = txByDate.get(key) ?? [];
          const hasInc = txs.some(t => t.type === "INCOME");
          const hasExp = txs.some(t => t.type === "EXPENSE");
          const isSel  = key === selectedKey;
          const isTod  = isToday(day);
          const isOut  = !isSameMonth(day, month);
          return (
            <button
              key={i}
              onClick={() => onSelect(day)}
              className={cn(
                "relative flex flex-col items-center justify-center aspect-square w-full rounded-xl",
                "text-[13px] font-semibold transition-all duration-150 select-none focus:outline-none active:scale-90",
                isSel && "bg-primary text-primary-foreground shadow-lg scale-[1.04]",
                isTod && !isSel && "ring-[1.5px] ring-primary/60 text-primary",
                isOut && "opacity-20 pointer-events-none",
                !isSel && !isOut && txs.length > 0  && "text-foreground hover:bg-muted/50",
                !isSel && !isOut && txs.length === 0 && "text-muted-foreground/40 hover:bg-muted/40",
              )}
            >
              <span className="leading-none">{day.getDate()}</span>
              {txs.length > 0 && (
                <span className="flex gap-[3px] mt-[3px]">
                  {hasInc && <span className={cn("w-[5px] h-[5px] rounded-full", isSel ? "bg-white/70" : "bg-emerald-500")} />}
                  {hasExp && <span className={cn("w-[5px] h-[5px] rounded-full", isSel ? "bg-white/50" : "bg-rose-500")} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const [viewMode,      setViewMode]      = useState<"calendar" | "list">("calendar");
  const [currentMonth,  setCurrentMonth]  = useState(() => new Date());
  const [selectedDate,  setSelectedDate]  = useState<Date>(() => new Date());
  const [selectedTx,    setSelectedTx]    = useState<Transaction | null>(null);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: txData, isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", "month", year, month],
    queryFn: async () => {
      const res = await api.transactions.getAll({
        startDate: startOfMonth(currentMonth),
        endDate:   endOfMonth(currentMonth),
        limit: 300,
      });
      if (!res.success) throw new Error(res.error?.message ?? "Error");
      return (res.data ?? []) as Transaction[];
    },
    staleTime: 2 * 60_000,
  });

  const transactions = txData ?? [];
  const txByDate     = useMemo(() => groupByDate(transactions), [transactions]);
  const sortedKeys   = useMemo(
    () => Array.from(txByDate.keys()).sort((a, b) => b.localeCompare(a)),
    [txByDate],
  );

  const monthIncome  = transactions.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const dayTxs      = txByDate.get(selectedKey) ?? [];
  const dayIncome   = dayTxs.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0);
  const dayExpense  = dayTxs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: es });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <>
      <div className="h-dvh flex flex-col bg-background overflow-hidden max-w-sm mx-auto">

        {/* ═══ HEADER FIJO ═══ */}
        <div className="flex-none px-5 pt-12 pb-3 space-y-3">

          {/* Título + toggle de vista */}
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-foreground font-display">Historial</h1>
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
              {(["calendar", "list"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95",
                    viewMode === mode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-muted-foreground",
                  )}
                >
                  {mode === "calendar" ? <CalendarDays className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

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

          {/* Resumen del mes */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 animate-pulse">
              <div className="h-14 rounded-2xl bg-muted-foreground/10" />
              <div className="h-14 rounded-2xl bg-muted-foreground/10" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 px-3.5 py-3">
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Ingresos</p>
                  <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 font-nums leading-tight truncate">{formatCOP(monthIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-rose-500/10 px-3.5 py-3">
                <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-400/70">Gastos</p>
                  <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400 font-nums leading-tight truncate">{formatCOP(monthExpense)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ CONTENIDO SCROLLEABLE ═══ */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-32 space-y-4">

          {/* ── Vista calendario ── */}
          {viewMode === "calendar" && (
            <>
              {isLoading ? <CalendarSkeleton /> : (
                <div className="rounded-[28px] bg-card p-4">
                  <FullCalendar
                    month={currentMonth}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    txByDate={txByDate}
                  />
                </div>
              )}

              {/* Panel del día seleccionado */}
              <div className="rounded-[24px] bg-card overflow-hidden">
                <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border/30">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 mb-1">
                      {isToday(selectedDate)
                        ? "Hoy · " + format(selectedDate, "d 'de' MMMM", { locale: es })
                        : format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    {dayTxs.length > 0 && (
                      <div className="flex gap-3">
                        {dayIncome  > 0 && <span className="text-[13px] font-bold text-emerald-500 font-nums">+{formatCOP(dayIncome)}</span>}
                        {dayExpense > 0 && <span className="text-[13px] font-bold text-rose-500 font-nums">-{formatCOP(dayExpense)}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground/35 font-medium mt-0.5">
                    {dayTxs.length} {dayTxs.length === 1 ? "mov." : "movs."}
                  </span>
                </div>
                {isLoading ? (
                  <div className="p-3 space-y-2"><TxSkeleton /><TxSkeleton /></div>
                ) : dayTxs.length > 0 ? (
                  <div className="p-3 space-y-1.5">
                    {dayTxs.map(tx => (
                      <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/35 font-medium text-center py-8">Sin movimientos este día</p>
                )}
              </div>
            </>
          )}

          {/* ── Vista lista ── */}
          {viewMode === "list" && (
            <>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <TxSkeleton key={i} />)}
                </div>
              ) : sortedKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-[24px] bg-card gap-1">
                  <p className="text-sm font-semibold text-muted-foreground/40">Sin movimientos este mes</p>
                  <p className="text-xs text-muted-foreground/25">Usa el micrófono o el botón + para registrar</p>
                </div>
              ) : (
                sortedKeys.map(dk => {
                  const dTxs  = txByDate.get(dk)!;
                  const dDate = parseISO(dk);
                  const dInc  = dTxs.filter(t => t.type === "INCOME") .reduce((s, t) => s + Number(t.amount), 0);
                  const dExp  = dTxs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
                  const dNet  = dInc - dExp;
                  const label = isToday(dDate) ? "Hoy" : format(dDate, "EEEE d", { locale: es });
                  return (
                    <div key={dk}>
                      <div className="flex items-center justify-between px-1 mb-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
                          {label.charAt(0).toUpperCase() + label.slice(1)}
                        </p>
                        <p className={cn("text-[12px] font-bold font-nums", dNet >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {dNet >= 0 ? "+" : ""}{formatCOP(dNet)}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-card overflow-hidden divide-y divide-border/20">
                        {dTxs.map(tx => (
                          <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>
      </div>

      <TransactionDetailSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}
