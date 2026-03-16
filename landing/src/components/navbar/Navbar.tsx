"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ─── DESKTOP: floating pill (centrada) ─── */}
      <div className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-auto flex items-center justify-center gap-1 px-2 py-2 rounded-full transition-all duration-500",
            scrolled
              ? "bg-white/90 dark:bg-[rgba(10,10,10,0.88)] backdrop-blur-2xl shadow-nav border border-fg/10 dark:border-white/10"
              : "bg-white/70 dark:bg-[rgba(10,10,10,0.55)] backdrop-blur-xl border border-fg/[0.08] dark:border-white/[0.07]"
          )}
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
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-fg/[0.08] transition-colors duration-200"
          aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? <Sun size={16} className="text-fg" /> : <Moon size={16} className="text-fg" />}
        </button>

        <button
          onClick={() => go("#waitlist")}
          className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-bg bg-lime rounded-full hover:bg-lime-dark transition-colors duration-200"
        >
          <Sparkles size={14} strokeWidth={2.5} />
          Únete
        </button>
        </motion.nav>
      </div>

      {/* ─── MOBILE: pill centrada ─── */}
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 md:hidden pointer-events-none">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-2 w-full max-w-[420px] px-3 py-2 rounded-full transition-all duration-500",
            scrolled
              ? "bg-white/90 dark:bg-[rgba(10,10,10,0.92)] backdrop-blur-2xl shadow-nav border border-fg/10 dark:border-white/10"
              : "bg-white/70 dark:bg-[rgba(10,10,10,0.65)] backdrop-blur-xl border border-fg/[0.08] dark:border-white/[0.07]"
          )}
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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-full hover:bg-fg/[0.08]"
            aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <Sun size={15} className="text-fg" /> : <Moon size={15} className="text-fg" />}
          </button>
          <button
            onClick={() => go("#waitlist")}
            className="px-3 py-1.5 text-[12px] font-bold text-bg bg-lime rounded-full hover:bg-lime-dark transition-colors duration-200"
          >
            Únete
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
              open
                ? "bg-lime text-bg"
                : "bg-fg/[0.08] dark:bg-white/[0.07] text-fg"
            )}
            aria-label="Menú"
          >
            {open ? <X size={15} strokeWidth={2.5} /> : <Menu size={15} strokeWidth={2.5} />}
          </button>
        </div>
      </motion.div>
      </div>

      {/* ─── MOBILE: dropdown menu (centrado, fondo sólido) ─── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Contenedor centrado */}
            <div className="fixed inset-0 z-50 pt-[72px] px-4 pb-4 md:hidden flex justify-center items-start pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-[280px] rounded-2xl overflow-hidden bg-bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2"
              >
                {links.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => go(l.href)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium text-fg/80 hover:text-fg hover:bg-fg/[0.06] active:bg-fg/[0.08] transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
                <div className="border-t border-border my-2 mx-3" />
                <div className="px-3 pb-2">
                  <button
                    onClick={() => go("#waitlist")}
                    className="w-full py-3.5 rounded-xl bg-lime text-bg font-bold text-[14px] text-center hover:bg-lime-dark transition-colors"
                  >
                    Unirme a la lista →
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
