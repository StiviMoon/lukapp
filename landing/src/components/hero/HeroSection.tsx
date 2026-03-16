"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import PhoneMockup from "./PhoneMockup";

const stats = [
  { value: "50k+", label: "En espera", color: "text-accent" },
  { value: "Abr 26", label: "MVP launch", color: "text-fg" },
  { value: "Claude", label: "Powered by", color: "text-purple-muted" },
];

export default function HeroSection() {
  const scrollToWaitlist = () => {
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-purple-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-[500px] h-[500px] bg-lime/[0.07] rounded-full blur-[100px] pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* ─── Left: Copy ─── */}
          <div>
            {/* Pill badge — acento visible en claro y oscuro */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent text-[12px] font-semibold mb-7"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse-dot" />
              MVP · Abril 2026
            </motion.div>

            {/* Heading — simple, con impacto */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18 }}
              className="font-display font-extrabold leading-[1.05] tracking-tight text-fg mb-6"
              style={{ fontSize: "clamp(38px, 5.5vw, 72px)" }}
            >
              Tu plata.{" "}
              <span className="shimmer-text">Claridad.</span>
            </motion.h1>

            {/* Subheading — aquí puede ir lo de pareja / más info */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              className="text-[17px] leading-[1.75] text-fg/50 mb-10 max-w-[420px]"
            >
              Lleva tu dinero al día, solo o con tu pareja. Sin hojas de cálculo ni estrés.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38 }}
              className="flex items-center gap-3 flex-wrap mb-12"
            >
              <button
                onClick={scrollToWaitlist}
                className="flex items-center gap-2 px-7 py-3.5 bg-lime text-bg font-bold text-[15px] rounded-2xl hover:bg-lime-dark transition-colors duration-200"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Únete gratis
              </button>
              <button className="flex items-center gap-2 px-7 py-3.5 bg-transparent text-fg border border-border font-medium text-[15px] rounded-2xl hover:border-fg/25 hover:bg-fg/[0.04] transition-colors duration-200">
                Ver demo
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5 }}
              className="flex divide-x divide-border border border-border rounded-2xl overflow-hidden w-fit"
            >
              {stats.map((s) => (
                <div key={s.label} className="px-5 py-4">
                  <p className={`font-nums font-extrabold text-[22px] tabular-nums ${s.color} leading-none`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-fg/35 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── Right: Phone ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
