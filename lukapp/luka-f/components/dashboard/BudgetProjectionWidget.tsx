"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type BudgetProjection } from "@/lib/api/client";
import { TrendingUp, TrendingDown, ChevronRight, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function formatRange(min: number, max: number): string {
  if (min === max) return formatCompact(min);
  return `${formatCompact(min)} – ${formatCompact(max)}`;
}

export function BudgetProjectionWidget() {
  const router = useRouter();

  const { data: res, isLoading } = useQuery({
    queryKey: ["budget-projection"],
    queryFn: () => api.analytics.getBudgetProjection(),
    staleTime: 10 * 60_000,
  });

  const projection = res?.data as BudgetProjection | undefined;

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-card border border-border/40 p-5 animate-pulse">
        <div className="h-3 w-24 rounded bg-muted-foreground/10 mb-4" />
        <div className="h-6 w-32 rounded bg-muted-foreground/10 mb-2" />
        <div className="h-3 w-40 rounded bg-muted-foreground/10" />
      </div>
    );
  }

  const hasData =
    projection &&
    (
      projection.recurringIncome.length > 0 ||
      projection.recurringExpenses.length > 0 ||
      projection.recurringCandidates.length > 0
    );
  const hasRecurring =
    projection &&
    (projection.recurringIncome.length > 0 || projection.recurringExpenses.length > 0);

  if (!hasData) {
    return (
      <button
        onClick={() => router.push("/analytics")}
        className="w-full rounded-3xl border border-dashed border-border/50 p-5 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center flex-shrink-0">
          <Repeat2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Presupuesto mensual</p>
          <p className="text-xs text-muted-foreground">
            Marca sugerencias recurrentes o registra ingresos/gastos fijos para activar esta proyección
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
      </button>
    );
  }

  if (!hasRecurring && projection.recurringCandidates.length > 0) {
    return (
      <button
        onClick={() => router.push("/analytics")}
        className="w-full rounded-3xl bg-card border border-border/40 p-5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Repeat2 className="w-4 h-4 text-muted-foreground" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Presupuesto mensual
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">
          Detectamos gastos que parecen recurrentes
        </p>
        <p className="text-xs text-muted-foreground">
          Confírmalos en Analíticas para incluirlos en tu proyección mensual.
        </p>
      </button>
    );
  }

  const hasDeficit = projection.deficitMax > 0;
  const hasSurplus = !hasDeficit && projection.monthlyIncomeMin > 0;

  return (
    <button
      onClick={() => router.push("/analytics")}
      className="w-full rounded-3xl bg-card border border-border/40 p-5 text-left hover:bg-muted/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat2 className="w-4 h-4 text-muted-foreground" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Presupuesto mensual
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Main figure */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-0.5">Te cuesta vivir</p>
        <p className="text-2xl font-black text-foreground tracking-tight">
          {formatRange(projection.monthlyExpenseMin, projection.monthlyExpenseMax)}
          <span className="text-sm font-semibold text-muted-foreground"> /mes</span>
        </p>
      </div>

      {/* Income vs expense row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-lime/10 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Ingresos fijos</p>
            <p className="text-xs font-bold text-foreground">
              {projection.monthlyIncomeMin > 0
                ? formatRange(projection.monthlyIncomeMin, projection.monthlyIncomeMax)
                : "Sin registrar"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Gastos fijos</p>
            <p className="text-xs font-bold text-foreground">
              {formatRange(projection.monthlyExpenseMin, projection.monthlyExpenseMax)}
            </p>
          </div>
        </div>
      </div>

      {/* Status badge */}
      {hasDeficit && (
        <div className="rounded-xl bg-rose-500/8 border border-rose-500/15 px-3 py-2">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
            Déficit estimado:{" "}
            {formatRange(projection.deficitMin, projection.deficitMax)}/mes
          </p>
          <p className="text-[10px] text-rose-500/70 mt-0.5">
            Necesitas ganar más de lo que tienes registrado
          </p>
        </div>
      )}

      {hasSurplus && (
        <div className="rounded-xl bg-lime/8 border border-lime/20 px-3 py-2">
          <p className="text-xs text-lime-700 dark:text-lime-400 font-semibold">
            Superávit:{" "}
            {formatRange(
              projection.monthlyIncomeMin - projection.monthlyExpenseMax,
              projection.monthlyIncomeMax - projection.monthlyExpenseMin
            )}
            /mes disponible
          </p>
        </div>
      )}

      {/* Candidates suggestion */}
      {projection.recurringCandidates.length > 0 && (
        <p className="text-[10px] text-muted-foreground mt-3">
          💡{" "}
          {projection.recurringCandidates[0].categoryName} y{" "}
          {projection.recurringCandidates.length - 1 > 0
            ? `${projection.recurringCandidates.length - 1} más podrían ser recurrentes`
            : "otro podrían ser recurrentes"}
        </p>
      )}
    </button>
  );
}
