"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Users,
  BarChart3,
  Zap,
  AlertCircle,
  Crown,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api/client";

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_POLL_ATTEMPTS = 15; // 15 × 2s = 30 segundos máximo
const POLL_INTERVAL_MS  = 2000;

const PRO_FEATURES = [
  { icon: Brain,    label: "Chat ilimitado con Coach IA Luka" },
  { icon: Users,    label: "Espacios compartidos ilimitados" },
  { icon: BarChart3,label: "Análisis de tendencias 90 días" },
  { icon: Zap,      label: "Alertas financieras inteligentes" },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PageState = "verifying" | "approved" | "pending" | "error";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradeSuccessPage() {
  const router   = useRouter();
  const [state, setState] = useState<PageState>("verifying");
  const attempts = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.subscription.getStatus();
        if (res.success && res.data) {
          // Suscripción activa encontrada → pago aprobado
          clearInterval(intervalRef.current!);
          setState("approved");
          return;
        }

        attempts.current += 1;

        if (attempts.current >= MAX_POLL_ATTEMPTS) {
          // Se agotó el tiempo → pago probablemente en proceso
          clearInterval(intervalRef.current!);
          setState("pending");
        }
      } catch {
        clearInterval(intervalRef.current!);
        setState("error");
      }
    };

    // Primera verificación inmediata, luego cada 2s
    void poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 max-w-sm mx-auto">
      <AnimatePresence mode="wait">

        {/* ── VERIFICANDO ── */}
        {state === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-7 h-7 text-muted-foreground animate-spin" />
            </div>
            <h1 className="text-[22px] font-bold text-foreground font-display mb-2">
              Verificando tu pago…
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Conectando con Wompi. Esto tarda solo un momento.
            </p>
            {/* Dots de carga */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── APROBADO ── */}
        {state === "approved" && (
          <motion.div
            key="approved"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center w-full"
          >
            {/* Icono con glow */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-3xl bg-purple-brand/20 blur-xl" />
              <motion.div
                className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-brand/25 to-purple-bright/10 border border-purple-brand/40 flex items-center justify-center"
                initial={{ rotate: -6, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
              >
                <Crown className="w-9 h-9 text-purple-muted" />
              </motion.div>
            </div>

            {/* Etiqueta PRO */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/10 border border-lime/25 mb-4"
            >
              <Zap className="w-3 h-3 text-lime" strokeWidth={3} />
              <span className="text-[11px] font-bold text-lime uppercase tracking-wider">
                Pro activado
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[28px] font-black text-foreground font-display leading-tight mb-2"
            >
              ¡Bienvenido al Pro!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-[14px] text-muted-foreground mb-8 leading-relaxed"
            >
              Ya tienes acceso completo a todo lo que Lukapp puede ofrecerte.
              Luka te está esperando.
            </motion.p>

            {/* Features desbloqueadas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="bg-card border border-border rounded-2xl p-4 mb-6 text-left space-y-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 mb-3">
                Lo que desbloqueaste
              </p>
              {PRO_FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-brand/12 border border-purple-brand/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-purple-muted" />
                  </div>
                  <span className="text-[13px] text-foreground/80">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              type="button"
              onClick={() => router.push("/dashboard")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full py-4 rounded-2xl bg-lime text-background font-bold text-[15px] hover:bg-lime-dark transition-colors active:scale-[0.97] flex items-center justify-center gap-2"
            >
              Ir al inicio
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => router.push("/coach")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full py-3 mt-2 rounded-2xl text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Hablar con Luka →
            </motion.button>
          </motion.div>
        )}

        {/* ── PENDIENTE ── */}
        {state === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-[22px] font-bold text-foreground font-display mb-2">
              Tu pago está en proceso
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
              Wompi está procesando tu pago. Esto puede tomar unos minutos.
              Cuando se confirme, tu plan se activará automáticamente.
            </p>
            <button
              type="button"
              onClick={() => {
                attempts.current = 0;
                setState("verifying");
                intervalRef.current = setInterval(async () => {
                  const res = await api.subscription.getStatus();
                  if (res.success && res.data) {
                    clearInterval(intervalRef.current!);
                    setState("approved");
                  } else {
                    attempts.current += 1;
                    if (attempts.current >= MAX_POLL_ATTEMPTS) {
                      clearInterval(intervalRef.current!);
                      setState("pending");
                    }
                  }
                }, POLL_INTERVAL_MS);
              }}
              className="w-full py-4 rounded-2xl bg-card border border-border text-[14px] font-semibold text-foreground hover:border-border/80 transition-colors mb-3"
            >
              Verificar de nuevo
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-2xl text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Ir al dashboard
            </button>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-7 h-7 text-rose-500" />
            </div>
            <h1 className="text-[22px] font-bold text-foreground font-display mb-2">
              Algo salió mal
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
              No pudimos verificar el estado de tu pago. Si el cobro se realizó,
              tu plan se activará en breve. Si no, intenta de nuevo.
            </p>
            <button
              type="button"
              onClick={() => router.push("/upgrade")}
              className="w-full py-4 rounded-2xl bg-card border border-border text-[14px] font-semibold text-foreground hover:border-border/80 transition-colors mb-3"
            >
              Volver a intentar
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-2xl text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Ir al dashboard
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
