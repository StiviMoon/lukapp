"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mic, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneMockup from "./PhoneMockup";
import { useReduceLandingMotion } from "@/hooks/use-reduce-landing-motion";

const badges = [
  {
    icon: Sparkles,
    label: "Coach IA incluido",
    color:
      "text-purple-bright dark:text-purple-muted border-purple-brand/35 dark:border-purple-brand/40 bg-purple-brand/12 dark:bg-purple-brand/15",
  },
  {
    icon: Mic,
    label: "Registro por voz",
    color:
      "text-lime-dark dark:text-lime border-lime/40 dark:border-lime/35 bg-lime/14 dark:bg-lime/12",
  },
  {
    icon: Shield,
    label: "Gratis para siempre",
    color:
      "text-foreground/75 dark:text-foreground/70 border-border bg-muted/40 dark:bg-white/[0.06]",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const reduce = useReduceLandingMotion();

  return (
    <section
      id="hero"
      className="hero-section-bg relative min-h-screen flex items-center pt-24 pb-16 md:pb-20 overflow-hidden"
    >
      {/* Acentos suaves — en móvil casi nada (menos blur / bandas vs. la siguiente sección) */}
      <div
        className="pointer-events-none select-none max-md:opacity-40 md:opacity-70 lg:opacity-100"
        aria-hidden
      >
        <div className="absolute -top-20 left-1/4 w-[min(100vw,520px)] h-[min(100vw,520px)] max-md:max-h-[200px] bg-purple-brand/5 dark:bg-purple-brand/12 rounded-full blur-[80px] md:blur-[100px]" />
        <div className="hidden md:block absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-lime/5 dark:bg-lime/8 rounded-full blur-[90px]" />
        <div className="hidden lg:block absolute top-1/2 left-0 w-[280px] h-[280px] bg-purple-bright/5 dark:bg-purple-bright/10 rounded-full blur-[70px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.02] hidden md:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(89,19,239,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(89,19,239,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : 0.04 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-lime/35 dark:border-lime/30 bg-lime/14 dark:bg-lime/12 rounded-full text-lime-dark dark:text-lime text-[12px] font-semibold mb-8 w-fit"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-lime max-md:animate-none animate-pulse" />
              Ya disponible
            </motion.div>

            <h1
              className="font-display font-extrabold leading-[1.03] tracking-tight mb-6 text-balance"
              style={{ fontSize: "clamp(40px, 5.5vw, 74px)" }}
            >
              <span className="text-foreground">Tus lukas.</span>
              <br />
              <span className="hero-gradient-text">Tu control.</span>
            </h1>

            <p className="text-[17px] leading-[1.75] landing-hero-lead mb-10 max-w-[440px] font-medium">
              Gastos, inversiones y claridad en una app. Coach IA, registro por voz y finanzas en pareja — sin
              complicaciones.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-10">
              <button
                type="button"
                onClick={() => router.push("/auth?action=register")}
                className="landing-cta-primary flex items-center gap-2 px-7 py-3.5 text-[15px] rounded-2xl shadow-none md:shadow-[0_4px_20px_rgba(186,234,15,0.22)] dark:md:shadow-[0_4px_20px_rgba(186,234,15,0.28)]"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Únete gratis
              </button>
              <button
                type="button"
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-7 py-3.5 text-foreground border border-border font-semibold text-[15px] rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150"
              >
                Ver más
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[12px] font-semibold ${b.color}`}
                >
                  <b.icon size={12} strokeWidth={2.5} />
                  {b.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
