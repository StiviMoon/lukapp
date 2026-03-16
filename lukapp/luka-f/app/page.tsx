"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  LayoutList,
  SlidersHorizontal,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const QUICK_ACTIONS = [
  { icon: Plus, label: "Gasto" },
  { icon: ArrowUpRight, label: "Ingreso" },
  { icon: LayoutList, label: "Historial" },
  { icon: SlidersHorizontal, label: "Ajustes" },
] as const;

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  useInactivityTimeout();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "tú";

  const avatarLetter = firstName.charAt(0).toUpperCase();

  return (
    <>
      <div className="min-h-dvh bg-background">
        <main className="px-5 pt-14 pb-40 max-w-sm mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm text-muted-foreground font-medium leading-none mb-1.5">
                {getGreeting()},
              </p>
              <h1 className="text-[26px] font-bold tracking-tight text-foreground capitalize leading-none">
                {firstName}
              </h1>
            </div>
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, #6600FF 12%, var(--card))" }}
            >
              <span className="text-sm font-bold text-[#6600FF]">
                {avatarLetter}
              </span>
            </div>
          </div>

          {/* Balance Card */}
          <div
            className="rounded-[28px] px-6 pt-7 pb-6 mb-5"
            style={{ background: "#6600FF" }}
          >
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase mb-2">
              Balance Total
            </p>
            <div className="flex items-end gap-1 mb-7">
              <span className="text-[46px] font-black tracking-tight text-white leading-none">
                $0
              </span>
              <span className="text-[28px] font-black text-white/40 leading-none mb-0.5">
                .00
              </span>
            </div>

            {/* Ingresos / Gastos sub-row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[9px] font-bold tracking-[0.1em] text-white/50 uppercase">
                    Ingresos
                  </span>
                </div>
                <p className="text-[15px] font-bold text-white">$0.00</p>
              </div>
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[9px] font-bold tracking-[0.1em] text-white/50 uppercase">
                    Gastos
                  </span>
                </div>
                <p className="text-[15px] font-bold text-white">$0.00</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-7">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3.5">
              Acciones
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-2.5 py-4 rounded-2xl bg-card hover:bg-muted/60 transition-colors duration-150 active:scale-95"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--background)" }}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground/50 leading-none">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                Recientes
              </h2>
              <button className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors duration-150">
                Ver todo
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-14 rounded-[24px] bg-card">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5"
                style={{ backgroundColor: "var(--background)" }}
              >
                <Clock className="w-5 h-5 text-muted-foreground/25" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground/40 mb-1">
                Sin movimientos
              </p>
              <p className="text-xs text-muted-foreground/25">
                Añade tu primer registro
              </p>
            </div>
          </div>

        </main>
      </div>
      <Navbar />
    </>
  );
}
