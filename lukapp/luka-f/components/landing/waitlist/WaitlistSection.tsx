"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  return (
    <section id="waitlist" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-brand/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[520px] mx-auto text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent text-[12px] font-semibold mb-6">
            Lista de espera
          </span>

          <h2
            className="font-display font-extrabold tracking-tight text-fg mb-4 leading-[1.08]"
            style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}
          >
            Avísanos cuando esté listo
          </h2>

          <p className="text-[16px] text-fg/50 mb-10">
            Deja tu nombre y correo. Serás de los primeros en probar lukapp cuando lancemos.
          </p>

          <WaitlistForm />
        </motion.div>
      </div>
    </section>
  );
}
