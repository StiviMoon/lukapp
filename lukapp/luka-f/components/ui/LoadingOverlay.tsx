"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";

// ─── Tres puntos pulsando en cadena ──────────────────────────────────────────

function PulsingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Overlay global ───────────────────────────────────────────────────────────

export function LoadingOverlay() {
  const { visible, message } = useLoadingOverlay();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Círculo de marca detrás de los dots */}
          <motion.div
            className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-8"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-5 h-5 rounded-xl bg-primary" />
            </motion.div>
          </motion.div>

          {/* Dots animados */}
          <PulsingDots />

          {/* Mensaje */}
          <motion.p
            className="mt-5 text-[15px] font-semibold text-foreground/70 tracking-wide"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
