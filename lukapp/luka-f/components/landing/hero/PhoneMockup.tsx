"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles, Mic, BarChart3, Home, MessageSquare } from "lucide-react";

type Screen = "dashboard" | "voice" | "ai";

const tabs = [
  { id: "dashboard" as Screen, icon: Home,          label: "Inicio"  },
  { id: "ai"        as Screen, icon: MessageSquare, label: "Coach"   },
  { id: "voice"     as Screen, icon: Mic,           label: "Voz"     },
];

function DashboardScreen() {
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] text-white/40">Abril 2026</p>
          <p className="text-[13px] font-bold text-white">Hola, Steven 👋</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#baea0f] to-[#5913ef] flex items-center justify-center text-[10px] font-bold text-black">S</div>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl p-3 bg-gradient-to-br from-[#1A0040] to-[#0D0025] border border-purple-brand/30 shadow-[0_8px_24px_rgba(89,19,239,0.2)]">
        <p className="text-[9px] text-white/40 mb-0.5">Balance total</p>
        <p className="font-mono text-[24px] font-extrabold leading-none text-white mb-2.5 tracking-tight">
          $4.250.000
        </p>
        <div className="flex gap-3">
          <div>
            <p className="text-[8px] text-white/40">Ingresos</p>
            <p className="text-[11px] font-bold text-[#baea0f]">↑ $5.2M</p>
          </div>
          <div>
            <p className="text-[8px] text-white/40">Gastos</p>
            <p className="text-[11px] font-bold text-pink-400">↓ $950K</p>
          </div>
          <div className="ml-auto flex items-end gap-[3px]">
            {[30, 50, 38, 65, 45, 72, 60].map((h, i) => (
              <div
                key={i}
                className="w-[4px] rounded-sm bg-[#baea0f]/60"
                style={{ height: `${h * 0.22}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* IA insight */}
      <div className="rounded-xl p-2.5 bg-[#baea0f]/10 border border-[#baea0f]/20">
        <div className="flex gap-2 items-start">
          <div className="w-5 h-5 rounded-md bg-[#baea0f] flex items-center justify-center shrink-0">
            <Sparkles size={10} className="text-black" strokeWidth={2.5} />
          </div>
          <p className="text-[9.5px] leading-tight text-white/70">
            Podrías ahorrar <span className="text-[#baea0f] font-semibold">$200K</span> este mes optimizando tus suscripciones.
          </p>
        </div>
      </div>

      {/* Transacciones */}
      <p className="text-[8px] font-bold uppercase tracking-widest text-white/25">Recientes</p>
      <div className="flex flex-col gap-0">
        {[
          { icon: "🍔", name: "Rappi",   amount: "-$45K",   col: "text-pink-400" },
          { icon: "💼", name: "Nómina",  amount: "+$5.2M",  col: "text-[#baea0f]" },
          { icon: "📺", name: "Netflix", amount: "-$19K",   col: "text-pink-400" },
          { icon: "☕", name: "Café",    amount: "-$8K",    col: "text-pink-400" },
        ].map((tx) => (
          <div key={tx.name} className="flex justify-between items-center py-1.5 border-b last:border-0 border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] bg-white/[0.06]">{tx.icon}</div>
              <span className="text-[10px] text-white/50">{tx.name}</span>
            </div>
            <span className={`text-[10px] font-bold font-mono tabular-nums ${tx.col}`}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiScreen() {
  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-brand to-[#baea0f] flex items-center justify-center">
          <Sparkles size={12} className="text-black" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-white">Luka Coach</p>
          <p className="text-[8px] text-[#baea0f]">● En línea</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="self-end max-w-[80%] bg-[#5913ef]/40 border border-purple-brand/25 rounded-xl rounded-br-sm px-2.5 py-1.5">
          <p className="text-[9.5px] text-white/80">¿Cómo voy en mis ahorros?</p>
        </div>
        <div className="self-start max-w-[88%] bg-white/[0.07] border border-white/10 rounded-xl rounded-bl-sm px-2.5 py-1.5">
          <p className="text-[9.5px] leading-tight text-white/75">
            Llevas <span className="text-[#baea0f] font-semibold">$1.2M</span> ahorrados este mes — un <span className="text-[#baea0f] font-semibold">23%</span> más que abril pasado. 🎉
          </p>
        </div>
        <div className="self-start max-w-[88%] bg-white/[0.07] border border-white/10 rounded-xl rounded-bl-sm px-2.5 py-1.5">
          <p className="text-[9.5px] leading-tight text-white/75">
            Si mantienes el ritmo, proyecto <span className="text-[#baea0f] font-semibold">$3.6M</span> en 90 días. Reduce Rappi y llegas antes.
          </p>
        </div>
        <div className="self-end max-w-[80%] bg-[#5913ef]/40 border border-purple-brand/25 rounded-xl rounded-br-sm px-2.5 py-1.5">
          <p className="text-[9.5px] text-white/80">¿Y mi presupuesto de comida?</p>
        </div>
        <div className="self-start max-w-[88%] bg-white/[0.07] border border-white/10 rounded-xl rounded-bl-sm px-2.5 py-1.5">
          <p className="text-[9.5px] leading-tight text-white/75">
            Usaste el <span className="text-pink-400 font-semibold">78%</span> de tu presupuesto de comida. Te quedan <span className="text-white font-semibold">$44K</span> para los últimos 8 días.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="mt-auto flex gap-1.5">
        <div className="flex-1 rounded-xl bg-white/[0.06] border border-white/10 px-2.5 py-1.5">
          <p className="text-[9px] text-white/25">Pregunta algo…</p>
        </div>
        <div className="w-7 h-7 rounded-xl bg-[#5913ef] flex items-center justify-center shrink-0">
          <Sparkles size={10} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function VoiceScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-full">
      <p className="text-[10px] text-white/40">Di en voz alta…</p>

      {/* Mic ring animation */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-[#5913ef]/15 animate-ping" />
        <div className="absolute w-16 h-16 rounded-full bg-[#5913ef]/20" />
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5913ef] to-[#7a3ff5] flex items-center justify-center shadow-[0_0_24px_rgba(89,19,239,0.5)]">
          <Mic size={22} className="text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-[3px] h-8">
        {[3, 6, 10, 7, 14, 9, 5, 12, 8, 4, 11, 7, 3, 9, 6].map((h, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-[#5913ef]"
            animate={{ height: [`${h}px`, `${h * 1.8}px`, `${h}px`] }}
            transition={{ duration: 0.8, delay: i * 0.07, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <p className="text-[13px] font-bold text-white text-center leading-tight">
        &ldquo;Gasté cincuenta mil<br/>en comida hoy&rdquo;
      </p>

      {/* Preview */}
      <div className="w-full rounded-2xl border border-[#baea0f]/30 bg-[#baea0f]/10 px-3 py-2.5">
        <p className="text-[8.5px] text-white/40 mb-1">Detectado</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]">🍔</span>
            <p className="text-[11px] font-semibold text-white">Comida</p>
          </div>
          <p className="text-[13px] font-bold text-[#baea0f] font-mono">-$50.000</p>
        </div>
      </div>

      <button className="w-full py-2 rounded-xl bg-[#baea0f] text-black text-[11px] font-bold">
        Confirmar registro ✓
      </button>
    </div>
  );
}

export default function PhoneMockup() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  // Auto-rotate screens
  useEffect(() => {
    const order: Screen[] = ["dashboard", "ai", "voice"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % order.length;
      setScreen(order[i]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-[240px] mx-auto">
      {/* Glow ambiental */}
      <div className="absolute inset-0 rounded-[40px] bg-purple-brand/20 blur-2xl scale-110 -z-10" />

      {/* Marco del teléfono */}
      <div className="w-[240px] h-[500px] bg-[#0A0008] rounded-[38px] border border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">

        {/* Dynamic Island */}
        <div className="h-8 bg-black flex items-center justify-center">
          <div className="w-16 h-[18px] bg-[#111] rounded-full flex items-center justify-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full bg-[#222]" />
            <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex flex-col h-[calc(100%-32px)] bg-[#08000F]">
          {/* Screen area */}
          <div className="flex-1 px-3.5 pt-3 pb-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {screen === "dashboard" && <DashboardScreen />}
                {screen === "ai"        && <AiScreen />}
                {screen === "voice"     && <VoiceScreen />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tab bar */}
          <div className="h-12 border-t border-white/[0.05] bg-[#050010]/80 flex items-center justify-around px-4">
            {tabs.map((t) => {
              const active = screen === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setScreen(t.id)}
                  className="flex flex-col items-center gap-0.5"
                >
                  <t.icon
                    size={14}
                    className={active ? "text-[#baea0f]" : "text-white/25"}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-[8px] font-medium ${active ? "text-[#baea0f]" : "text-white/25"}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute top-10 -right-3 sm:-right-12 bg-[#0f0f0f] border border-[#baea0f]/25 rounded-xl px-3 py-2 text-[11px] font-semibold text-[#baea0f] whitespace-nowrap animate-float-delayed shadow-lg flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
        IA activa
      </div>
      <div className="absolute bottom-24 -left-3 sm:-left-16 bg-[#0f0f0f] border border-purple-brand/30 rounded-xl px-3 py-2 text-[11px] font-semibold text-[#a07af8] whitespace-nowrap animate-float shadow-lg flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
        +23% ahorro
      </div>
      <div className="absolute bottom-44 -right-3 sm:-right-14 bg-[#0f0f0f] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-semibold text-white/60 whitespace-nowrap shadow-lg flex items-center gap-1.5">
        <BarChart3 className="w-3 h-3" strokeWidth={2} />
        90 días
      </div>
    </div>
  );
}
