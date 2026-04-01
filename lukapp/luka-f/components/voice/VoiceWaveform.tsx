"use client";

import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isListening: boolean;
  isProcessing?: boolean;
  hasActivity?: boolean; // true cuando hay voz detectada (texto interim presente)
}

// Alturas y delays por barra para dar forma de onda natural
const BAR_CONFIG = [
  { baseH: 10, activeH: 28, delay: 0.00 },
  { baseH: 16, activeH: 42, delay: 0.10 },
  { baseH: 22, activeH: 56, delay: 0.18 },
  { baseH: 16, activeH: 44, delay: 0.08 },
  { baseH: 10, activeH: 30, delay: 0.14 },
  { baseH: 20, activeH: 50, delay: 0.22 },
  { baseH: 12, activeH: 32, delay: 0.06 },
];

export function VoiceWaveform({
  isListening,
  isProcessing,
  hasActivity = false,
}: VoiceWaveformProps) {
  if (isProcessing) {
    return (
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  const isActive = isListening && hasActivity;
  const duration = isActive ? 0.55 : 0.9;

  return (
    <div className="flex items-center gap-[3px]" aria-hidden>
      {BAR_CONFIG.map((bar, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 3,
            backgroundColor: isActive
              ? "hsl(var(--primary))"
              : "hsl(var(--primary) / 0.5)",
          }}
          animate={
            isListening
              ? {
                  height: [bar.baseH, isActive ? bar.activeH : bar.baseH * 1.4, bar.baseH],
                  transition: {
                    duration,
                    repeat: Infinity,
                    delay: bar.delay,
                    ease: "easeInOut",
                  },
                }
              : { height: bar.baseH }
          }
        />
      ))}
    </div>
  );
}
