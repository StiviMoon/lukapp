"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const perks = [
  "Sin tarjeta de crédito",
  "Plan gratis para siempre",
  "Cancela cuando quieras",
];

export default function WaitlistSection() {
  const router = useRouter();

  return (
    <section id="cta" className="section-stripe py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-brand/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[560px] mx-auto text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent text-[12px] font-semibold mb-6">
            <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse-dot" />
            Disponible ahora
          </span>

          <h2
            className="font-display font-extrabold tracking-tight text-fg mb-4 leading-[1.08]"
            style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}
          >
            Empieza a controlar{" "}
            <span className="shimmer-text">tus lukas hoy</span>
          </h2>

          <p className="text-[16px] text-fg/50 mb-8">
            Crea tu cuenta gratis en segundos. Sin formularios largos,
            sin tarjeta. Solo tú y tus finanzas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={() => router.push("/auth?action=register")}
              className="flex items-center gap-2.5 px-8 py-4 bg-lime text-bg font-bold text-[15px] rounded-2xl hover:bg-lime-dark transition-colors duration-150 w-full sm:w-auto justify-center"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              Crear cuenta gratis
            </button>
            <button
              onClick={() => router.push("/auth")}
              className="flex items-center gap-2 px-8 py-4 border border-fg/12 text-fg/70 font-medium text-[15px] rounded-2xl hover:border-fg/25 hover:text-fg transition-colors duration-150 w-full sm:w-auto justify-center"
            >
              Ya tengo cuenta
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-1.5">
                <Check size={13} className="text-accent" strokeWidth={2.5} />
                <span className="text-[13px] text-fg/40">{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
