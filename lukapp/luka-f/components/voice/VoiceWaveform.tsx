"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

interface VoiceWaveformProps {
  isListening: boolean;
  isProcessing?: boolean;
  hasActivity?: boolean; // true cuando hay voz detectada (texto interim presente)
}

const BAR_CONFIG = [
  { baseH: 8,  activeH: 24, delay: 0.00 },
  { baseH: 14, activeH: 40, delay: 0.10 },
  { baseH: 20, activeH: 54, delay: 0.18 },
  { baseH: 26, activeH: 64, delay: 0.05 },
  { baseH: 20, activeH: 52, delay: 0.22 },
  { baseH: 14, activeH: 42, delay: 0.13 },
  { baseH: 8,  activeH: 26, delay: 0.07 },
];

export function VoiceWaveform({
  isListening,
  isProcessing,
  hasActivity = false,
}: VoiceWaveformProps) {
  // Spinner de procesamiento
  if (isProcessing) {
    return (
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  return (
    <div className="relative flex items-center justify-center h-20 w-full">
      <AnimatePresence mode="wait">
        {isListening && !hasActivity ? (
          // ── Estado de espera: círculo pulsante con ondas ──────────────────
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="relative flex items-center justify-center"
          >
            {/* Ondas de expansión */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border border-primary/30"
                style={{ width: 56, height: 56 }}
                animate={{
                  scale: [1, 2.2],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
              />
            ))}
            {/* Círculo central con ícono */}
            <motion.div
              className="relative z-10 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mic className="w-6 h-6 text-primary" strokeWidth={2} />
            </motion.div>
          </motion.div>
        ) : (
          // ── Estado activo: barras de onda reactivas ───────────────────────
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-[3px]"
            aria-hidden
          >
            {BAR_CONFIG.map((bar, i) => (
              <motion.div
                key={i}
                className="rounded-full bg-primary"
                style={{ width: 3 }}
                animate={
                  isListening && hasActivity
                    ? {
                        height: [bar.baseH, bar.activeH, bar.baseH],
                        transition: {
                          duration: 0.5,
                          repeat: Infinity,
                          delay: bar.delay,
                          ease: "easeInOut",
                        },
                      }
                    : { height: bar.baseH }
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
