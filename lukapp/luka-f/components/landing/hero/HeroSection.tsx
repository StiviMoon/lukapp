"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mic, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneMockup from "./PhoneMockup";

const badges = [
  { icon: Sparkles, label: "Coach IA incluido",   color: "text-[#7a3ff5] dark:text-[#a07af8] border-[#5913ef]/20 dark:border-[#5913ef]/30 bg-[#5913ef]/8 dark:bg-[#5913ef]/12" },
  { icon: Mic,      label: "Registro por voz",    color: "text-[#6b7c00] dark:text-[#baea0f] border-[#baea0f]/25 dark:border-[#baea0f]/25 bg-[#baea0f]/10 dark:bg-[#baea0f]/10" },
  { icon: Shield,   label: "Gratis para siempre", color: "text-[#555] dark:text-white/60 border-[#ccc] dark:border-white/10 bg-[#0001]/5 dark:bg-white/5" },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      id="hero"
      className="hero-section-bg relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden"
    >
      {/* ── Orbs de color — funcionan en light y dark ── */}
      <div className="pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#5913ef]/10 dark:bg-[#5913ef]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[#baea0f]/8 dark:bg-[#baea0f]/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#7a3ff5]/8 dark:bg-[#7a3ff5]/12 rounded-full blur-[80px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(89,19,239,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(89,19,239,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#baea0f]/30 dark:border-[#baea0f]/25 bg-[#baea0f]/12 dark:bg-[#baea0f]/10 rounded-full text-[#6b7c00] dark:text-[#baea0f] text-[12px] font-semibold mb-8 w-fit"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#baea0f] animate-pulse" />
              Ya disponible · Colombia
            </motion.div>

            {/* Headline */}
            <h1
              className="font-display font-extrabold leading-[1.03] tracking-tight mb-6"
              style={{ fontSize: "clamp(40px, 5.5vw, 74px)" }}
            >
              <span className="text-[#0d0d0d] dark:text-white">Tus lukas.</span>
              <br />
              <span className="hero-gradient-text">Tu control.</span>
            </h1>

            <p className="text-[17px] leading-[1.8] text-[#444] dark:text-white/50 mb-10 max-w-[440px]">
              Gastos, inversiones y claridad en una app. Coach IA, registro por voz y finanzas en pareja — sin complicaciones.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap mb-10">
              <button
                onClick={() => router.push("/auth?action=register")}
                className="landing-cta-primary flex items-center gap-2 px-7 py-3.5 text-[15px] rounded-2xl shadow-[0_4px_20px_rgba(186,234,15,0.25)] dark:shadow-[0_4px_20px_rgba(186,234,15,0.3)]"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Únete gratis
              </button>
              <button
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-7 py-3.5 text-[#333] dark:text-white/70 border border-[#ccc] dark:border-white/15 font-medium text-[15px] rounded-2xl hover:border-[#5913ef]/40 dark:hover:border-white/30 hover:text-[#5913ef] dark:hover:text-white hover:bg-[#5913ef]/4 dark:hover:bg-white/5 transition-colors duration-150"
              >
                Ver más
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[12px] font-medium ${b.color}`}
                >
                  <b.icon size={12} strokeWidth={2.5} />
                  {b.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Phone mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>

      {/* Fade hacia la siguiente sección — coincide con bg-stripe en light y dark */}
      <div className="hero-bottom-fade absolute bottom-0 left-0 right-0 h-28 pointer-events-none" />
    </section>
  );
}
