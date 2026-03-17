"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, Settings, User, Plus, Minus, TrendingUp, Mic, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";

// Páginas donde se muestra la navbar
const SHOW_ON = ["/dashboard", "/history", "/settings", "/profile"];

const NAV_LEFT  = [
  { href: "/dashboard", icon: Home,    label: "Inicio"    },
  { href: "/history",   icon: History, label: "Historial" },
];
const NAV_RIGHT = [
  { href: "/settings",  icon: Settings, label: "Ajustes" },
  { href: "/profile",   icon: User,     label: "Perfil"  },
];

// Opciones del FAB "+"
const FAB_OPTIONS = [
  {
    id: "expense",
    icon: Minus,
    label: "Gasto",
    color: "bg-rose-500",
    shadow: "rgba(239,68,68,0.45)",
  },
  {
    id: "income",
    icon: TrendingUp,
    label: "Ingreso",
    color: "bg-emerald-500",
    shadow: "rgba(16,185,129,0.45)",
  },
  {
    id: "voice",
    icon: Mic,
    label: "Hablar",
    color: "bg-primary",
    shadow: "color-mix(in srgb, var(--primary) 45%, transparent)",
  },
] as const;

export function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [fabOpen, setFabOpen]   = useState(false);
  const { openVoice }           = useVoiceStore();
  const { open: openAdd }       = useAddTransactionStore();
  const backdropRef             = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Cierra el menú cuando cambia de ruta
  useEffect(() => { setFabOpen(false); }, [pathname]);

  if (!mounted) return null;

  const shouldShow = SHOW_ON.some(p => pathname.startsWith(p));
  if (!shouldShow) return null;

  const handleFabOption = (id: typeof FAB_OPTIONS[number]["id"]) => {
    setFabOpen(false);
    if (id === "voice") openVoice();
    else if (id === "expense") openAdd("EXPENSE");
    else if (id === "income") openAdd("INCOME");
  };

  return (
    <>
      {/* Backdrop invisible para cerrar el menú */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            key="fab-backdrop"
            ref={backdropRef}
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Wrapper fixed centrado */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-6 px-6">

        {/* FAB options — aparecen arriba del FAB */}
        <div className="absolute bottom-full mb-4 flex flex-col items-center gap-2.5 pointer-events-none">
          <AnimatePresence>
            {fabOpen && FAB_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.id}
                className={cn(
                  "pointer-events-auto flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full text-white text-[13px] font-semibold",
                  opt.color,
                )}
                style={{
                  boxShadow: `0 4px 16px ${opt.shadow}`,
                }}
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.85 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 350,
                  delay: i * 0.04,
                }}
                onClick={() => handleFabOption(opt.id)}
              >
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <opt.icon className="w-3.5 h-3.5" />
                </span>
                {opt.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Pill flotante ── */}
        <nav
          className="pointer-events-auto relative flex items-center gap-1 px-3 py-2 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--card) 80%, transparent)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 1px 0 color-mix(in srgb, var(--border) 20%, transparent) inset",
          }}
        >
          {/* Left: Inicio + Historial */}
          <div className="flex items-center gap-1">
            {NAV_LEFT.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center gap-[3px] px-3.5 py-2 rounded-full transition-all duration-200 active:scale-90",
                    active ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground/70",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-primary/10"
                      transition={{ type: "spring", damping: 26, stiffness: 380 }}
                    />
                  )}
                  <Icon className="relative w-[20px] h-[20px]" strokeWidth={active ? 2.5 : 1.8} />
                  <span className="relative text-[9px] font-bold tracking-wide leading-none">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Central FAB ── */}
          <div className="relative flex items-center justify-center mx-1.5">
            <button
              onClick={() => setFabOpen(v => !v)}
              className={cn(
                "relative w-[52px] h-[52px] rounded-full flex items-center justify-center bg-primary",
                "transition-all duration-200 hover:scale-105 active:scale-95",
              )}
              style={{
                boxShadow: fabOpen
                  ? "0 0 0 5px color-mix(in srgb, var(--primary) 20%, transparent), 0 6px 24px color-mix(in srgb, var(--primary) 55%, transparent)"
                  : "0 4px 18px color-mix(in srgb, var(--primary) 45%, transparent)",
              }}
              aria-label="Registrar o hablar"
            >
              <motion.div
                animate={{ rotate: fabOpen ? 45 : 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 350 }}
              >
                <Plus className="w-[22px] h-[22px] text-white" strokeWidth={2.5} />
              </motion.div>
            </button>
          </div>

          {/* Right: Ajustes + Perfil */}
          <div className="flex items-center gap-1">
            {NAV_RIGHT.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center gap-[3px] px-3.5 py-2 rounded-full transition-all duration-200 active:scale-90",
                    active ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground/70",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-primary/10"
                      transition={{ type: "spring", damping: 26, stiffness: 380 }}
                    />
                  )}
                  <Icon className="relative w-[20px] h-[20px]" strokeWidth={active ? 2.5 : 1.8} />
                  <span className="relative text-[9px] font-bold tracking-wide leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
