"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, Info, Loader2,
} from "lucide-react";
import { useToastStore, type ToastItem, type ToastType } from "@/lib/store/toast-store";
import { cn } from "@/lib/utils";

// ─── Config visual por tipo ──────────────────────────────────────────────────

const CONFIG: Record<ToastType, {
  icon: React.ElementType;
  iconClass: string;
  bgVar: string;
  borderVar: string;
  progressVar: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgVar:       "color-mix(in srgb, #10b981 9%, var(--background))",
    borderVar:   "color-mix(in srgb, #10b981 35%, transparent)",
    progressVar: "#10b981",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-500",
    bgVar:       "color-mix(in srgb, #f43f5e 9%, var(--background))",
    borderVar:   "color-mix(in srgb, #f43f5e 35%, transparent)",
    progressVar: "#f43f5e",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgVar:       "color-mix(in srgb, #f59e0b 9%, var(--background))",
    borderVar:   "color-mix(in srgb, #f59e0b 35%, transparent)",
    progressVar: "#f59e0b",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgVar:       "color-mix(in srgb, #3b82f6 9%, var(--background))",
    borderVar:   "color-mix(in srgb, #3b82f6 35%, transparent)",
    progressVar: "#3b82f6",
  },
  loading: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    bgVar:       "color-mix(in srgb, var(--primary) 9%, var(--background))",
    borderVar:   "color-mix(in srgb, var(--primary) 35%, transparent)",
    progressVar: "var(--primary)",
  },
};

// ─── Toast individual ────────────────────────────────────────────────────────

function Toast({ item }: { item: ToastItem }) {
  const remove   = useToastStore(s => s.remove);
  const cfg  = CONFIG[item.type];
  const Icon = cfg.icon;

  // Auto-dismiss
  useEffect(() => {
    if (!item.duration) return;
    const timer = setTimeout(() => remove(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, remove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,   scale: 1     }}
      exit={{    opacity: 0, y: -12, scale: 0.94  }}
      transition={{ type: "spring", damping: 24, stiffness: 320 }}
      onClick={() => remove(item.id)}
      role="alert"
      className="relative w-full overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{
        background: cfg.bgVar,
        border: `1px solid ${cfg.borderVar}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      {/* Contenido */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Icon className={cn("w-[18px] h-[18px] shrink-0", cfg.iconClass)} strokeWidth={2.2} />
        <p className="text-[13.5px] font-semibold text-foreground leading-snug flex-1">
          {item.message}
        </p>
      </div>

    </motion.div>
  );
}

// ─── Toaster — montar en layout ──────────────────────────────────────────────

export function Toaster() {
  const toasts = useToastStore(s => s.toasts);

  return (
    <div
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[200] flex flex-col items-center pointer-events-none"
      style={{ paddingTop: "env(safe-area-inset-top, 12px)" }}
    >
      <div className="w-full max-w-sm px-4 pt-3 flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <Toast key={t.id} item={t} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
