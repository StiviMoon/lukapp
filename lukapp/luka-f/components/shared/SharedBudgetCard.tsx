"use client";

import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { formatCompact, cn } from "@/lib/utils";
import type { SharedBudgetStatus, SpaceMember, SpaceType } from "@/lib/types/shared";
import { displayMemberName } from "@/lib/display";

interface SharedBudgetCardProps {
  status: SharedBudgetStatus;
  me?: SpaceMember;
  partner?: SpaceMember;
  spaceType?: SpaceType;
  onAddTransaction: (budgetId: string) => void;
  onDelete: (budgetId: string) => void;
}

function barColor(pct: number) {
  if (pct >= 90) return "#f43f5e";
  if (pct >= 70) return "#f59e0b";
  return "#10b981";
}

export function SharedBudgetCard({
  status,
  me,
  partner,
  spaceType = "PAREJA",
  onAddTransaction,
  onDelete,
}: SharedBudgetCardProps) {
  const { budget, myContrib, partnerContrib, totalBudget, spent, remaining, percentage, isExceeded } = status;

  const mySalaryDeclared   = me?.salary != null;
  const partnerSalaryDeclared = partner?.salary != null;
  const barWidth = Math.min(percentage, 100);
  const color    = barColor(percentage);

  const partnerLabel = partner
    ? displayMemberName(partner.profile.fullName, partner.profile.email, spaceType, false)
    : (spaceType === "PAREJA" ? "My love" : "Miembro");

  return (
    <div className="bg-card rounded-2xl overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-foreground leading-tight">{budget.categoryName}</p>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            {Number(budget.percentage)}% del salario de cada uno
          </p>
        </div>
        <button
          onClick={() => onDelete(budget.id)}
          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-destructive/10 transition-colors shrink-0 ml-2"
        >
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground/30 hover:text-destructive/60" />
        </button>
      </div>

      {/* ── Aviso salario faltante ──────────────────────────────────── */}
      {(!mySalaryDeclared || !partnerSalaryDeclared) && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-amber-500/10 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            {!mySalaryDeclared ? "Declara tu salario para ver tu aporte" : "Tu pareja aún no declara su salario"}
          </p>
        </div>
      )}

      {/* ── Chips de aportes ───────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pb-3">
        {/* Yo */}
        <div className="flex-1 min-w-0 bg-primary/10 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-primary/60 font-semibold mb-1">Yo</p>
          <p className="text-[14px] font-bold text-primary font-nums tabular-nums leading-none">
            {mySalaryDeclared ? formatCompact(myContrib) : "—"}
          </p>
        </div>
        {/* Pareja */}
        <div className="flex-1 min-w-0 bg-muted/60 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground/60 font-semibold mb-1 truncate">{partnerLabel}</p>
          <p className="text-[14px] font-bold text-foreground font-nums tabular-nums leading-none">
            {partnerSalaryDeclared ? formatCompact(partnerContrib) : "—"}
          </p>
        </div>
      </div>

      {/* ── Barra de progreso ──────────────────────────────────────── */}
      {totalBudget > 0 && (
        <div className="px-4 pb-3">
          {/* Track */}
          <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden mb-2.5">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: "0%" }}
              animate={{ width: `${barWidth}%` }}
              transition={{ type: "spring", damping: 22, stiffness: 130, delay: 0.05 }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className={cn(
                "text-[12px] font-extrabold font-nums tabular-nums",
                isExceeded ? "text-rose-500" : percentage >= 70 ? "text-amber-500" : "text-emerald-500"
              )}>
                {formatCompact(spent)}
              </span>
              <span className="text-[10px] text-muted-foreground/40 font-nums shrink-0">
                / {formatCompact(totalBudget)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isExceeded ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                  <AlertTriangle className="w-3 h-3" />
                  +{formatCompact(Math.abs(remaining))} excedido
                </span>
              ) : percentage >= 90 ? (
                <span className="text-[10px] font-bold text-amber-500 font-nums">
                  ⚠ {formatCompact(remaining)} libre
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-muted-foreground/50 font-nums">
                  {formatCompact(remaining)} libre · {Math.round(percentage)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Botón añadir ───────────────────────────────────────────── */}
      <div className="border-t border-border/20">
        <button
          onClick={() => onAddTransaction(budget.id)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir gasto a {budget.categoryName}
        </button>
      </div>
    </div>
  );
}
