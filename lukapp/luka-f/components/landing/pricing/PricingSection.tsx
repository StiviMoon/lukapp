"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Zap, MessageSquare, Users, TrendingUp, Bell,
  FileDown, Target, Clock, BarChart3, Flame, Headphones,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { api, type SubscriptionPricingPayload } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

// ─── Datos de planes ──────────────────────────────────────────────────────────

const freePlan = {
  name: "Gratuito",
  price: "$0",
  period: "/mes",
  tag: "Para siempre gratis",
  features: [
    { label: "Cuentas y gastos ilimitados" },
    { label: "Registro con tu voz" },
    { label: "1 espacio compartido" },
    { label: "Insight diario de Luka" },
    { label: "Análisis del mes actual" },
    { label: "Hasta 3 presupuestos activos" },
  ],
  locked: [
    "Chat ilimitado con Coach IA",
    "Historial completo sin límite",
    "Proyecciones y alertas",
  ],
};

const premiumPlan = {
  name: "Premium",
  tag: "Más popular",
  features: [
    { icon: Check,          label: "Todo lo del plan gratis incluido" },
    { icon: MessageSquare,  label: "Chat ilimitado con Luka Coach IA" },
    { icon: TrendingUp,     label: "Proyecciones a 30, 60 y 90 días" },
    { icon: Bell,           label: "Alertas cuando excedes presupuesto" },
    { icon: Clock,          label: "Historial completo sin límite de tiempo" },
    { icon: Target,         label: "Metas de ahorro con seguimiento visual" },
    { icon: FileDown,       label: "Exportar reportes PDF y Excel" },
    { icon: Users,          label: "Espacios compartidos ilimitados" },
    { icon: Flame,          label: "Burn rate y runway financiero real" },
    { icon: BarChart3,      label: "Comparativas detalladas mes a mes" },
    { icon: Headphones,     label: "Soporte prioritario + acceso anticipado" },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatCopFromCents(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingSection() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [pricing, setPricing] = useState<SubscriptionPricingPayload | null>(null);

  // Cargar precios desde el backend (fuente única de verdad)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.subscription.getPricing();
      if (!cancelled && res.success && res.data) setPricing(res.data);
    })();
    return () => { cancelled = true; };
  }, []);

  const premiumPrice = useMemo(() => {
    if (!pricing) return "…";
    const block = billingCycle === "monthly" ? pricing.monthly : pricing.yearly;
    return formatCopFromCents(block.finalAmountCents);
  }, [billingCycle, pricing]);

  const premiumPeriod  = billingCycle === "monthly" ? "/mes" : "/año";
  const premiumCaption = billingCycle === "monthly"
    ? "Acceso completo a todo"
    : "Ahorra 10% — un solo pago al año";

  /**
   * Si el usuario ya tiene sesión → ir directo a /upgrade.
   * Si no → pasar por /auth con el plan y ciclo en la URL.
   */
  const handlePremiumClick = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push(`/upgrade?billing=${billingCycle}`);
    } else {
      router.push(`/auth?plan=premium&billing=${billingCycle}`);
    }
  };

  return (
    <section id="pricing" className="section-stripe-strong py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader
          badge="Precios"
          title={<>Empieza gratis. <span className="text-accent">Siempre.</span></>}
          subtitle="Sin tarjeta. Sin trampas. Solo valor real desde el día uno."
        />

        {/* Toggle mensual / anual */}
        <div className="max-w-[760px] mx-auto mb-6 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-bg-card border border-border">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-colors ${
                billingCycle === "monthly"
                  ? "bg-lime text-bg"
                  : "text-fg/60 hover:text-fg"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-colors ${
                billingCycle === "yearly"
                  ? "bg-lime text-bg"
                  : "text-fg/60 hover:text-fg"
              }`}
            >
              Anual
            </button>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-brand/15 text-purple-brand dark:text-purple-muted">
              −10%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px] mx-auto md:items-stretch">

          {/* ── PLAN FREE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-10 pb-9 px-9 bg-bg-card card-elevated border border-[#E0DFF0] dark:border-white/[0.07] rounded-3xl overflow-visible flex flex-col"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-white dark:bg-[#111] border border-border dark:border-white/10 rounded-full shadow-sm">
              <span className="text-[12px] font-bold text-fg uppercase tracking-wider">
                {freePlan.name}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-nums font-extrabold text-[52px] tracking-[-2px] text-fg leading-none tabular-nums">
                {freePlan.price}
              </span>
              <span className="font-nums text-fg/30 text-[14px] tabular-nums">{freePlan.period}</span>
            </div>
            <p className="text-[13px] text-fg/40 mb-8">{freePlan.tag}</p>

            <div className="flex flex-col gap-3 mb-9 flex-1">
              {freePlan.features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 bg-lime/15 border border-lime/35">
                    <Check size={9} className="text-lime" strokeWidth={3} />
                  </div>
                  <span className="text-[14px] text-fg/60">{f.label}</span>
                </div>
              ))}
              {freePlan.locked.map((label) => (
                <div key={label} className="flex items-center gap-3 opacity-35">
                  <div className="w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 bg-fg/[0.04] border border-border">
                    <X size={9} className="text-fg/40" strokeWidth={3} />
                  </div>
                  <span className="text-[14px] text-fg/40">{label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/auth?action=register")}
              className="w-full py-3.5 rounded-2xl border border-fg/12 text-fg font-semibold text-[14px] hover:border-fg/25 hover:bg-fg/4 transition-colors duration-150 mt-auto"
            >
              Empezar gratis
            </button>
          </motion.div>

          {/* ── PLAN PREMIUM ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-10 pb-9 px-9 bg-gradient-to-br from-purple-brand/14 to-purple-bright/[0.04] border-[1.5px] border-purple-brand/40 rounded-3xl overflow-visible flex flex-col"
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-bright/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-5 py-2 bg-lime text-bg text-[12px] font-bold rounded-full whitespace-nowrap shadow-[0_4px_14px_rgba(186,234,15,0.35)] border border-lime/20">
              <Zap size={12} strokeWidth={3} />
              {premiumPlan.tag}
            </div>

            <p className="text-[11px] font-bold text-purple-muted uppercase tracking-[1.5px] mb-5">
              {premiumPlan.name}
            </p>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-nums font-extrabold text-[52px] tracking-[-2px] text-fg leading-none tabular-nums">
                {premiumPrice}
              </span>
              <span className="font-nums text-fg/30 text-[14px] tabular-nums">{premiumPeriod}</span>
            </div>
            <p className="text-[13px] text-fg/25 mb-8">{premiumCaption}</p>

            <div className="flex flex-col gap-2.5 mb-9 flex-1">
              {premiumPlan.features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0 bg-purple-brand/12 border border-purple-brand/25">
                    <f.icon size={10} className="text-purple-muted" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] text-fg/70">{f.label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handlePremiumClick()}
              className="w-full py-3.5 rounded-2xl bg-lime text-bg font-bold text-[14px] hover:bg-lime-dark transition-colors duration-150 mt-auto"
            >
              Obtener Premium {billingCycle === "yearly" ? "Anual" : "Mensual"} →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
