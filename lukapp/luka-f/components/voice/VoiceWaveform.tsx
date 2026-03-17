"use client";

import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isListening: boolean;
  isProcessing?: boolean;
}

export function VoiceWaveform({ isListening, isProcessing }: VoiceWaveformProps) {
  if (isProcessing) {
    return (
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          style={{ height: 28 }}
          animate={
            isListening
              ? {
                  scaleY: [0.3, 1, 0.3],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: "easeInOut",
                  },
                }
              : { scaleY: 0.3 }
          }
        />
      ))}
    </div>
  );
}
