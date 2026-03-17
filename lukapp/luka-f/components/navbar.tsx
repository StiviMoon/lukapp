"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Mic, BarChart2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";

const SHOW_ON = ["/dashboard", "/history", "/analytics", "/settings", "/profile"];

export function Navbar() {
  const pathname              = usePathname();
  const [mounted, setMounted] = useState(false);
  const { openVoice }         = useVoiceStore();
  const { open: openAdd }     = useAddTransactionStore();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!SHOW_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-[14px] px-6">
      <nav
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full"
        style={{
          background: "color-mix(in srgb, var(--card) 82%, transparent)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 1px 0 color-mix(in srgb, var(--border) 20%, transparent) inset",
        }}
      >
        {/* Inicio */}
        <NavLink href="/dashboard" icon={Home} label="Inicio" pathname={pathname} />

        {/* Historial */}
        <NavLink href="/history" icon={History} label="Historial" pathname={pathname} />

        {/* ── FAB principal — Voz ── */}
        <div className="mx-2">
          <button
            onClick={openVoice}
            className="w-[56px] h-[56px] rounded-full flex items-center justify-center bg-primary transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 55%, transparent), 0 0 0 5px color-mix(in srgb, var(--primary) 12%, transparent)",
            }}
            aria-label="Registrar por voz"
          >
            <Mic className="w-[22px] h-[22px] text-white" strokeWidth={2.2} />
          </button>
        </div>

        {/* ── Botón secundario — Registro manual ── */}
        <button
          onClick={() => openAdd("EXPENSE")}
          className="relative flex flex-col items-center gap-[3px] px-3.5 py-2 rounded-full transition-all duration-200 active:scale-90 text-muted-foreground/50 hover:text-muted-foreground/80"
          aria-label="Registrar movimiento"
        >
          <div className="w-[20px] h-[20px] flex items-center justify-center">
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </div>
          <span className="text-[9px] font-bold tracking-wide leading-none">Manual</span>
        </button>

        {/* Analíticas */}
        <NavLink href="/analytics" icon={BarChart2} label="Analíticas" pathname={pathname} />
      </nav>
    </div>
  );
}

// ─── NavLink ────────────────────────────────────────────────────────────────

function NavLink({
  href, icon: Icon, label, pathname,
}: {
  href: string; icon: React.ElementType; label: string; pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
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
}
