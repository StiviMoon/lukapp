"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, Mic, BarChart2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";
import { useAddTransactionStore } from "@/lib/store/add-transaction-store";

const SHOW_ON = ["/dashboard", "/history", "/analytics", "/settings", "/profile"];
const PREFETCH_ROUTES = ["/dashboard", "/history", "/analytics", "/settings", "/profile"];

export function Navbar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const { openVoice }         = useVoiceStore();
  const { open: openAdd }     = useAddTransactionStore();

  useEffect(() => {
    // Prefetch de rutas principales para navegación "instantánea" en móvil.
    for (const href of PREFETCH_ROUTES) router.prefetch(href);
  }, [router]);

  if (!SHOW_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-3 px-4">
      <nav
        aria-label="Navegación principal"
        className="pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5"
        style={{
          background: "color-mix(in srgb, var(--card) 82%, transparent)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          border: "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
          boxShadow: "0 6px 22px rgba(0,0,0,0.18), 0 1px 0 color-mix(in srgb, var(--border) 18%, transparent) inset",
        }}
      >
        {/* Inicio */}
        <NavLink href="/dashboard" icon={Home} label="Inicio" pathname={pathname} prefetch={() => router.prefetch("/dashboard")} />

        {/* Historial */}
        <NavLink href="/history" icon={History} label="Historial" pathname={pathname} prefetch={() => router.prefetch("/history")} />

        {/* ── FAB principal — Voz ── */}
        <div className="mx-1.5">
          <button
            onClick={openVoice}
            type="button"
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center bg-primary",
              "transition-transform duration-150 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            style={{
              boxShadow:
                "0 4px 16px color-mix(in srgb, var(--primary) 48%, transparent), 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent)",
            }}
            aria-label="Registrar por voz"
          >
            <Mic className="h-5 w-5 text-white" strokeWidth={2.2} />
          </button>
        </div>

        {/* ── Botón secundario — Registro manual ── */}
        <button
          onClick={() => openAdd("EXPENSE")}
          type="button"
          className={cn(
            "relative flex flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5",
            "text-muted-foreground/55 hover:text-muted-foreground/85",
            "transition-colors duration-150 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Registrar movimiento"
        >
          <div className="h-[18px] w-[18px] flex items-center justify-center">
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <span className="text-[9px] font-semibold tracking-wide leading-none">Manual</span>
        </button>

        {/* Analíticas */}
        <NavLink href="/analytics" icon={BarChart2} label="Analíticas" pathname={pathname} prefetch={() => router.prefetch("/analytics")} />
      </nav>
    </div>
  );
}

// ─── NavLink ────────────────────────────────────────────────────────────────

function NavLink({
  href, icon: Icon, label, pathname, prefetch,
}: {
  href: string; icon: React.ElementType; label: string; pathname: string; prefetch: () => void;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      prefetch
      onPointerEnter={prefetch}
      onFocus={prefetch}
      className={cn(
        "relative flex flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5",
        "transition-colors duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/30",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2.0} />
      <span className="text-[9px] font-semibold tracking-wide leading-none">{label}</span>
    </Link>
  );
}
