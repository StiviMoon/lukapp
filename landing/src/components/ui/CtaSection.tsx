"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CtaSection() {
  const scrollToWaitlist = () =>
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-24 text-center relative">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      <div className="max-w-[1100px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-display font-extrabold tracking-tight text-fg mb-5 max-w-[580px] mx-auto leading-[1.08]"
            style={{ fontSize: "clamp(32px, 5vw, 60px)" }}
          >
            ¿Listo para controlar tu plata?
          </h2>
          <p className="text-fg/35 text-[16px] mb-9">
            50,000+ personas ya esperan. No te quedes atrás.
          </p>
          <button
            onClick={scrollToWaitlist}
            className="inline-flex items-center gap-2.5 px-10 py-4 bg-lime text-bg font-bold text-[16px] rounded-2xl hover:bg-lime-dark transition-colors duration-200"
          >
            <Sparkles size={18} strokeWidth={2.5} />
            Empezar gratis
          </button>
        </motion.div>
      </div>
    </section>
  );
}
