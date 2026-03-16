"use client";

import { useTheme } from "next-themes";

export default function PhoneMockup() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative w-[240px] animate-float mx-auto">
      {/* Phone frame (bezel siempre oscuro como dispositivo real) */}
      <div className="w-[240px] h-[480px] bg-[#0E0E0E] rounded-[36px] border border-fg/10 dark:border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
        {/* Notch */}
        <div className="h-9 bg-black flex items-center justify-center">
          <div className="w-16 h-[18px] bg-[#1A1A1A] rounded-full" />
        </div>

        {/* App content — theme-aware: claro = fondo claro y texto oscuro */}
        <div
          className={`px-3.5 pt-3 flex flex-col gap-2.5 h-[calc(100%-36px)] ${
            isDark ? "bg-[#0A0A0A]" : "bg-[#f8f9fa]"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-[10px] ${isDark ? "text-fg/30" : "text-fg/50"}`}>Marzo 2026</p>
              <p className={`text-[13px] font-bold font-display ${isDark ? "text-fg" : "text-fg"}`}>Balance</p>
            </div>
            <div className="w-7 h-7 rounded-full overflow-hidden flex">
              <div className="w-1/2 bg-lime" />
              <div className="w-1/2 bg-purple-bright" />
            </div>
          </div>

          {/* Balance card */}
          <div
            className={`rounded-2xl p-3.5 border ${
              isDark
                ? "bg-gradient-to-br from-[#1A0035] to-[#0F001A] border-purple-brand/20"
                : "bg-white border-border shadow-sm"
            }`}
          >
            <p className={`text-[9px] ${isDark ? "text-fg/30" : "text-fg/50"} mb-1`}>Total disponible</p>
            <p className="font-nums text-[22px] font-extrabold leading-none mb-2.5 tabular-nums text-lime dark:text-lime">
              $2.847.500
            </p>
            <div className="flex gap-4">
              <div>
                <p className={`text-[9px] ${isDark ? "text-fg/30" : "text-fg/50"}`}>Ingresos</p>
                <p className="text-[11px] font-bold text-green-600 dark:text-green-400">↑ $3.5M</p>
              </div>
              <div>
                <p className={`text-[9px] ${isDark ? "text-fg/30" : "text-fg/50"}`}>Gastos</p>
                <p className="text-[11px] font-bold text-pink-600 dark:text-pink-400">↓ $652K</p>
              </div>
            </div>
          </div>

          {/* AI tip */}
          <div
            className={`rounded-xl p-2.5 border ${
              isDark
                ? "bg-lime/[0.07] border-lime/[0.15]"
                : "bg-lime/10 border-lime/20"
            }`}
          >
            <div className="flex gap-2">
              <div className="w-[18px] h-[18px] rounded-md bg-lime flex items-center justify-center text-[9px] text-bg font-bold flex-shrink-0">
                ✦
              </div>
              <p className={`text-[10px] leading-[1.5] ${isDark ? "text-fg/60" : "text-fg/70"}`}>
                &ldquo;Podrías ahorrar $200K este mes optimizando tus suscripciones.&rdquo;
              </p>
            </div>
          </div>

          {/* Transactions */}
          <p className={`text-[9px] font-semibold uppercase tracking-widest ${isDark ? "text-fg/20" : "text-fg/40"}`}>
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
                className={`flex justify-between items-center py-[7px] border-b last:border-0 ${
                  isDark ? "border-white/[0.04]" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center text-[11px] ${
                      isDark ? "bg-white/[0.05]" : "bg-fg/[0.06]"
                    }`}
                  >
                    {tx.icon}
                  </div>
                  <span className={`text-[11px] ${isDark ? "text-fg/50" : "text-fg/60"}`}>{tx.name}</span>
                </div>
                <span className={`text-[11px] font-bold font-nums tabular-nums ${tx.color}`}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badges — theme-aware */}
      <div className="absolute top-12 -right-14 bg-bg-card dark:bg-[#111] border border-accent-border dark:border-lime/25 rounded-xl px-3 py-2 text-[11px] font-semibold text-accent dark:text-lime whitespace-nowrap animate-float-delayed shadow-lg">
        ✦ IA activa
      </div>
      <div className="absolute bottom-24 -left-14 bg-bg-card dark:bg-[#111] border border-purple-brand/20 dark:border-purple-brand/30 rounded-xl px-3 py-2 text-[11px] font-semibold text-purple-muted whitespace-nowrap animate-float shadow-lg">
        📊 +12% ahorro
      </div>
    </div>
  );
}
