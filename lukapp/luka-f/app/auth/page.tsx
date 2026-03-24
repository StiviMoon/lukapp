"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { toast } from "@/lib/toast";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Si viene con ?action=register → abrir tab de registro
  const [isLogin, setIsLogin] = useState(
    searchParams.get("action") !== "register"
  );

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "callback") {
      toast.error("No se pudo completar el inicio de sesión con Google. Intenta de nuevo.");
    } else if (error === "missing_code") {
      toast.error("Faltó el código de autorización. Intenta iniciar sesión con Google de nuevo.");
    }
  }, [searchParams]);

  const handleSuccess = () => {
    // Si viene con ?plan=premium → ir a /upgrade después del login
    const plan = searchParams.get("plan");
    if (plan === "premium") {
      router.push("/upgrade");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-16 pb-12 max-w-sm mx-auto">

      {/* Logo & Branding */}
      <div className="mb-16">
        <div className="relative inline-flex items-start mb-4">
          <span className="text-5xl font-black text-primary leading-none font-display">L</span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-lime mt-1 ml-0.5 flex-shrink-0" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-display">
          Lukapp
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Tus finanzas. Claras.
        </p>
      </div>

      {/* Tab Switcher - Minimal */}
      <div className="flex gap-12 items-end mb-14 border-b border-border/50">
        <button
          onClick={() => setIsLogin(true)}
          className={`pb-3 text-sm font-medium transition-colors duration-150 relative ${
            isLogin
              ? "text-foreground font-semibold"
              : "text-muted-foreground/50"
          }`}
        >
          Entrar
          {isLogin && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200" />
          )}
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`pb-3 text-sm font-medium transition-colors duration-150 relative ${
            !isLogin
              ? "text-foreground font-semibold"
              : "text-muted-foreground/50"
          }`}
        >
          Registrarse
          {!isLogin && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200" />
          )}
        </button>
      </div>

      {/* Form */}
      <div className="flex-1">
        {isLogin ? (
          <LoginForm
            key="login"
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm
            key="signup"
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Al continuar, aceptas nuestros{" "}
          <span className="font-medium text-muted-foreground/80">
            términos
          </span>
        </p>
      </div>
    </div>
  );
}
