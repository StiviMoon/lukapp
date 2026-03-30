"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Crown, Lock } from "lucide-react";
import { useCoachInsight } from "@/lib/hooks/use-coach";
import { usePlan } from "@/lib/hooks/use-plan";

export function CoachCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[28px] p-4 bg-purple-brand/15 border border-purple-brand/25 backdrop-blur-[4px]">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />
      <div className="flex items-start gap-3 relative">
        <div className="w-8 h-8 rounded-xl bg-purple-brand/20 animate-pulse shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="h-2.5 w-16 rounded-full bg-white/25 animate-pulse mb-2" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-white/20 animate-pulse" />
            <div className="h-3 w-[80%] rounded-full bg-white/15 animate-pulse [animation-delay:150ms]" />
            <div className="h-3 w-[55%] rounded-full bg-white/12 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
        <div className="w-4 h-4 rounded bg-white/15 animate-pulse shrink-0 mt-1" />
      </div>
    </div>
  );
}

// Solo se monta para usuarios Premium — hace el fetch del insight
function PremiumCoachCard() {
  const router = useRouter();
  const { data: insight, isLoading, isError } = useCoachInsight();

  if (isLoading) return <CoachCardSkeleton />;

  const insightText = isError ? "Analizando tus finanzas..." : (insight ?? "Analizando tus finanzas...");

  return (
    <div
      onClick={() => router.push("/coach")}
      className="relative overflow-hidden rounded-[28px] p-4 cursor-pointer active:scale-[0.98] transition-transform balance-card-themed"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />
      <div className="flex items-start gap-3 relative">
        <div className="w-8 h-8 rounded-xl bg-purple-brand/25 border border-purple-brand/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 mb-1">
            Luka dice
          </p>
          <p className="text-[13px] leading-relaxed text-white/90 min-h-[52px]">
            {insightText.replace(/\*\*|__|\*|_/g, "")}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/45 shrink-0 mt-1" />
      </div>
    </div>
  );
}

// CTA estático para usuarios FREE — sin fetch, sin delay
function FreeCoachCard() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/upgrade")}
      className="relative overflow-hidden rounded-[28px] p-4 cursor-pointer active:scale-[0.98] transition-transform balance-card-themed"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />
      <div className="flex items-start gap-3 relative">
        <div className="w-8 h-8 rounded-xl bg-purple-brand/25 border border-purple-brand/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
              Luka dice
            </p>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/15 text-[9px] font-bold text-white/90 border border-white/20">
              <Crown className="w-2.5 h-2.5" />
              Premium
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/35 blur-[3px] select-none min-h-[52px]">
            Estás gastando más de lo planeado este mes. Te recomiendo revisar tus gastos en restaurantes.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/45 shrink-0 mt-1" />
      </div>

      {/* CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-[28px]">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
          <Lock className="w-3 h-3" />
          Activa Premium para verlo
        </span>
      </div>
    </div>
  );
}

// Componente público — decide cuál renderizar según plan
export function CoachCard() {
  const { isPremium, isLoading: planLoading } = usePlan();

  if (planLoading) return <CoachCardSkeleton />;
  return isPremium ? <PremiumCoachCard /> : <FreeCoachCard />;
}
