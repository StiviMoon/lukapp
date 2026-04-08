"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  ChevronLeft,
  Loader2,
  Crown,
  Mic,
  Users,
  BarChart3,
  Brain,
  Shield,
  Lock,
  Bell,
  TrendingUp,
  Star,
  CalendarDays,
  RefreshCw,
  X,
} from "lucide-react";
import { usePlan } from "@/lib/hooks/use-plan";
import { toast } from "@/lib/toast";
import { api, type SubscriptionPricingPayload } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";

// ─── Datos de planes ──────────────────────────────────────────────────────────

const FREE_FEATURES = [
  { icon: Mic,      label: "Registro por voz" },
  { icon: Users,    label: "1 espacio compartido" },
  { icon: BarChart3,label: "Análisis del mes actual" },
  { icon: Brain,    label: "Insight diario del Coach" },
  { icon: Shield,   label: "Datos seguros" },
];

const PREMIUM_FEATURES = [
  { icon: Brain,    label: "Chat ilimitado con Coach IA" },
  { icon: Users,    label: "Espacios ilimitados" },
  { icon: BarChart3,label: "Análisis de tendencias 90 días" },
  { icon: TrendingUp,label: "Proyecciones y burn rate" },
  { icon: Bell,     label: "Alertas financieras inteligentes" },
  { icon: Star,     label: "Acceso anticipado a features" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCopFromCents(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SubscriptionStatus = {
  id: string;
  billingCycle: "MONTHLY" | "YEARLY";
  amountCents: number;
  planStartsAt: string;
  planExpiresAt: string;
  autoRenew: boolean;
  cancelledAt: string | null;
  nextBillingAt: string | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function UpgradePageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, isLoading, cancelSubscription, isCancelling } = usePlan();
  const { hide: hideGlobalLoading } = useLoadingOverlay();

  const [billingUi, setBillingUi]           = useState<"monthly" | "yearly">("monthly");
  const [pricing, setPricing]               = useState<SubscriptionPricingPayload | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Query de estado de suscripción (solo si es Premium)
  const { data: subscriptionData, refetch: refetchStatus } = useQuery({
    queryKey: ["subscription-status"],
    queryFn:  async () => {
      const res = await api.subscription.getStatus();
      return (res.success && res.data) ? (res.data as SubscriptionStatus) : null;
    },
    enabled: isPremium,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Tras login con ?plan=premium el overlay global sigue visible hasta aquí.
  useEffect(() => {
    hideGlobalLoading();
  }, [hideGlobalLoading]);

  // Leer billing desde URL (viene de landing → /upgrade?billing=yearly)
  useEffect(() => {
    const fromUrl = searchParams.get("billing");
    if (fromUrl === "yearly" || fromUrl === "monthly") {
      setBillingUi(fromUrl);
    }
  }, [searchParams]);

  // Cargar precios (público, sin auth)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPricingLoading(true);
      const res = await api.subscription.getPricing();
      if (!cancelled && res.success && res.data) {
        setPricing(res.data);
      }
      if (!cancelled) setPricingLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const billingApi: "MONTHLY" | "YEARLY" = billingUi === "yearly" ? "YEARLY" : "MONTHLY";

  const selectedPricing = useMemo(() => {
    if (!pricing) return null;
    return billingApi === "YEARLY" ? pricing.yearly : pricing.monthly;
  }, [pricing, billingApi]);

  const handleCheckout = useCallback(async () => {
    if (!selectedPricing) {
      toast.error("No se pudieron cargar los precios. Intenta de nuevo.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await api.subscription.checkout({ billingCycle: billingApi });
      if (!res.success || !res.data?.paymentUrl) {
        toast.error(res.error?.message ?? "No se pudo iniciar el pago.");
        return;
      }
      window.location.href = res.data.paymentUrl;
    } catch {
      toast.error("Error de conexión al iniciar el pago.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [billingApi, selectedPricing]);

  const handleCancelRenew = useCallback(async () => {
    cancelSubscription();
    setTimeout(() => void refetchStatus(), 1000);
    toast.success("Renovación cancelada. Tu plan sigue activo hasta su fecha de vencimiento.");
  }, [cancelSubscription, refetchStatus]);

  const periodLabel  = billingUi === "monthly" ? "/mes" : "/año";
  const facturaLabel = billingUi === "monthly" ? "Cada mes" : "Un solo pago por 1 año";

  return (
    <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto overflow-hidden">

      {/* Header */}
      <header className="flex-none px-5 pt-12 pb-4 flex items-center gap-3 border-b border-border/30">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground font-display">Tu plan</h1>
      </header>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-10">

        {/* Banner plan actual */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3 ${
            isPremium
              ? "bg-gradient-to-r from-purple-brand/20 to-purple-bright/5 border border-purple-brand/30"
              : "bg-card border border-border"
          }`}
        >
          {isPremium && (
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-purple-bright/10 rounded-full blur-2xl pointer-events-none" />
          )}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPremium ? "bg-purple-bright/15" : "bg-primary/10"}`}>
            {isPremium
              ? <Crown className="w-4 h-4 text-purple-muted" />
              : <Shield className="w-4 h-4 text-primary" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">Plan actual</p>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black text-foreground font-display">
                {isPremium ? "Premium" : "Gratuito"}
              </span>
              {isPremium && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-lime text-background text-[9px] font-bold">
                  <Zap size={8} strokeWidth={3} /> ACTIVO
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── USUARIO PREMIUM: detalles de suscripción ── */}
        {isPremium && subscriptionData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
              Detalles de suscripción
            </p>

            {/* Billing cycle + monto */}
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-muted-foreground">Plan</span>
              <span className="text-[13px] font-semibold text-foreground">
                {formatCopFromCents(subscriptionData.amountCents)}
                <span className="text-muted-foreground font-normal">
                  {subscriptionData.billingCycle === "MONTHLY" ? "/mes" : "/año"}
                </span>
              </span>
            </div>

            {/* Vencimiento */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="text-[13px]">Activo hasta</span>
              </div>
              <span className="text-[13px] font-semibold text-foreground">
                {formatDate(subscriptionData.planExpiresAt)}
              </span>
            </div>

            {/* Auto-renew */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[13px]">Renovación auto</span>
              </div>
              {subscriptionData.autoRenew ? (
                <span className="text-[12px] font-semibold text-lime">Activa</span>
              ) : (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground/60">
                  <X className="w-3 h-3" /> Cancelada
                </span>
              )}
            </div>

            {/* Botón cancelar renovación */}
            {subscriptionData.autoRenew && (
              <button
                type="button"
                onClick={handleCancelRenew}
                disabled={isCancelling}
                className="w-full mt-1 py-2.5 rounded-xl border border-border text-[12px] font-semibold text-muted-foreground/50 hover:text-muted-foreground hover:border-border/70 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {isCancelling
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : "Cancelar renovación automática"
                }
              </button>
            )}

            {/* Aviso si ya canceló */}
            {!subscriptionData.autoRenew && (
              <p className="text-[11px] text-muted-foreground/50 text-center pt-1">
                Tu plan no se renovará. Sigue activo hasta el {formatDate(subscriptionData.planExpiresAt)}.
              </p>
            )}
          </motion.div>
        )}

        {/* ── USUARIO FREE: toggle de ciclo ── */}
        {!isPremium && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 mb-2">
              Cómo pagar
            </p>
            <div className="flex rounded-2xl p-1 bg-muted/40 border border-border/60">
              <button
                type="button"
                onClick={() => setBillingUi("monthly")}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                  billingUi === "monthly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground/70"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingUi("yearly")}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                  billingUi === "yearly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground/70"
                }`}
              >
                Anual · 10% off
              </button>
            </div>
          </div>
        )}

        {/* Comparación de planes */}
        <div className="grid grid-cols-2 gap-3 mb-5">

          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`rounded-2xl p-3.5 border flex flex-col ${
              !isPremium ? "border-primary/40 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mb-1">Gratis</p>
            <p className="text-[22px] font-extrabold text-foreground font-nums leading-none mb-3">$0</p>
            <div className="space-y-2 flex-1">
              {FREE_FEATURES.map(({ label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary shrink-0" strokeWidth={2.5} />
                  <span className="text-[11px] text-foreground/70 leading-tight">{label}</span>
                </div>
              ))}
            </div>
            {!isPremium && (
              <div className="mt-3 text-center text-[10px] font-bold text-primary/60">Plan actual</div>
            )}
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-purple-brand/14 to-purple-bright/[0.04] border-[1.5px] border-purple-brand/40 flex flex-col"
          >
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-bright/10 rounded-full blur-[30px] pointer-events-none" />
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-purple-muted">Premium</p>
              <span className="px-1.5 py-0.5 rounded-full bg-lime text-background text-[8px] font-bold">✦</span>
            </div>
            <p className="text-[22px] font-extrabold text-foreground font-nums leading-none mb-3">
              {pricingLoading || !selectedPricing
                ? "…"
                : formatCopFromCents(selectedPricing.finalAmountCents)
              }
              {!pricingLoading && selectedPricing && (
                <span className="text-[11px] font-semibold text-muted-foreground/80 align-top ml-0.5">
                  {periodLabel}
                </span>
              )}
            </p>
            <div className="space-y-2 flex-1">
              {PREMIUM_FEATURES.map(({ label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-purple-muted shrink-0" strokeWidth={2.5} />
                  <span className="text-[11px] text-foreground/80 leading-tight">{label}</span>
                </div>
              ))}
            </div>
            {isPremium && (
              <div className="mt-3 text-center text-[10px] font-bold text-purple-muted/70">Plan actual ✦</div>
            )}
          </motion.div>
        </div>

        {/* Resumen de pago (solo si no es premium) */}
        {!isPremium && selectedPricing && !pricingLoading && (
          <div className="bg-muted/30 rounded-2xl p-4 mb-4 space-y-2 border border-border/40">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Plan Premium</span>
              <span className="font-semibold text-foreground">
                {formatCopFromCents(selectedPricing.finalAmountCents)}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Facturación</span>
              <span className="text-foreground">{facturaLabel}</span>
            </div>
            {billingUi === "yearly" && selectedPricing.discountPercent > 0 && (
              <div className="flex justify-between text-[12px] text-lime font-semibold">
                <span>Ahorro incluido</span>
                <span>{selectedPricing.discountPercent}% anual</span>
              </div>
            )}
            <div className="border-t border-border/40 pt-2 flex justify-between text-[14px] font-bold">
              <span className="text-foreground">Total hoy</span>
              <span className="text-foreground">{formatCopFromCents(selectedPricing.finalAmountCents)}</span>
            </div>
          </div>
        )}

        {/* CTA — solo Free */}
        {!isPremium && (
          <>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkoutLoading || pricingLoading || !selectedPricing || isLoading}
              className="w-full py-4 rounded-2xl bg-lime text-background font-bold text-[15px] hover:bg-lime-dark transition-colors active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Pagar con Wompi · {billingUi === "yearly" ? "Anual" : "Mensual"}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Lock className="w-3 h-3 text-muted-foreground/30" />
              <p className="text-[10px] text-muted-foreground/40 text-center">
                Pago seguro con Wompi · Al volver, tu plan se actualiza solo
              </p>
            </div>
          </>
        )}

        {isLoading && (
          <p className="text-center text-[11px] text-muted-foreground/50 mt-2">Cargando tu perfil…</p>
        )}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex flex-col items-center justify-center bg-transparent px-6 max-w-sm mx-auto gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground/50">Cargando planes…</p>
        </div>
      }
    >
      <UpgradePageContent />
    </Suspense>
  );
}
