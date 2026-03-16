"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useInactivityTimeout } from "@/lib/hooks/use-inactivity-timeout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, LogOut, Moon, Sun, ChevronRight, Mail, User } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    "Usuario";
  const fullName = user?.user_metadata?.full_name || firstName;
  const email = user?.email || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <>
      <div className="min-h-dvh bg-background">
        <main className="px-5 pt-14 pb-40 max-w-sm mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-none">
              Perfil
            </h1>
          </div>

          {/* Avatar & Name */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "color-mix(in srgb, #6600FF 15%, var(--card))" }}
            >
              <span className="text-3xl font-black text-[#6600FF]">
                {avatarLetter}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground capitalize tracking-tight">
              {fullName}
            </p>
            <p className="text-sm text-muted-foreground/50 mt-1">{email}</p>
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

          {/* Preferences */}
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-3">
              Preferencias
            </p>
            <div className="rounded-2xl bg-card overflow-hidden">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors duration-150 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-muted-foreground/50" />
                  ) : (
                    <Moon className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">
                    {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                  </p>
                  <p className="text-xs text-muted-foreground/40 mt-0.5">
                    Actualmente en modo {theme === "dark" ? "oscuro" : "claro"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/25" />
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

        </main>
      </div>
      <Navbar />
    </>
  );
}
