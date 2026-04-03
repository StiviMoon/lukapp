"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { useReduceLandingMotion } from "@/hooks/use-reduce-landing-motion";

const faqs = [
  {
    q: "¿Cuánto cuesta lukapp?",
    a: "Gratis para siempre en funcionalidades esenciales. Plan premium a $14.900/mes — o $119.796/año (ahorra 33%). Incluye Coach IA avanzada, espacios ilimitados y reportes detallados.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos Supabase con encriptación end-to-end, Row Level Security y cumplimiento GDPR/CCPA. Tus datos son solo tuyos y jamás se venden a terceros.",
  },
  {
    q: "¿Funciona sin conexión?",
    a: "Sí. lukapp es una PWA offline-first. Registra transacciones sin internet y sincroniza automáticamente cuando vuelve la conexión.",
  },
  {
    q: "¿Puedo usarlo con mi pareja?",
    a: "Claro. Crea un espacio compartido, invita a tu pareja por username o código y gestionen las finanzas juntos — sin perder tu privacidad individual.",
  },
  {
    q: "¿Cómo funciona el Coach IA?",
    a: "Analiza tu historial de gastos real, detecta patrones, personaliza recomendaciones según tu situación específica y responde preguntas en tiempo real sobre tus finanzas. No es genérico — es tuyo.",
  },
  {
    q: "¿Puedo cancelar Premium cuando quiera?",
    a: "Sí, sin penaltis ni complicaciones. Cancelas desde tu perfil en cualquier momento y conservas el acceso hasta que venza tu período pagado.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReduceLandingMotion();

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="section-stripe landing-section-divider py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader badge="FAQ" title="Preguntas frecuentes" />

        <div className="max-w-[640px] mx-auto flex flex-col gap-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-32px" }}
              transition={{ duration: reduce ? 0 : 0.22, delay: reduce ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card/95 dark:bg-card/90 backdrop-blur-sm border border-border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: open === i ? "rgba(186,234,15,0.28)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span className="text-[15px] font-semibold text-foreground pr-2">{f.q}</span>
                <div
                  className="shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center transition-colors duration-200"
                  style={{ borderColor: open === i ? "rgba(186,234,15,0.45)" : undefined }}
                >
                  {open === i ? (
                    <Minus size={13} className="text-lime" strokeWidth={2.5} />
                  ) : (
                    <Plus size={13} className="text-foreground/45" strokeWidth={2.5} />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i &&
                  (reduce ? (
                    <div key="a">
                      <p className="px-6 pb-5 text-[14px] text-foreground/72 dark:text-foreground/68 leading-[1.75]">
                        {f.a}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key="m"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-6 pb-5 text-[14px] text-foreground/72 dark:text-foreground/68 leading-[1.75]">
                        {f.a}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
