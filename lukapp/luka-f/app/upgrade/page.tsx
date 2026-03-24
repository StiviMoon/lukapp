"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Zap, ChevronLeft, Loader2, Crown,
  Mic, Users, BarChart3, Brain, Shield, X, CreditCard, Lock,
} from "lucide-react";
import { usePlan } from "@/lib/hooks/use-plan";
import { toast } from "@/lib/toast";

// ─── Datos ────────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  { icon: Mic,       label: "Registro por voz" },
  { icon: Users,     label: "1 espacio compartido" },
  { icon: BarChart3, label: "Análisis básico" },
  { icon: Shield,    label: "Datos seguros" },
];

const PREMIUM_FEATURES = [
  { icon: Brain,     label: "Coach IA personalizado" },
  { icon: Users,     label: "Espacios ilimitados" },
  { icon: BarChart3, label: "Reportes detallados" },
  { icon: Zap,       label: "Tendencias y proyecciones" },
  { icon: Crown,     label: "Acceso anticipado a features" },
];

// ─── Modal de pago (simulado) ─────────────────────────────────────────────────

function PaymentModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full max-w-sm bg-card rounded-t-3xl px-5 pt-5 pb-10 border-t border-border/60"
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[17px] font-bold text-foreground font-display">Activar Premium</h3>
              <p className="text-[12px] text-muted-foreground/60 mt-0.5">$9.990 COP / mes</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground/60 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Resumen */}
          <div className="bg-muted/30 rounded-2xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Plan Premium</span>
              <span className="font-semibold text-foreground">$9.990</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Facturación</span>
              <span className="text-foreground">Mensual</span>
            </div>
            <div className="border-t border-border/40 pt-2 flex justify-between text-[13px] font-bold">
              <span className="text-foreground">Total hoy</span>
              <span className="text-foreground">$9.990 COP</span>
            </div>
          </div>

          {/* Aviso pagos próximamente */}
          <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-2xl px-4 py-3 mb-5">
            <CreditCard className="w-4 h-4 text-amber-500/70 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-500/80 leading-relaxed">
              Los pagos en línea llegan muy pronto. Por ahora activamos tu cuenta manualmente — escríbenos al soporte.
            </p>
          </div>

          {/* CTA principal */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-lime text-background font-bold text-[15px] hover:bg-lime-dark transition-colors active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" strokeWidth={2.5} />
                Activar Premium ahora
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Lock className="w-3 h-3 text-muted-foreground/30" />
            <p className="text-[10px] text-muted-foreground/30 text-center">
              Pago seguro · Cancela cuando quieras
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const router = useRouter();
  const { isPremium, isLoading, activatePremium, deactivatePremium, isUpdating } = usePlan();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmUpgrade = () => {
    activatePremium();
    setShowModal(false);
    toast.success("¡Bienvenido a Premium! ✦");
  };

  return (
    <>
      <div className="h-dvh flex flex-col bg-background max-w-sm mx-auto overflow-hidden">

        {/* Header */}
        <header className="flex-none px-5 pt-12 pb-4 flex items-center gap-3 border-b border-border/30">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/60 hover:text-foreground transition-colors active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-[17px] font-bold text-foreground font-display">Tu plan</h1>
        </header>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-10">

          {/* Plan actual — banner compacto */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3 ${
              isPremium
                ? "bg-gradient-to-r from-purple-brand/20 to-purple-bright/5 border border-purple-brand/30"
                : "bg-card border border-border"
            }`}
          >
            {isPremium && (
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-purple-bright/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPremium ? "bg-purple-bright/15" : "bg-primary/10"}`}>
              {isPremium ? <Crown className="w-4 h-4 text-purple-muted" /> : <Shield className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">Plan actual</p>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black text-foreground font-display">
                  {isPremium ? "Premium" : "Gratuito"}
                </span>
                {isPremium && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-lime text-background text-[9px] font-bold">
                    <Zap size={8} strokeWidth={3} /> ACTIVO
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Comparación compacta side-by-side */}
          <div className="grid grid-cols-2 gap-3 mb-5">

            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`rounded-2xl p-3.5 border ${!isPremium ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mb-1">Gratis</p>
              <p className="text-[22px] font-extrabold text-foreground font-nums leading-none mb-3">$0</p>
              <div className="space-y-2">
                {FREE_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-primary shrink-0" strokeWidth={2.5} />
                    <span className="text-[11px] text-foreground/70 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              {!isPremium && (
                <div className="mt-3 text-center text-[10px] font-bold text-primary/60">Plan actual</div>
              )}
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-purple-brand/14 to-purple-bright/[0.04] border-[1.5px] border-purple-brand/40"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-bright/10 rounded-full blur-[30px] pointer-events-none" />
              <div className="flex items-center gap-1 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-purple-muted">Premium</p>
                <span className="px-1.5 py-0.5 rounded-full bg-lime text-background text-[8px] font-bold">✦</span>
              </div>
              <p className="text-[22px] font-extrabold text-foreground font-nums leading-none mb-3">$9.990</p>
              <div className="space-y-2">
                {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-purple-muted shrink-0" strokeWidth={2.5} />
                    <span className="text-[11px] text-foreground/80 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              {isPremium && (
                <div className="mt-3 text-center text-[10px] font-bold text-purple-muted/70">Plan actual ✦</div>
              )}
            </motion.div>
          </div>

          {/* CTA */}
          {!isPremium ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-4 rounded-2xl bg-lime text-background font-bold text-[15px] hover:bg-lime-dark transition-colors active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" strokeWidth={2.5} />
              Activar Premium · $9.990/mes
            </button>
          ) : (
            <button
              onClick={() => { deactivatePremium(); toast.success("Volviste al plan Gratuito"); }}
              disabled={isUpdating}
              className="w-full py-3.5 rounded-2xl border border-border text-[13px] font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Cambiar a plan Gratuito"}
            </button>
          )}

          <p className="text-center text-[10px] text-muted-foreground/30 mt-3">
            Pagos en línea próximamente · Cancela cuando quieras
          </p>
        </div>
      </div>

      {/* Modal de pago */}
      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmUpgrade}
          isLoading={isUpdating}
        />
      )}
    </>
  );
}
