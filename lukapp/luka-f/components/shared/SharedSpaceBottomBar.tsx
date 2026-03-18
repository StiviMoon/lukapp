"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Home, Receipt, Users, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Option {
  icon: React.ElementType;
  label: string;
  sub?: string;
  action: () => void;
  primary?: boolean;
}

interface SharedSpaceBottomBarProps {
  onAddExpense: () => void;
}

export function SharedSpaceBottomBar({ onAddExpense }: SharedSpaceBottomBarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const options: Option[] = [
    { icon: Settings2, label: "Ajustes", action: () => router.push("/settings") },
    { icon: Users,     label: "Amigos",  action: () => router.push("/friends") },
    { icon: Home,      label: "Inicio",  action: () => router.push("/dashboard") },
    { icon: Receipt,   label: "Gasto",   action: onAddExpense, primary: true },
  ];

  const handleOption = (action: () => void) => {
    setOpen(false);
    setTimeout(action, 100);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-3 px-4 pointer-events-none">

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="bd"
            className="fixed inset-0 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Wrapper — alineado a la derecha */}
      <div className="pointer-events-auto relative flex justify-end w-full max-w-sm">

        {/* ── Columna de opciones — derecha, encima del pill ──────────────── */}
        <AnimatePresence>
          {open && (
            <div className="absolute bottom-[calc(100%+10px)] right-0 flex flex-col items-end gap-1.5">
              {options.map((opt, i) => (
                <motion.button
                  key={opt.label}
                  type="button"
                  onClick={() => handleOption(opt.action)}
                  className={cn(
                    "flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-2xl text-left active:opacity-70 transition-opacity",
                    opt.primary ? "bg-primary" : ""
                  )}
                  style={
                    opt.primary
                      ? { boxShadow: "0 4px 16px color-mix(in srgb, var(--primary) 38%, transparent)" }
                      : {
                          background: "color-mix(in srgb, var(--card) 92%, transparent)",
                          backdropFilter: "blur(16px) saturate(170%)",
                          WebkitBackdropFilter: "blur(16px) saturate(170%)",
                          border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
                        }
                  }
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: 4 }}
                  transition={{
                    duration: 0.2,
                    ease: EASE_OUT,
                    delay: (options.length - 1 - i) * 0.04,
                  }}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0",
                    opt.primary ? "bg-white/20" : "bg-muted/70"
                  )}>
                    <opt.icon
                      className={cn("w-3.5 h-3.5", opt.primary ? "text-white" : "text-foreground/65")}
                      strokeWidth={2.0}
                    />
                  </div>
                  <span className={cn(
                    "text-[12px] font-bold",
                    opt.primary ? "text-white" : "text-foreground/80"
                  )}>
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* ── Pill navbar — alineado a la derecha, nunca se mueve ─────────── */}
        <nav
          aria-label="Navegación sala compartida"
          className="flex items-center px-2 py-1.5 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--card) 82%, transparent)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            border:
              "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
            boxShadow:
              "0 6px 22px rgba(0,0,0,0.18), 0 1px 0 color-mix(in srgb, var(--border) 18%, transparent) inset",
          }}
        >
          <motion.button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-12 w-12 rounded-full bg-primary flex items-center justify-center focus-visible:outline-none"
            style={{
              boxShadow: open
                ? "0 2px 8px color-mix(in srgb, var(--primary) 28%, transparent)"
                : "0 4px 18px color-mix(in srgb, var(--primary) 52%, transparent), 0 0 0 5px color-mix(in srgb, var(--primary) 12%, transparent)",
            }}
            animate={{ rotate: open ? 45 : 0 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 300,
              mass: 0.8,
            }}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
          </motion.button>
        </nav>
      </div>
    </div>
  );
}
