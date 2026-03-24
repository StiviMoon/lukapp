"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Crown } from "lucide-react";
import { useCoachInsight } from "@/lib/hooks/use-coach";
import { usePlan } from "@/lib/hooks/use-plan";

export function CoachCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-brand/12 to-purple-bright/[0.04] border border-purple-brand/25">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-bright/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start gap-3 relative">
        {/* Icono skeleton */}
        <div className="w-8 h-8 rounded-xl bg-purple-brand/20 animate-pulse shrink-0 mt-0.5" />

        {/* Texto skeleton */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Label "Luka dice" */}
          <div className="h-2.5 w-16 rounded-full bg-purple-brand/20 animate-pulse mb-2" />
          {/* Líneas del insight con anchos variables */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-purple-brand/15 animate-pulse" />
            <div className="h-3 w-[80%] rounded-full bg-purple-brand/12 animate-pulse [animation-delay:150ms]" />
            <div className="h-3 w-[55%] rounded-full bg-purple-brand/10 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>

        {/* Arrow skeleton */}
        <div className="w-4 h-4 rounded bg-purple-brand/15 animate-pulse shrink-0 mt-1" />
      </div>
    </div>
  );
}

export function CoachCard() {
  const router = useRouter();
  const { isPremium } = usePlan();
  const { data: insight, isLoading } = useCoachInsight();

  if (isLoading) return <CoachCardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      onClick={() => router.push(isPremium ? "/coach" : "/upgrade")}
      className="relative overflow-hidden rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform bg-gradient-to-br from-purple-brand/12 to-purple-bright/[0.04] border border-purple-brand/25"
    >
      {/* Glow de fondo */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-bright/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 relative">
        {/* Icono */}
        <div className="w-8 h-8 rounded-xl bg-purple-brand/20 border border-purple-brand/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-purple-muted" strokeWidth={2} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-muted/70">
              Luka dice
            </p>
            {!isPremium && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-brand/15 text-[9px] font-bold text-purple-muted">
                <Crown className="w-2.5 h-2.5" />
                Premium
              </span>
            )}
          </div>

          <p className={`text-[13px] leading-relaxed ${isPremium ? "text-foreground/80" : "text-foreground/50 blur-[3px] select-none"}`}>
            {(insight ?? "Analizando tus finanzas...").replace(/\*\*|__|\*|_/g, "")}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-purple-muted/50 shrink-0 mt-1" />
      </div>

      {/* Lock overlay para free */}
      {!isPremium && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-purple-muted bg-purple-brand/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-brand/30">
            Activa Premium para ver tu insight →
          </span>
        </div>
      )}
    </motion.div>
  );
}
