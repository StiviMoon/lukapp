"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, Eye, EyeOff,
  Settings2, Crown, Tag, Sun, Sunset, Moon, Sunrise, Target,
} from "lucide-react";
import { usePlan } from "@/lib/hooks/use-plan";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";
import {
  useTotalBalance, useMonthStats, useRecentTransactions,
} from "@/lib/hooks/use-dashboard-data";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { useBudgetStatus } from "@/lib/hooks/use-budgets";
import { useSharedOverview } from "@/lib/hooks/use-spaces";
import { formatCompact } from "@/lib/utils";
import { BudgetBar } from "@/components/categories/BudgetBar";
import { Users } from "lucide-react";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { TransactionDetailSheet } from "@/components/dashboard/TransactionDetailSheet";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";
import type { Transaction } from "@/lib/types/transaction";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/hooks/use-profile";
import { CoachCard, CoachCardSkeleton } from "@/components/coach/CoachCard";
import { haptics } from "@/lib/haptics";
import { LukappLogo } from "@/components/ui/lukapp-logo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5  && h < 7)  return "dawn";
  if (h >= 7  && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 21) return "evening";
  return "night";
}

const TIME_CONFIG: Record<TimeOfDay, { greeting: string; Icon: React.ElementType; iconClass: string }> = {
  dawn:      { greeting: "Buenos días",   Icon: Sunrise, iconClass: "text-orange-300" },
  morning:   { greeting: "Buenos días",   Icon: Sun,     iconClass: "text-yellow-300" },
  afternoon: { greeting: "Buenas tardes", Icon: Sun,     iconClass: "text-orange-300" },
  evening:   { greeting: "Buenas tardes", Icon: Sunset,  iconClass: "text-rose-300"   },
  night:     { greeting: "Buenas noches", Icon: Moon,    iconClass: "text-indigo-300" },
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

function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 space-y-5 pt-1 pb-app-scroll">
      {/* Balance card hero — misma altura que el real */}
      <div
        className="balance-card mt-1 rounded-[28px] p-6 animate-pulse"
        style={{ background: "linear-gradient(135deg, #2a08a8, #5913ef, #7a3ff5)" }}
      >
        {/* Saludo skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-36 rounded-full bg-white/20" />
          <div className="w-4 h-4 rounded bg-white/20" />
        </div>
        {/* Label "Balance total" skeleton */}
        <div className="h-2 w-16 rounded-full bg-white/15 mb-2" />
        {/* Altura fija del balance: 44px */}
        <div className="h-[44px] w-48 rounded-xl bg-white/20 mb-5" />
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 rounded-2xl bg-white/10 h-[56px]" />
          ))}
        </div>
      </div>

      {/* Coach card */}
      <CoachCardSkeleton />

      {/* Quick actions 4-col */}
      <div>
        <div className="h-2.5 w-20 rounded-full bg-muted-foreground/10 animate-pulse mb-3" />
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="py-5 rounded-2xl bg-card animate-pulse flex flex-col items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-muted-foreground/10" />
              <div className="h-2.5 w-12 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Transacciones recientes */}
      <div>
        <div className="h-2.5 w-16 rounded-full bg-muted-foreground/10 animate-pulse mb-3" />
        <div className="flex flex-col gap-2">
          <TxSkeleton /><TxSkeleton /><TxSkeleton />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isPremium } = usePlan();
  const router = useRouter();
  useInactivityTimeout();

  const [selectedTx,     setSelectedTx]    = useState<Transaction | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [visibleCount,   setVisibleCount]   = useState(6);

  const { open: openAddSheet } = useAddTransactionStore();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: balance, isLoading: balanceLoading } = useTotalBalance();
  const { data: stats,   isLoading: statsLoading   } = useMonthStats();
  const { data: transactions, isLoading: txLoading  } = useRecentTransactions(20);
  const { data: budgetStatuses } = useBudgetStatus();
  const { data: sharedOverview, isLoading: overviewLoading } = useSharedOverview();
  // Solo mostrar presupuestos que tienen una categoría vinculada
  const activeBudgets = (budgetStatuses ?? []).filter(b => b.category !== null);
  const hasBudgets = activeBudgets.length > 0;
  const hasSharedSpaces = (sharedOverview?.spaces.length ?? 0) > 0;

  // Un solo estado de carga unificado — todo el contenido aparece junto
  const isDataLoading = useMinDelay(
    balanceLoading || statsLoading || txLoading || profileLoading || overviewLoading,
    350,
  );

  // Resetear paginación cuando llegan nuevas transacciones (ej. después de registrar una)
  useEffect(() => {
    setTimeout(() => {
      setVisibleCount(6);
    }, 100);
  }, [transactions?.length]);

  useEffect(() => {
    const stored = localStorage.getItem("lukapp-balance-visible");
    if (stored !== null) {
      setTimeout(() => {
        setBalanceVisible(stored === "true");
      }, 100);
    }
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

  // Forzar onboarding si no está completado
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [profileLoading, profile, router]);

  // Mostrar loader mientras: (a) auth cargando, (b) perfil sin datos aún
  // Esto evita el flash del dashboard antes de saber si hay que ir al onboarding
  if (loading || (profileLoading && !profile)) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground/40 font-medium">Cargando tus datos...</p>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] || "tú";

  const { greeting, Icon: TimeIcon, iconClass } = TIME_CONFIG[getTimeOfDay()];

  const balanceValue = balance ?? 0;
  const { integer: balInt, decimal: balDec } = splitCOP(balanceValue);

  return (
    <>
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

        {/* ── Header: LOGO | AJUSTES PERFIL ── */}
        <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
          {/* Logo */}
          <LukappLogo variant="logotipo" height={46} color="degradado" priority />

          {/* Acciones */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push("/settings")}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors active:scale-95"
              aria-label="Ajustes"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground/60" />
            </button>
            {isPremium && (
              <button
                onClick={() => router.push("/upgrade")}
                className="flex items-center gap-1 px-2.5 h-9 rounded-xl bg-purple-brand/15 border border-purple-brand/25 text-purple-muted active:scale-95 transition-transform"
                aria-label="Plan Premium"
              >
                <Crown className="w-3 h-3" />
                <span className="text-[10px] font-bold">PRO</span>
              </button>
            )}
            <button
              onClick={() => router.push("/profile")}
              className="active:scale-95 transition-transform"
              aria-label="Ver perfil"
            >
              <UserAvatar letter={firstName.charAt(0)} size="sm" />
            </button>
          </div>
        </header>

        {/* ── Área scrolleable — skeleton unificado o contenido completo ── */}
        {isDataLoading ? <DashboardSkeleton /> : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto overscroll-contain px-5 space-y-5 pt-1 pb-app-scroll"
          >
            {/* Balance card — hero gradient */}
            <div
              className="balance-card mt-1 rounded-[28px] p-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2a08a8 0%, #5913ef 45%, #7a3ff5 100%)",
                boxShadow: "0 8px 32px rgba(89,19,239,0.35), 0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 balance-hero-dots opacity-40 pointer-events-none" />

              {/* Glow orb top-right */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />

              {/* Saludo + ojo */}
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-1.5">
                  <TimeIcon className={`w-3.5 h-3.5 ${iconClass}`} strokeWidth={2} />
                  <p className="text-[12px] font-medium text-white/60 leading-none">
                    {greeting}, <span className="font-bold text-white/80 capitalize">{firstName}</span>
                  </p>
                </div>
                <button
                  onClick={toggleBalance}
                  className="text-white/50 hover:text-white/90 transition-colors active:scale-90 p-0.5 shrink-0"
                  aria-label={balanceVisible ? "Ocultar balance" : "Mostrar balance"}
                >
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Label balance */}
              <p className="text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase mb-2 relative">
                Balance total
              </p>

              <div className="relative">
                {/* Altura fija — evita layout shift al toggle de visibilidad */}
                <div className="relative h-[44px] mb-5 w-full overflow-hidden">
                  {/* Valor real */}
                  <motion.div
                    animate={{ opacity: balanceVisible ? 1 : 0, filter: balanceVisible ? "blur(0px)" : "blur(8px)" }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 balance-value-inner flex items-center gap-0.5 font-extrabold tabular-nums font-nums leading-none text-white"
                  >
                    <span>{balInt}</span>
                    {balDec && <span className="balance-value-decimal text-white/70">{balDec}</span>}
                  </motion.div>
                  {/* Máscara ••••• */}
                  <motion.div
                    animate={{ opacity: balanceVisible ? 0 : 1, filter: balanceVisible ? "blur(8px)" : "blur(0px)" }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 balance-value-inner flex items-center gap-0.5 font-extrabold tabular-nums font-nums leading-none text-white/50 tracking-[0.2em]"
                  >
                    {MASKED}
                  </motion.div>
                </div>

                {/* Income / Expense pills — altura fija, blur al ocultar */}
                <div className="flex gap-3">
                  {[
                    { icon: ArrowUpRight,  label: "Ingresos", value: stats?.totalIncome,   color: "text-emerald-300" },
                    { icon: ArrowDownLeft, label: "Gastos",   value: stats?.totalExpenses, color: "text-rose-300"   },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div
                      key={label}
                      className="flex-1 rounded-2xl px-3.5 py-3"
                      style={{ background: "rgba(0,0,0,0.22)" }}
                    >
                      <p className="text-[9px] text-white/45 mb-1.5 font-semibold uppercase tracking-wider">{label}</p>
                      <motion.div
                        animate={{ filter: balanceVisible ? "blur(0px)" : "blur(6px)" }}
                        transition={{ duration: 0.2 }}
                        className={`text-[13px] font-bold font-nums tabular-nums leading-none h-[18px] flex items-center gap-1 ${color}`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{value != null ? formatCOP(value) : "—"}</span>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coach IA */}
            <CoachCard />

            {/* Quick actions — 3 col */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">Acciones</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Gasto",
                    icon: ArrowDownLeft,
                    bg: "bg-rose-500/10",
                    iconColor: "text-rose-500",
                    action: () => { haptics.light(); openAddSheet("EXPENSE"); },
                  },
                  {
                    label: "Ingreso",
                    icon: ArrowUpRight,
                    bg: "bg-emerald-500/10",
                    iconColor: "text-emerald-500",
                    action: () => { haptics.light(); openAddSheet("INCOME"); },
                  },
                  {
                    label: "Categoría",
                    icon: Tag,
                    bg: "bg-primary/10",
                    iconColor: "text-primary",
                    action: () => { haptics.light(); router.push("/categories"); },
                  },
                  {
                    label: "Metas",
                    icon: Target,
                    bg: "bg-amber-500/10",
                    iconColor: "text-amber-500",
                    action: () => { haptics.light(); router.push("/goals"); },
                  },
                ].map(({ label, icon: Icon, bg, iconColor, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center gap-3 py-5 rounded-2xl bg-card hover:bg-muted/50 transition-all active:scale-[0.95]"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presupuestos widget */}
            {hasBudgets && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">Presupuestos</p>
                  <button onClick={() => router.push("/categories")} className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
                    Ver todo <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {activeBudgets.map((budget) => (
                    <div key={budget.id} className="px-4 py-3.5 rounded-2xl bg-card">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[12px] font-semibold text-foreground truncate">{budget.category!.name}</p>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2",
                          budget.isExceeded ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : budget.percentage >= 90 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400")}>
                          {budget.isExceeded ? "Excedido" : `${Math.round(budget.percentage)}%`}
                        </span>
                      </div>
                      <BudgetBar spent={budget.spent} total={Number(budget.amount)} percentage={budget.percentage} remaining={budget.remaining} isExceeded={budget.isExceeded} showAmounts={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* En pareja */}
            {hasSharedSpaces && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">En pareja</p>
                  <button onClick={() => router.push("/friends")} className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
                    Ver todo <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {sharedOverview?.spaces.map((s) => (
                    <button key={s.id} onClick={() => router.push(`/shared/${s.id}`)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/50 transition-all active:scale-[0.98] text-left w-full">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-foreground truncate">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground/60">con {s.partnerName}</p>
                      </div>
                      {s.myDeductions > 0 && (
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold text-rose-400 font-nums">-{formatCompact(s.myDeductions)}</p>
                          <p className="text-[10px] text-muted-foreground/40">mi parte</p>
                        </div>
                      )}
                    </button>
                  ))}
                  {(sharedOverview?.totalMyDeductions ?? 0) > 0 && (sharedOverview?.spaces.length ?? 0) > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/30">
                      <p className="text-[11px] text-muted-foreground/60">Total comprometido en pareja</p>
                      <p className="text-[12px] font-bold text-rose-400 font-nums">-{formatCompact(sharedOverview!.totalMyDeductions)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recientes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">Recientes</p>
                <button onClick={() => router.push("/history")} className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
                  Ver todo <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {transactions && transactions.length > 0 ? (
                <div className="flex flex-col gap-2 mb-3">
                  {transactions.slice(0, visibleCount).map(tx => (
                    <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
                  ))}
                  {transactions.length > visibleCount ? (
                    <button onClick={() => setVisibleCount(v => v + 6)} className="w-full py-3 rounded-2xl text-[12px] font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/40 transition-all active:scale-[0.98]">
                      Cargar más · {transactions.length - visibleCount} restantes
                    </button>
                  ) : visibleCount > 6 && (
                    <button onClick={() => router.push("/history")} className="w-full py-3 rounded-2xl text-[12px] font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/40 transition-all active:scale-[0.98]">
                      Ver historial completo <ChevronRight className="inline w-3 h-3 mb-0.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 rounded-[24px] bg-card">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 bg-background">
                    <Clock className="w-5 h-5 text-muted-foreground/25" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground/40 mb-1">Sin movimientos aún</p>
                  <p className="text-xs text-muted-foreground/25">Registra tu primer gasto o ingreso 👆</p>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </div>

      <TransactionDetailSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}
