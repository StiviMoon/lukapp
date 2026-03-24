"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const links = [
  { label: "Features", href: "#features" },
  { label: "Planes", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const LogoMark = ({ size = 14 }: { size?: number }) => (
  <div className="flex gap-[2px]">
    <div
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      className="bg-lime"
    />
    <div
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      className="bg-purple-bright"
    />
  </div>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 100);
  }, []);

  // Un solo tema en todo el app: al hacer clic cambiamos entre claro y oscuro (resolvedTheme = lo que se ve, incl. system)
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ─── DESKTOP: floating pill (centrada), animación rápida ─── */}
      <div className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <motion.nav
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex items-center justify-center gap-1 px-2 py-2 rounded-full bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl shadow-nav border border-fg/10 dark:border-white/10"
        >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-fg/[0.06] transition-colors duration-200"
        >
          <LogoMark size={13} />
          <span className="font-display font-bold text-[15px] tracking-tight text-fg">
            lukapp
          </span>
        </button>

        <div className="w-px h-4 bg-fg/10 dark:bg-white/10 mx-1" />

        {links.map((l) => (
          <button
            key={l.href}
            onClick={() => go(l.href)}
            className="px-5 py-2 text-[13px] font-medium text-fg/60 hover:text-fg rounded-full hover:bg-fg/[0.06] transition-colors duration-200"
          >
            {l.label}
          </button>
        ))}

        <div className="w-px h-4 bg-fg/10 dark:bg-white/10 mx-1" />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-fg/8 transition-colors duration-200"
          aria-label={mounted ? (resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro") : "Tema"}
        >
          {!mounted ? <Sun size={16} className="text-fg" /> : resolvedTheme === "dark" ? <Sun size={16} className="text-fg" /> : <Moon size={16} className="text-fg" />}
        </button>

        <button
          onClick={() => router.push("/auth?action=register")}
          className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-bg bg-lime rounded-full hover:bg-lime-dark transition-colors duration-200"
        >
          <Sparkles size={14} strokeWidth={2.5} />
          Empezar gratis
        </button>
        </motion.nav>
      </div>

      {/* ─── MOBILE: pill sólida, hamburguesa con fondo visible, animación rápida ─── */}
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 md:hidden pointer-events-none">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex items-center justify-between gap-2 w-full max-w-[420px] px-3 py-2.5 rounded-full bg-white dark:bg-[#0a0a0a] shadow-nav border border-fg/10 dark:border-white/10"
        >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 py-1 shrink-0"
        >
          <LogoMark size={12} />
          <span className="font-display font-bold text-[14px] tracking-tight text-fg">
            lukapp
          </span>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-fg/8 dark:bg-white/10 hover:bg-fg/12 dark:hover:bg-white/15 text-fg transition-colors duration-150"
            aria-label={mounted ? (resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro") : "Tema"}
          >
            {!mounted ? <Sun size={15} /> : resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => router.push("/auth?action=register")}
            className="px-3 py-1.5 text-[12px] font-bold text-bg bg-lime rounded-full hover:bg-lime-dark transition-colors duration-150"
          >
            Entrar
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150",
              open
                ? "bg-lime text-bg"
                : "bg-fg/12 dark:bg-white/12 hover:bg-fg/18 dark:hover:bg-white/18 text-fg"
            )}
            aria-label="Menú"
          >
            {open ? <X size={16} strokeWidth={2.5} /> : <Menu size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </motion.div>
      </div>

      {/* ─── MOBILE: dropdown con fondo sólido (nunca transparente), animaciones rápidas ─── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-40 bg-black/35 md:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-50 pt-[68px] px-4 pb-4 md:hidden flex justify-center items-start pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-[280px] rounded-2xl overflow-hidden bg-white dark:bg-[#0f0f0f] border border-border dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)] py-2"
              >
                {links.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => go(l.href)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium text-fg/80 hover:text-fg hover:bg-fg/6 active:bg-fg/8 transition-colors duration-150"
                  >
                    {l.label}
                  </button>
                ))}
                <div className="border-t border-border dark:border-white/10 my-2 mx-3" />
                <div className="px-3 pb-2">
                  <button
                    onClick={() => router.push("/auth?action=register")}
                    className="w-full py-3.5 rounded-xl bg-lime text-bg font-bold text-[14px] text-center hover:bg-lime-dark transition-colors duration-150"
                  >
                    Empezar gratis →
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
