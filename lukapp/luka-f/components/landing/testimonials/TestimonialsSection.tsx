"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/landing/ui/SectionHeader";

const testimonials = [
  {
    quote:
      "Gasté 8 horas semanales en Excel. Con lukapp lo hago en 5 minutos y encima me dice exactamente por qué gasto tanto.",
    name: "Juan García",
    role: "Freelancer · 28 años",
    initials: "JG",
    color: "lime" as const,
  },
  {
    quote:
      "Mi pareja y yo finalmente tenemos claridad total en nuestras finanzas. Sin secretos, sin discusiones. Solo datos.",
    name: "María & Carlos",
    role: "Pareja · Medellín",
    initials: "MC",
    color: "purple" as const,
  },
  {
    quote:
      "Es como tener un asesor financiero en el bolsillo. La IA de verdad entiende mi situación, no da consejos genéricos.",
    name: "Sandra López",
    role: "Emprendedora · 35 años",
    initials: "SL",
    color: "lime" as const,
  },
];

const colorMap = {
  lime: {
    avatar: "bg-lime/10 border-lime/30 text-lime",
    stars: "text-lime",
  },
  purple: {
    avatar: "bg-purple-bright/10 border-purple-brand/30 text-purple-muted",
    stars: "text-purple-muted",
  },
};

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader
          badge="Testimonios"
          title="Beta testers lo dicen todo"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="p-7 bg-bg-card border border-border dark:border-white/[0.08] rounded-3xl transition-all duration-200 hover:border-lime/15 hover:-translate-y-0.5"
              >
                <div className={`flex gap-0.5 mb-5 ${c.stars}`}>
                  {"★★★★★".split("").map((s, j) => (
                    <span key={j} className="text-[14px]">{s}</span>
                  ))}
                </div>
                <p className="text-[15px] leading-[1.75] text-fg/50 italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${c.avatar}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-fg">{t.name}</p>
                    <p className="text-[12px] text-fg/35">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
