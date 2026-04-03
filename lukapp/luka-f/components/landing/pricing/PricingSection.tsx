"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Zap, MessageSquare, Users, TrendingUp, Bell,
  FileDown, Target, Clock, BarChart3, Flame, Headphones, Mic,
  Brain, Repeat,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { api, type SubscriptionPricingPayload } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { useReduceLandingMotion } from "@/hooks/use-reduce-landing-motion";

const freePlan = {
  name: "Gratuito",
  price: "$0",
  period: "/mes",
  tag: "Para siempre gratis",
  features: [
    "Cuentas y gastos ilimitados",
    "Registro con tu voz",
    "1 espacio compartido",
    "Insight diario de Luka",
    "Análisis del mes actual",
    "Hasta 3 presupuestos activos",
  ],
  locked: [
    "Chat ilimitado con Coach IA",
    "Historial completo sin límite",
    "Proyecciones y alertas",
    "Exportar PDF / Excel",
  ],
};

const premiumFeatures = [
  { icon: Check,          label: "Todo el plan Gratuito incluido",       highlight: false },
  { icon: MessageSquare,  label: "Chat ilimitado con Luka Coach IA",     highlight: true  },
  { icon: Brain,          label: "Análisis financiero inteligente",       highlight: true  },
  { icon: Mic,            label: "Registro por voz ilimitado + IA",      highlight: true  },
  { icon: TrendingUp,     label: "Proyecciones a 30, 60 y 90 días",      highlight: false },
  { icon: Bell,           label: "Alertas de presupuesto en tiempo real", highlight: false },
  { icon: Clock,          label: "Historial completo sin límite",         highlight: false },
  { icon: Target,         label: "Metas de ahorro con progreso visual",   highlight: false },
  { icon: Repeat,         label: "Gastos recurrentes automáticos",        highlight: false },
  { icon: FileDown,       label: "Exportar reportes PDF y Excel",         highlight: false },
  { icon: Users,          label: "Espacios compartidos ilimitados",       highlight: false },
  { icon: Flame,          label: "Burn rate y runway financiero real",    highlight: false },
  { icon: BarChart3,      label: "Comparativas detalladas mes a mes",     highlight: false },
  { icon: Headphones,     label: "Soporte prioritario + acceso anticipado", highlight: false },
];

