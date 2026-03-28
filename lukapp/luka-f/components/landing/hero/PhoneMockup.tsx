"use client";

import { TrendingUp, Sparkles } from "lucide-react";

/**
 * Mockup del celular en el hero. Usa solo clases Tailwind (dark:) para seguir
 * el tema del documento; así no hay hydration mismatch y los colores se ven
 * bien desde el primer paint (system/light/dark desde el root ThemeProvider).
 */
export default function PhoneMockup() {
  return (
    <div className="relative w-[240px] animate-float mx-auto">
      {/* Marco del teléfono (bezel oscuro) */}
      <div className="w-[240px] h-[480px] bg-[#0E0E0E] rounded-[36px] border border-fg/10 dark:border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        <div className="h-9 bg-black flex items-center justify-center">
          <div className="w-16 h-[18px] bg-[#1A1A1A] rounded-full" />
        </div>

        {/* Contenido de la app: mismo HTML, tema con dark: */}
        <div className="px-3.5 pt-3 flex flex-col gap-2.5 h-[calc(100%-36px)] bg-[#f8f9fa] dark:bg-[#0A0A0A]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-fg/50 dark:text-fg/30">Marzo 2026</p>
              <p className="text-[13px] font-bold font-display text-fg">Balance</p>
            </div>
            <div className="w-7 h-7 rounded-full overflow-hidden flex">
              <div className="w-1/2 bg-lime" />
              <div className="w-1/2 bg-purple-bright" />
            </div>
          </div>

          <div className="rounded-2xl p-3.5 border bg-white border-border shadow-sm dark:bg-gradient-to-br dark:from-[#1A0035] dark:to-[#0F001A] dark:border-purple-brand/20">
            <p className="text-[9px] text-fg/50 dark:text-fg/30 mb-1">Total disponible</p>
            <p className="font-nums text-[22px] font-extrabold leading-none mb-2.5 tabular-nums text-lime">
              $2.847.500
            </p>
            <div className="flex gap-4">
              <div>
                <p className="text-[9px] text-fg/50 dark:text-fg/30">Ingresos</p>
                <p className="text-[11px] font-bold text-green-600 dark:text-green-400">↑ $3.5M</p>
              </div>
              <div>
                <p className="text-[9px] text-fg/50 dark:text-fg/30">Gastos</p>
                <p className="text-[11px] font-bold text-pink-600 dark:text-pink-400">↓ $652K</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-2.5 border bg-lime/10 border-lime/20 dark:bg-lime/[0.07] dark:border-lime/[0.15]">
            <div className="flex gap-2">
              <div className="w-[18px] h-[18px] rounded-md bg-lime flex items-center justify-center text-[9px] text-bg font-bold shrink-0">
                ✦
              </div>
              <p className="text-[10px] leading-normal text-fg/70 dark:text-fg/60">
                &ldquo;Podrías ahorrar $200K este mes optimizando tus suscripciones.&rdquo;
              </p>
            </div>
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-widest text-fg/40 dark:text-fg/20">
            Recientes
          </p>
          <div className="flex flex-col">
            {[
              { icon: "🍔", name: "Rappi", amount: "-$45K", color: "text-pink-600 dark:text-pink-400" },
              { icon: "💼", name: "Nómina", amount: "+$3.5M", color: "text-green-600 dark:text-green-400" },
              { icon: "📺", name: "Netflix", amount: "-$19K", color: "text-pink-600 dark:text-pink-400" },
            ].map((tx) => (
              <div
                key={tx.name}
                className="flex justify-between items-center py-[7px] border-b last:border-0 border-border dark:border-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[11px] bg-fg/[0.06] dark:bg-white/[0.05]">
                    {tx.icon}
                  </div>
                  <span className="text-[11px] text-fg/60 dark:text-fg/50">{tx.name}</span>
                </div>
                <span className={`text-[11px] font-bold font-nums tabular-nums ${tx.color}`}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-12 -right-4 sm:-right-14 bg-bg-card dark:bg-[#161618] border border-accent-border dark:border-lime/25 rounded-xl px-3 py-2 text-[11px] font-semibold text-accent dark:text-lime whitespace-nowrap animate-float-delayed shadow-lg flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
        IA activa
      </div>
      <div className="absolute bottom-24 -left-4 sm:-left-14 bg-bg-card dark:bg-[#161618] border border-purple-brand/20 dark:border-purple-brand/30 rounded-xl px-3 py-2 text-[11px] font-semibold text-purple-muted whitespace-nowrap animate-float shadow-lg flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
        +12% ahorro
      </div>
    </div>
  );
}
