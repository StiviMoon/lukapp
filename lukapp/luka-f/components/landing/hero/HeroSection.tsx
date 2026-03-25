"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneMockup from "./PhoneMockup";

const stats = [
  { value: "$0", label: "Para siempre", color: "text-accent" },
  { value: "IA", label: "Coach incluido", color: "text-purple-muted" },
  { value: "Voz", label: "Registro rápido", color: "text-fg" },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-purple-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-[500px] h-[500px] bg-lime/[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent text-[12px] font-semibold mb-7 w-fit">
              <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse-dot" />
              Ya disponible · Gratis
            </div>

            <h1
              className="font-display font-extrabold leading-[1.05] tracking-tight text-fg mb-6"
              style={{ fontSize: "clamp(38px, 5.5vw, 72px)" }}
            >
              Tus lukas.{" "}
              <span className="shimmer-text">Tu control.</span>
            </h1>

            <p className="text-[17px] leading-[1.75] text-fg/50 mb-10 max-w-[420px]">
              Gastos, inversiones y claridad en una app. Crece financieramente y ten el control de lo tuyo — solo o con tu pareja.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-12">
              <button
                onClick={() => router.push("/auth?action=register")}
                className="flex items-center gap-2 px-7 py-3.5 bg-lime text-bg font-bold text-[15px] rounded-2xl hover:bg-lime-dark transition-colors duration-150"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Únete gratis
              </button>
              <button
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-7 py-3.5 bg-transparent text-fg border border-border font-medium text-[15px] rounded-2xl hover:border-fg/25 hover:bg-fg/4 transition-colors duration-150"
              >
                Ver más
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>

            <div className="flex divide-x divide-border border border-border rounded-2xl overflow-hidden w-fit">
              {stats.map((s) => (
                <div key={s.label} className="px-5 py-4">
                  <p className={`font-nums font-extrabold text-[22px] tabular-nums ${s.color} leading-none`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-fg/35 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
