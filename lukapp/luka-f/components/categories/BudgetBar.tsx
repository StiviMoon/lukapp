"use client";

import { motion } from "framer-motion";
import { cn, formatCOP } from "@/lib/utils";

interface BudgetBarProps {
  spent: number;
  total: number;
  percentage: number;
  remaining: number;
  isExceeded: boolean;
  showAmounts?: boolean;
  className?: string;
}

function getBarColor(percentage: number): string {
  if (percentage >= 90) return "#f43f5e";   // rose
  if (percentage >= 70) return "#f59e0b";   // amber
  return "var(--brand-lime)";
}

function getTextColor(percentage: number): string {
  if (percentage >= 90) return "text-rose-500";
  if (percentage >= 70) return "text-amber-500";
  return "text-lime";
}

export function BudgetBar({
  spent,
  total,
  percentage,
  remaining,
  isExceeded,
  showAmounts = true,
  className,
}: BudgetBarProps) {
  const barWidth = Math.min(percentage, 100);
  const barColor = getBarColor(percentage);
  const textColor = getTextColor(percentage);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showAmounts && (
        <div className="flex items-baseline justify-between">
          <span className={cn("text-[11px] font-semibold font-nums", textColor)}>
            {formatCOP(spent)} gastado
          </span>
          <span className={cn(
            "text-[11px] font-semibold font-nums",
            isExceeded ? "text-rose-500" : "text-muted-foreground/60"
          )}>
            {isExceeded
              ? `+${formatCOP(Math.abs(remaining))} excedido`
              : `${formatCOP(remaining)} restante`}
          </span>
        </div>
      )}

      {/* Track */}
      <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: "0%" }}
          animate={{ width: `${barWidth}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 120, delay: 0.1 }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-baseline justify-between">
        <span className={cn("text-[10px] font-bold", textColor)}>
          {isExceeded ? "¡Excedido!" : `${Math.round(percentage)}%`}
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-nums">
          de {formatCOP(total)}
        </span>
      </div>
    </div>
  );
}
