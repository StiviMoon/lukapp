"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2, Plus, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";
import {
  useTotalBalance, useMonthStats, useRecentTransactions,
} from "@/lib/hooks/use-dashboard-data";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { TransactionDetailSheet } from "@/components/dashboard/TransactionDetailSheet";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import type { Transaction } from "@/lib/types/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n);
}

function splitCOP(n: number) {
  const f = formatCOP(n);
  const p = f.split(",");
  return p.length === 2 ? { integer: p[0], decimal: "," + p[1] } : { integer: f, decimal: "" };
}

const MASKED = "••••••";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function BalanceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[44px] w-44 rounded-xl bg-white/20 mb-6" />
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1].map(i => (
          <div key={i} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="h-3 w-16 rounded bg-white/20 mb-2" />
            <div className="h-4 w-20 rounded bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TxSkeleton() {
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

  const [selectedTx,     setSelectedTx]    = useState<Transaction | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const { open: openAddSheet } = useAddTransactionStore();

  const { data: balance, isLoading: balanceLoading } = useTotalBalance();
  const { data: stats,   isLoading: statsLoading   } = useMonthStats();
  const { data: transactions, isLoading: txLoading  } = useRecentTransactions(20);

  useEffect(() => {
    const stored = localStorage.getItem("lukapp-balance-visible");
    if (stored !== null) setBalanceVisible(stored === "true");
  }, []);

  const toggleBalance = () => {
    setBalanceVisible(v => {
      const next = !v;
      localStorage.setItem("lukapp-balance-visible", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/auth");
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] || "tú";

  const cardLoading = balanceLoading || statsLoading;
  const balanceValue = balance ?? 0;
  const { integer: balInt, decimal: balDec } = splitCOP(balanceValue);

  return (
    <>
      <div className="h-dvh flex flex-col bg-background overflow-hidden max-w-sm mx-auto">

        {/* ── Header fijo: solo saludo ── */}
        <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium leading-none mb-1.5">
              {getGreeting()},
            </p>
            <h1 className="text-[26px] font-bold tracking-tight text-foreground capitalize leading-none font-display">
              {firstName}
            </h1>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="active:scale-95 transition-transform"
            aria-label="Ver perfil"
          >
            <UserAvatar letter={firstName.charAt(0)} size="sm" />
          </button>
        </header>

        {/* ── Área scrolleable — todo scrollea naturalmente ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-36 space-y-5">

          {/* Balance card */}
          <div className="rounded-[28px] px-6 pt-6 pb-5 bg-primary">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase">
                Balance Total
              </p>
              <button
                onClick={toggleBalance}
                className="text-white/50 hover:text-white/80 transition-colors active:scale-90 p-0.5"
                aria-label={balanceVisible ? "Ocultar balance" : "Mostrar balance"}
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {cardLoading ? <BalanceSkeleton /> : (
              <>
                <div className="flex items-end gap-1 mb-6 min-h-[52px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {balanceVisible ? (
                      <motion.div
                        key="val"
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(6px)" }}
                        transition={{ duration: 0.2 }}
                        className="flex items-end gap-1"
                      >
                        <span className="text-[44px] font-black tracking-tight text-white leading-none font-nums">
                          {balInt}
                        </span>
                        {balDec && (
                          <span className="text-[26px] font-black text-white/40 leading-none mb-0.5 font-nums">
                            {balDec}
                          </span>
                        )}
                      </motion.div>
                    ) : (
                      <motion.span
                        key="mask"
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(6px)" }}
                        transition={{ duration: 0.2 }}
                        className="text-[38px] font-black text-white/60 leading-none tracking-[0.18em]"
                      >
                        {MASKED}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: ArrowUpRight,  label: "Ingresos", value: stats?.totalIncome   },
                    { icon: ArrowDownLeft, label: "Gastos",   value: stats?.totalExpenses },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="w-3.5 h-3.5 text-white/50" />
                        <span className="text-[9px] font-bold tracking-[0.1em] text-white/50 uppercase">{label}</span>
                      </div>
                      <p className="text-[14px] font-bold text-white font-nums">
                        {value != null ? (balanceVisible ? formatCOP(value) : MASKED) : "—"}
                      </p>
                      <p className="text-[9px] text-white/30 mt-0.5 font-medium">Este mes</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
              Registrar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openAddSheet("EXPENSE")}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/50 transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 shrink-0">
                  <Plus className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-[13px] font-semibold text-foreground">Gasto</span>
              </button>
              <button
                onClick={() => openAddSheet("INCOME")}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/50 transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[13px] font-semibold text-foreground">Ingreso</span>
              </button>
            </div>
          </div>

          {/* Recientes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                Recientes
              </p>
              <button
                onClick={() => router.push("/history")}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                Ver todo <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {txLoading ? (
              <div className="flex flex-col gap-2">
                <TxSkeleton /><TxSkeleton /><TxSkeleton />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {transactions.map(tx => (
                  <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 rounded-[24px] bg-card">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 bg-background">
                  <Clock className="w-5 h-5 text-muted-foreground/25" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground/40 mb-1">Sin movimientos</p>
                <p className="text-xs text-muted-foreground/25">Añade tu primer registro</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <TransactionDetailSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}
