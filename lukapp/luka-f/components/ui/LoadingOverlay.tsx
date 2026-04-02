"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";
import { IosLoadingCard } from "@/components/ui/ios-loading";

export function LoadingOverlay() {
  const { visible, message, subtitle } = useLoadingOverlay();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 px-6 backdrop-blur-md dark:bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          role="alertdialog"
          aria-modal="true"
          aria-busy="true"
          aria-labelledby="global-loading-title"
        >
          <IosLoadingCard
            titleId="global-loading-title"
            title={message || "Cargando…"}
            subtitle={subtitle || undefined}
            className="border-border/40"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
