"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import SectionHeader from "@/components/landing/ui/SectionHeader";

const faqs = [
  {
    q: "¿Cuánto cuesta lukapp?",
    a: "Gratis para siempre en funcionalidades esenciales. Plan premium a $9.990/mes con Coach IA avanzada, relaciones ilimitadas y reportes detallados.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos Supabase con encriptación end-to-end, Row Level Security y cumplimiento GDPR/CCPA. Tus datos nunca se venden a terceros, jamás.",
  },
  {
    q: "¿Funciona sin conexión?",
    a: "Sí. Es una PWA offline-first. Registra transacciones sin conexión y sincroniza automáticamente cuando hay internet disponible.",
  },
  {
    q: "¿Puedo usarlo con mi pareja?",
    a: "Sí. Crea una relación compartida, invita por username o código y gestionen finanzas juntos sin perder privacidad individual.",
  },
  {
    q: "¿Cuándo sale el MVP?",
    a: "Abril 2026. Los usuarios en la lista de espera tienen acceso beta anticipado desde marzo.",
  },
  {
    q: "¿Cómo funciona la IA?",
    a: "Analiza tu perfil de gasto, personaliza recomendaciones según tu situación y responde preguntas en tiempo real sobre tus finanzas.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        <SectionHeader badge="FAQ" title="Preguntas frecuentes" />

        <div className="max-w-[640px] mx-auto flex flex-col gap-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.28, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="bg-bg-card border rounded-2xl overflow-hidden transition-colors duration-200"
              style={{
                borderColor: open === i ? "rgba(200,212,0,0.2)" : "rgba(255,255,255,0.07)",
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span className="text-[15px] font-medium text-fg">{f.q}</span>
                <div className="shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-colors duration-200"
                  style={{ borderColor: open === i ? "rgba(200,212,0,0.3)" : undefined }}>
                  {open === i
                    ? <Minus size={13} className="text-lime" strokeWidth={2.5} />
                    : <Plus size={13} className="text-fg/40" strokeWidth={2.5} />
                  }
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-6 pb-5 text-[14px] text-fg/40 leading-[1.75]">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
