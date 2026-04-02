"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun, ChevronRight, Mail, User, Tag, Settings2, Users, Crown, Zap } from "lucide-react";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useTheme } from "next-themes";
import { usePlan } from "@/lib/hooks/use-plan";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="px-5 pt-14 pb-40 max-w-sm mx-auto">
      {/* Header */}
      <div className="w-16 h-7 rounded-xl bg-muted-foreground/10 animate-pulse mb-10" />
      {/* Avatar */}
      <div className="flex flex-col items-center mb-10 gap-3">
        <div className="w-20 h-20 rounded-3xl bg-muted-foreground/10 animate-pulse" />
        <div className="w-28 h-5 rounded-lg bg-muted-foreground/10 animate-pulse" />
        <div className="w-40 h-3.5 rounded-lg bg-muted-foreground/10 animate-pulse" />
      </div>
      {/* Cuenta */}
      <div className="mb-5">
        <div className="w-14 h-3 rounded bg-muted-foreground/10 animate-pulse mb-3 ml-1" />
        <div className="rounded-2xl bg-card overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border/20 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-muted-foreground/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-12 rounded bg-muted-foreground/10 animate-pulse" />
                <div className="h-3.5 w-32 rounded bg-muted-foreground/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Preferencias */}
      <div>
        <div className="w-20 h-3 rounded bg-muted-foreground/10 animate-pulse mb-3 ml-1" />
        <div className="rounded-2xl bg-card overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border/20 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-muted-foreground/10 animate-pulse shrink-0" />
              <div className="h-3.5 w-24 rounded bg-muted-foreground/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const { show: showOverlay, hide: hideOverlay } = useLoadingOverlay();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { plan, isPremium } = usePlan();
  useInactivityTimeout();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  const showSkeleton = useMinDelay(loading);

  if (!showSkeleton && !isAuthenticated) return null;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuario";
  const fullName = user?.user_metadata?.full_name || firstName;
  const email = user?.email || "";
  const avatarLetter = firstName.charAt(0);

  const handleSignOut = async () => {
    showOverlay("Cerrando sesión…", "Hasta pronto.");
    await signOut();
    router.push("/auth");
    setTimeout(() => hideOverlay(), 400);
  };

  return (
    <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

      {/* ═══ HEADER FIJO ═══ */}
      <div className="flex-none px-5 pt-12 pb-3">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-none font-display">
          Perfil
        </h1>
      </div>

      {/* ═══ CONTENIDO SCROLLEABLE ═══ */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-app-scroll">
        {showSkeleton ? (
          <ProfileSkeleton />
        ) : (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-10 max-w-sm mx-auto"
          >

            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-10 mt-4">
              <UserAvatar letter={avatarLetter} size="lg" className="mb-4" />
              <p className="text-xl font-bold text-foreground capitalize tracking-tight">
                {fullName}
              </p>
              <p className="text-sm text-muted-foreground/50 mt-1 mb-3">{email}</p>
              {/* Plan badge */}
              <button
                onClick={() => router.push("/upgrade")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                  isPremium
                    ? "bg-purple-brand/15 text-purple-muted border border-purple-brand/25"
                    : "bg-card border border-border text-muted-foreground/60 hover:border-primary/30"
                }`}
              >
                {isPremium ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {isPremium ? "Premium ✦" : "Plan Gratuito"}
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            </div>

            {/* Info Section */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
                Cuenta
              </p>
              <div className="rounded-2xl bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide mb-0.5">
                      Nombre
                    </p>
                    <p className="text-sm font-medium text-foreground truncate capitalize">
                      {fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
                Preferencias
              </p>
              <div className="rounded-2xl bg-card overflow-hidden">
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-3 px-4 py-4 border-b border-border/30 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    {resolvedTheme === "dark" ? (
                      <Sun className="w-4 h-4 text-muted-foreground/50" />
                    ) : (
                      <Moon className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Actualmente en modo {resolvedTheme === "dark" ? "oscuro" : "claro"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
                </button>
                <button
                  onClick={() => router.push("/categories")}
                  className="w-full flex items-center gap-3 px-4 py-4 border-b border-border/30 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <Tag className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Categorías</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Gestiona categorías y presupuestos
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full flex items-center gap-3 px-4 py-4 border-b border-border/30 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Ajustes</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Cuentas y configuración
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
                </button>
                <button
                  onClick={() => router.push("/friends")}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <Users className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Panas</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Gastos compartidos · próximamente
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    Pronto
                  </span>
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
                Sesión
              </p>
              <div className="rounded-2xl bg-card overflow-hidden">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-destructive/60" />
                  </div>
                  <p className="flex-1 text-left text-sm font-semibold text-destructive/80">
                    Cerrar sesión
                  </p>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/25 text-center mt-4">
                La sesión se cierra automáticamente tras 30 min de inactividad
              </p>
            </div>

          </motion.main>
        )}
      </div>
    </div>
  );
}
