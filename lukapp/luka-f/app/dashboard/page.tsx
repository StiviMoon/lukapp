"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";
import {
  useTotalBalance,
  useMonthStats,
  useRecentTransactions,
} from "@/lib/hooks/use-dashboard-data";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { TransactionDetailSheet } from "@/components/dashboard/TransactionDetailSheet";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import type { Transaction } from "@/lib/types/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Split a COP-formatted number into integer and decimal parts for display */
function splitCOP(amount: number): { integer: string; decimal: string } {
  const formatted = formatCOP(amount);
  // Intl COP usually has no decimals, but handle just in case
  const parts = formatted.split(",");
  if (parts.length === 2) {
    return { integer: parts[0], decimal: "," + parts[1] };
  }
  return { integer: formatted, decimal: "" };
}

const QUICK_ACTIONS = [
  { icon: Plus,         label: "Gasto",   type: "expense" as const, color: "text-rose-500",    bg: "bg-rose-500/10"    },
  { icon: ArrowUpRight, label: "Ingreso", type: "income" as const,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
] as const;

// ─── Skeleton components ──────────────────────────────────────────────────────

function BalanceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[46px] w-48 rounded-xl bg-white/20 mb-7" />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-3 w-16 rounded bg-white/20 mb-2" />
          <div className="h-4 w-20 rounded bg-white/20" />
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-3 w-16 rounded bg-white/20 mb-2" />
          <div className="h-4 w-20 rounded bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3 w-28 rounded bg-muted-foreground/10" />
        <div className="h-2.5 w-20 rounded bg-muted-foreground/10" />
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="h-3.5 w-20 rounded bg-muted-foreground/10" />
        <div className="h-2.5 w-10 rounded bg-muted-foreground/10" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  useInactivityTimeout();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { open: openAddSheet } = useAddTransactionStore();

  const { data: balance, isLoading: balanceLoading } = useTotalBalance();
  const { data: stats, isLoading: statsLoading } = useMonthStats();
  const { data: transactions, isLoading: txLoading } = useRecentTransactions(20);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "tú";

  const avatarLetter = firstName.charAt(0);

  const cardLoading = balanceLoading || statsLoading;

  // Balance display values
  const balanceValue = balance ?? 0;
  const { integer: balanceInt, decimal: balanceDec } = splitCOP(balanceValue);

  return (
    <>
      <div className="min-h-dvh bg-background">
        <main className="px-5 pt-14 pb-40 max-w-sm mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm text-muted-foreground font-medium leading-none mb-1.5">
                {getGreeting()},
              </p>
              <h1 className="text-[26px] font-bold tracking-tight text-foreground capitalize leading-none font-display">
                {firstName}
              </h1>
            </div>
            <UserAvatar letter={avatarLetter} size="sm" />
          </div>

          {/* Balance Card */}
          <div className="rounded-[28px] px-6 pt-7 pb-6 mb-5 bg-primary">
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase mb-2">
              Balance Total
            </p>

            {cardLoading ? (
              <BalanceSkeleton />
            ) : (
              <>
                <div className="flex items-end gap-1 mb-7">
                  <span className="text-[46px] font-black tracking-tight text-white leading-none font-nums">
                    {balanceInt}
                  </span>
                  {balanceDec && (
                    <span className="text-[28px] font-black text-white/40 leading-none mb-0.5 font-nums">
                      {balanceDec}
                    </span>
                  )}
                </div>

                {/* Ingresos / Gastos sub-row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-[9px] font-bold tracking-[0.1em] text-white/50 uppercase">
                        Ingresos
                      </span>
                    </div>
                    <p className="text-[14px] font-bold text-white font-nums">
                      {stats ? formatCOP(stats.totalIncome) : "—"}
                    </p>
                    <p className="text-[9px] text-white/30 mt-0.5 font-medium">
                      Este mes
                    </p>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-[9px] font-bold tracking-[0.1em] text-white/50 uppercase">
                        Gastos
                      </span>
                    </div>
                    <p className="text-[14px] font-bold text-white font-nums">
                      {stats ? formatCOP(stats.totalExpenses) : "—"}
                    </p>
                    <p className="text-[9px] text-white/30 mt-0.5 font-medium">
                      Este mes
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-7">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3.5">
              Registrar
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(({ icon: Icon, label, type, color, bg }) => (
                <button
                  key={label}
                  onClick={() => openAddSheet(type === "expense" ? "EXPENSE" : "INCOME")}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-card hover:bg-muted/50 transition-all duration-150 active:scale-95"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-[13px] font-semibold text-foreground leading-none">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                Recientes
              </h2>
              <button
                onClick={() => router.push("/history")}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors duration-150"
              >
                Ver todo
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {txLoading ? (
              <div className="flex flex-col gap-2">
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {transactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onClick={() => setSelectedTx(tx)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-14 rounded-[24px] bg-card">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 bg-background">
                  <Clock className="w-5 h-5 text-muted-foreground/25" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground/40 mb-1">
                  Sin movimientos
                </p>
                <p className="text-xs text-muted-foreground/25">
                  Añade tu primer registro
                </p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Transaction detail bottom sheet */}
      <TransactionDetailSheet
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

    </>
  );
}
