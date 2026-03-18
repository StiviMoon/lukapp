"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";

const SHOW_ON = ["/dashboard", "/history", "/analytics", "/settings", "/profile", "/categories", "/friends"];
const PREFETCH_ROUTES = ["/dashboard", "/history", "/analytics", "/settings", "/profile", "/friends"];

export function Navbar() {
  const pathname      = usePathname();
  const router        = useRouter();
  const { openVoice } = useVoiceStore();

  useEffect(() => {
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

        {/* ── FAB principal — Voz ── */}
        <div className="mx-3">
          <button
            onClick={openVoice}
            type="button"
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center bg-primary",
              "transition-transform duration-150 active:scale-[0.96]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            style={{
              boxShadow:
                "0 4px 18px color-mix(in srgb, var(--primary) 52%, transparent), 0 0 0 5px color-mix(in srgb, var(--primary) 12%, transparent)",
            }}
            aria-label="Registrar por voz"
          >
            <Mic className="h-5 w-5 text-white" strokeWidth={2.2} />
          </button>
        </div>

        {/* Historial */}
        <NavLink href="/history" icon={History} label="Historial" pathname={pathname} prefetch={() => router.prefetch("/history")} />
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
