"use client";

import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/landing/ui/SectionHeader";

const freePlan = {
  name: "Gratuito",
  price: "$0",
  period: "/mes",
  tag: "Para siempre gratis",
  features: [
    { label: "Gestión personal ilimitada", included: true },
    { label: "Entrada por voz", included: true },
    { label: "1 relación compartida", included: true },
    { label: "Predicciones básicas", included: true },
    { label: "Coach IA avanzado", included: false },
    { label: "Relaciones ilimitadas", included: false },
    { label: "Reportes detallados", included: false },
  ],
};

const premiumPlan = {
  name: "Premium",
  price: "$9.990",
  period: "/mes",
  tag: "Más popular",
  features: [
    { label: "Todo lo del plan gratis", included: true },
    { label: "Coach IA avanzado", included: true },
    { label: "Relaciones ilimitadas", included: true },
    { label: "Reportes detallados", included: true },
    { label: "Análisis de tendencias", included: true },
    { label: "Prioridad en soporte", included: true },
    { label: "Nuevas features primero", included: true },
  ],
};

export default function PricingSection() {
  const router = useRouter();
  const scrollToWaitlist = () =>
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader
          badge="Precios"
          title={<>Empieza gratis. <span className="text-accent">Siempre.</span></>}
          subtitle="Sin tarjeta. Sin trampas. Solo valor real desde el día uno."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px] mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-10 pb-9 px-9 bg-bg-card border border-border rounded-3xl overflow-visible"
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

            <div className="flex flex-col gap-3 mb-9">
              {freePlan.features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 ${
                    f.included
                      ? "bg-lime/15 border border-lime/35"
                      : "bg-fg/[0.03] border border-border opacity-30"
                  }`}>
                    {f.included
                      ? <Check size={9} className="text-lime" strokeWidth={3} />
                      : <X size={9} className="text-fg-muted" strokeWidth={3} />
                    }
                  </div>
                  <span className={`text-[14px] ${f.included ? "text-fg/60" : "text-fg/25"}`}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/auth?action=register")}
              className="w-full py-3.5 rounded-2xl border border-fg/12 text-fg font-semibold text-[14px] hover:border-fg/25 hover:bg-fg/4 transition-colors duration-150"
            >
              Empezar gratis
            </button>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-10 pb-9 px-9 bg-gradient-to-br from-purple-brand/14 to-purple-bright/[0.04] border-[1.5px] border-purple-brand/40 rounded-3xl overflow-visible"
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-bright/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-5 py-2 bg-lime text-bg text-[12px] font-bold rounded-full whitespace-nowrap shadow-[0_4px_14px_rgba(200,212,0,0.35)] border border-lime/20">
              <Zap size={12} strokeWidth={3} />
              {premiumPlan.tag}
            </div>
            <p className="text-[11px] font-bold text-purple-muted uppercase tracking-[1.5px] mb-5">
              {premiumPlan.name}
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-nums font-extrabold text-[52px] tracking-[-2px] text-fg leading-none tabular-nums">
                {premiumPlan.price}
              </span>
              <span className="font-nums text-fg/30 text-[14px] tabular-nums">{premiumPlan.period}</span>
            </div>
            <p className="text-[13px] text-fg/25 mb-8">Acceso total</p>

            <div className="flex flex-col gap-3 mb-9">
              {premiumPlan.features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 bg-purple-bright/12 border border-purple-bright/35">
                    <Check size={9} className="text-purple-muted" strokeWidth={3} />
                  </div>
                  <span className="text-[14px] text-fg/70">{f.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/auth?plan=premium")}
              className="w-full py-3.5 rounded-2xl bg-lime text-bg font-bold text-[14px] hover:bg-lime-dark transition-colors duration-150"
            >
              Obtener Premium →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