function formatCopFromCents(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PricingSection() {
  const router = useRouter();
  const reduce = useReduceLandingMotion();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [pricing, setPricing] = useState<SubscriptionPricingPayload | null>(null);

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
    ? "Acceso completo a todo lukapp"
    : "Ahorra 10% — un solo pago anual";

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
    <section id="pricing" className="section-stripe-strong landing-section-divider py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6 relative">
        <SectionHeader
          badge="Precios"
          title={<>Empieza gratis. <span className="text-accent">Siempre.</span></>}
          subtitle="Sin tarjeta. Sin trampas. Solo valor real desde el día uno."
        />

        {/* Toggle mensual / anual */}
        <div className="mb-10 flex justify-center">
          <div className="relative inline-flex items-center gap-1 p-1.5 rounded-full bg-fg/[0.05] dark:bg-white/[0.04] border border-fg/10 dark:border-white/10">
            {["monthly", "yearly"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBillingCycle(c as "monthly" | "yearly")}
                className={`relative px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 ${
                  billingCycle === c
                    ? "bg-white dark:bg-white/10 text-fg shadow-sm"
                    : "text-fg/50 hover:text-fg"
                }`}
              >
                {c === "monthly" ? "Mensual" : "Anual"}
              </button>
            ))}
            <span className="px-3 py-1.5 text-[11px] font-bold rounded-full bg-[#5913ef]/15 dark:bg-[#5913ef]/20 text-[#5913ef] dark:text-[#a07af8]">
              −10%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[820px] mx-auto md:items-stretch">

          {/* ── PLAN FREE ── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{ duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.03, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-10 pb-8 px-8 bg-card border border-border rounded-3xl flex flex-col shadow-sm overflow-visible"
          >
            {/* Badge top — z-10 para que quede sobre cualquier otro elemento */}
            <div className="absolute -top-3.5 left-8 z-10 px-4 py-1.5 bg-card border border-border rounded-full shadow-md">
              <span className="text-[11px] font-bold text-[#444] dark:text-white/60 uppercase tracking-wider">{freePlan.name}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="font-mono font-extrabold text-[52px] tracking-[-2px] text-fg leading-none tabular-nums">
                {freePlan.price}
              </span>
              <span className="text-fg/30 text-[14px]">{freePlan.period}</span>
            </div>
            <p className="text-[12px] text-fg/35 mb-8">{freePlan.tag}</p>

            {/* Features */}
            <div className="flex flex-col gap-2.5 mb-8 flex-1">
              {freePlan.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 bg-[#baea0f]/12 border border-[#baea0f]/25">
                    <Check size={9} className="text-[#baea0f] dark:text-[#baea0f]" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-fg/60">{f}</span>
                </div>
              ))}
              <div className="my-1 border-t border-fg/[0.06]" />
              {freePlan.locked.map((label) => (
                <div key={label} className="flex items-center gap-2.5 opacity-30">
                  <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 bg-fg/[0.04] border border-fg/10">
                    <X size={9} className="text-fg/40" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-fg/40 line-through">{label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/auth?action=register")}
              className="w-full py-3.5 rounded-2xl border border-[#ccc] dark:border-white/12 text-[#333] dark:text-white/80 font-semibold text-[14px] hover:border-[#5913ef]/30 dark:hover:border-white/20 hover:bg-[#5913ef]/4 dark:hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer"
            >
              Empezar gratis →
            </button>
          </motion.div>

          {/* ── PLAN PREMIUM ── */}
          {/* El wrapper tiene padding 1.5px + gradiente = borde degradado */}
          {/* overflow-visible permite que el badge -top-3.5 sea visible */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{ duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-visible flex flex-col"
            style={{ background: "linear-gradient(135deg, #5913ef 0%, #baea0f 100%)", padding: "1.5px" }}
          >
            {/* Badge top — fuera del inner overflow-hidden */}
            <div className="absolute -top-3.5 left-8 z-20 flex items-center gap-1.5 px-4 py-1.5 bg-[#baea0f] text-[#111] text-[11px] font-bold rounded-full whitespace-nowrap shadow-none max-md:shadow-none md:shadow-[0_4px_14px_rgba(186,234,15,0.35)]">
              <Zap size={11} strokeWidth={3} />
              Más popular
            </div>

            {/* Inner card — overflow-hidden para que el contenido respete el border-radius */}
            <div className="relative rounded-[22px] bg-[#08001F] overflow-hidden flex flex-col flex-1">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#5913ef]/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#baea0f]/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10 pt-10 pb-8 px-8 flex flex-col h-full">

              {/* Label */}
              <p className="text-[10px] font-bold text-[#a07af8] uppercase tracking-[2px] mb-5">Premium</p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="font-mono font-extrabold text-[48px] tracking-[-2px] text-white leading-none tabular-nums">
                  {premiumPrice}
                </span>
                <span className="text-white/30 text-[14px]">{premiumPeriod}</span>
              </div>
              <p className="text-[12px] text-white/30 mb-8">{premiumCaption}</p>

              {/* Features */}
              <div className="flex flex-col gap-2 mb-8 flex-1">
                {premiumFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 border ${
                      f.highlight
                        ? "bg-[#5913ef]/30 border-[#5913ef]/40"
                        : "bg-white/[0.06] border-white/10"
                    }`}>
                      <f.icon
                        size={10}
                        className={f.highlight ? "text-[#a07af8]" : "text-white/40"}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className={`text-[12.5px] ${f.highlight ? "text-white font-medium" : "text-white/55"}`}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handlePremiumClick()}
                className="w-full py-3.5 rounded-2xl bg-[#baea0f] text-[#111] font-bold text-[14px] hover:bg-[#cef540] transition-colors duration-150 shadow-[0_4px_20px_rgba(186,234,15,0.25)] mt-auto cursor-pointer"
              >
                Obtener Premium {billingCycle === "yearly" ? "Anual" : "Mensual"} →
              </button>
            </div>
            </div>{/* /inner card */}
          </motion.div>

        </div>

        {/* Social proof */}
        <p className="text-center text-[12px] text-fg/30 mt-8">
          Sin compromisos · Cancela cuando quieras · Pago seguro con Wompi
        </p>
      </div>
    </section>
  );
}
