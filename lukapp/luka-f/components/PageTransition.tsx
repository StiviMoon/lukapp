"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Envuelve el contenido de cada ruta con un fade-in suave.
 * No usa AnimatePresence de salida (no hay exit animation en Next App Router),
 * solo entrada: opacity 0 → 1 en 180ms con ease iOS.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ minHeight: "100dvh" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
