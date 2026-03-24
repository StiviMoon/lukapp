"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, Mic, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/lib/store/voice-store";
import { haptics } from "@/lib/haptics";

const SHOW_ON = ["/dashboard", "/history", "/analytics", "/settings", "/profile", "/categories", "/friends"];
const PREFETCH_ROUTES = ["/dashboard", "/history", "/analytics", "/settings"];

export function Navbar() {
  const pathname      = usePathname();
  const router        = useRouter();
  const { openVoice } = useVoiceStore();

  useEffect(() => {
    for (const href of PREFETCH_ROUTES) router.prefetch(href);
  }, [router]);

  if (!SHOW_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-4 px-4">
      <div className="pointer-events-auto relative">
        {/* ── Nav pill ─────────────────────────────────────────────── */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-0.5 rounded-full px-2.5 py-[7px]"
          style={{
            background: "color-mix(in srgb, var(--card) 88%, transparent)",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            border: "1px solid color-mix(in srgb, var(--border) 35%, transparent)",
            boxShadow:
              "0 8px 28px rgba(0,0,0,0.20), 0 1px 0 color-mix(in srgb, var(--border) 22%, transparent) inset",
          }}
        >
          <NavLink href="/dashboard"  icon={Home}      label="Inicio"    pathname={pathname} prefetch={() => router.prefetch("/dashboard")} />
          <NavLink href="/history"    icon={History}   label="Historial" pathname={pathname} prefetch={() => router.prefetch("/history")} />

          {/* ── FAB central — sobresale hacia arriba ─────────────── */}
          <div className="mx-2.5 -translate-y-[14px] flex flex-col items-center">
            <button
              onClick={openVoice}
              type="button"
              className={cn(
                "h-[58px] w-[58px] rounded-full flex items-center justify-center bg-primary",
                "transition-transform duration-150 active:scale-[0.93]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              style={{
                boxShadow:
                  "0 8px 26px color-mix(in srgb, var(--primary) 62%, transparent), 0 0 0 7px color-mix(in srgb, var(--primary) 13%, transparent)",
              }}
              aria-label="Registrar por voz"
            >
              <Mic className="h-6 w-6 text-white" strokeWidth={2.1} />
            </button>
          </div>

          <NavLink href="/friends"    icon={Users}     label="Amigos"    pathname={pathname} prefetch={() => router.prefetch("/friends")} />
          <NavLink href="/analytics"  icon={BarChart3} label="Análisis"  pathname={pathname} prefetch={() => router.prefetch("/analytics")} />
        </nav>
      </div>
    </div>
  );
}

// ─── NavLink ────────────────────────────────────────────────────────────────

function NavLink({
  href, icon: Icon, label, pathname, prefetch,
}: {
  href: string; icon: React.ElementType; label: string; pathname: string; prefetch: () => void;
}) {
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      prefetch
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onClick={() => haptics.light()}
      className={cn(
        "relative flex flex-col items-center gap-[3px] rounded-full px-3 py-2",
        "transition-colors duration-150 active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "text-primary"
          : "text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/30",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-primary/10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon className="h-[19px] w-[19px] relative z-10" strokeWidth={active ? 2.4 : 1.9} />
      <span className="text-[9px] font-semibold tracking-wide leading-none relative z-10">{label}</span>
    </Link>
  );
}
