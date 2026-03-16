"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Gradient fade above nav */}
      <div
        className="h-12 w-full"
        style={{
          background:
            "linear-gradient(to top, var(--background) 0%, transparent 100%)",
        }}
      />

      <nav
        className="pointer-events-auto border-t px-8 pt-3 pb-8"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "color-mix(in srgb, var(--border) 40%, transparent)",
        }}
      >
        <div className="flex items-end justify-between max-w-sm mx-auto">

          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1.5 min-w-[56px] py-1"
          >
            <Home
              className={cn(
                "w-[22px] h-[22px] transition-colors duration-150",
                pathname === "/" ? "text-[#6600FF]" : "text-muted-foreground/40"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-semibold tracking-wide transition-colors duration-150",
                pathname === "/" ? "text-[#6600FF]" : "text-muted-foreground/30"
              )}
            >
              Inicio
            </span>
          </Link>

          {/* Voice FAB — floats above bar */}
          <div className="relative flex flex-col items-center -mt-10">
            {/* Ping rings when listening */}
            {isListening && (
              <>
                <span
                  className="absolute rounded-full bg-[#6600FF]/25 animate-ping"
                  style={{ inset: "-4px", bottom: "28px" }}
                />
                <span
                  className="absolute rounded-full bg-[#6600FF]/15 animate-ping"
                  style={{ inset: "-10px", bottom: "22px", animationDelay: "0.25s" }}
                />
              </>
            )}

            <button
              onClick={() => setIsListening((prev) => !prev)}
              className={cn(
                "relative w-[58px] h-[58px] rounded-full flex items-center justify-center transition-all duration-200",
                isListening ? "scale-110" : "hover:scale-105 active:scale-95"
              )}
              style={{
                background: "#6600FF",
                boxShadow: isListening
                  ? "0 0 0 6px rgba(102,0,255,0.18), 0 8px 28px rgba(102,0,255,0.5)"
                  : "0 4px 20px rgba(102,0,255,0.38)",
              }}
              aria-label={isListening ? "Detener escucha" : "Hablar con Luka"}
            >
              <Mic
                className={cn(
                  "w-[22px] h-[22px] text-white transition-all duration-200",
                  isListening && "animate-pulse"
                )}
              />
            </button>

            <span
              className={cn(
                "mt-2 text-[10px] font-semibold tracking-wide transition-colors duration-200",
                isListening ? "text-[#6600FF]" : "text-muted-foreground/30"
              )}
            >
              {isListening ? "Escuchando" : "Hablar"}
            </span>
          </div>

          {/* Profile */}
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1.5 min-w-[56px] py-1"
          >
            <User
              className={cn(
                "w-[22px] h-[22px] transition-colors duration-150",
                pathname === "/profile"
                  ? "text-[#6600FF]"
                  : "text-muted-foreground/40"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-semibold tracking-wide transition-colors duration-150",
                pathname === "/profile"
                  ? "text-[#6600FF]"
                  : "text-muted-foreground/30"
              )}
            >
              Perfil
            </span>
          </Link>

        </div>
      </nav>
    </div>
  );
}
