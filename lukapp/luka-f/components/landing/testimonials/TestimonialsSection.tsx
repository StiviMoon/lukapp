"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { useReduceLandingMotion } from "@/hooks/use-reduce-landing-motion";

const testimonials = [
  {
    quote:
      "Descubrí que gastaba $380.000 al mes en delivery sin darme cuenta. La IA me lo mostró en 10 segundos. Desde que uso lukapp ahorro mínimo $200.000 al mes.",
    name: "Camilo Torres",
    role: "Desarrollador · 31 años · Medellín",
    initials: "CT",
    color: "lime" as const,
  },
  {
    quote:
      "Llevábamos 2 años discutiendo por plata con mi novio. Ahora tenemos el espacio compartido y cada uno ve exactamente qué pone y qué gasta. Cero peleas.",
    name: "Valentina Reyes",
    role: "Diseñadora · 22 años · Bogotá",
    initials: "VR",
    color: "purple" as const,
  },
  {
    quote:
      "Soy independiente y siempre me quedaba corto a fin de mes sin saber por qué. El coach de lukapp me armó un plan realista y por primera vez cerré el mes positivo.",
    name: "Steven",
    role: "Freelancer · 27 años · Cali",
    initials: "SM",
    color: "lime" as const,
  },
];

const colorMap = {
  lime: {
    avatar: "bg-[#baea0f]/10 dark:bg-[#baea0f]/10 border-[#baea0f]/40 dark:border-[#baea0f]/30 text-[#6b7c00] dark:text-[#baea0f]",
    stars:  "text-[#8aae00] dark:text-[#baea0f]",
  },
  purple: {
    avatar: "bg-[#5913ef]/10 dark:bg-[#7a3ff5]/10 border-[#5913ef]/30 dark:border-[#7a3ff5]/30 text-[#5913ef] dark:text-[#a07af8]",
    stars:  "text-[#5913ef] dark:text-[#a07af8]",
  },
};

export default function TestimonialsSection() {
  const reduce = useReduceLandingMotion();

  return (
    <section className="section-stripe landing-section-divider py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader
          badge="Testimonios"
          title="Beta testers lo dicen todo"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <motion.div
                key={t.name}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-36px" }}
                transition={{ duration: reduce ? 0 : 0.24, delay: reduce ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="p-7 bg-card/95 dark:bg-card/90 backdrop-blur-sm border border-border rounded-3xl transition-all duration-200 md:hover:-translate-y-0.5 hover:border-primary/25 dark:hover:border-lime/25 hover:shadow-md dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
              >
                {/* Estrellas */}
                <div className={`flex gap-0.5 mb-5 ${c.stars}`}>
                  {"★★★★★".split("").map((s, j) => (
                    <span key={j} className="text-[15px]">{s}</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[15px] leading-[1.75] text-muted-foreground italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${c.avatar}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{t.name}</p>
                    <p className="text-[12px] text-muted-foreground">{t.role}</p>
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
