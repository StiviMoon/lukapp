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
      const billing = searchParams.get("billing");
      const q =
        billing === "yearly" || billing === "monthly"
          ? `?billing=${billing}`
          : "";
      router.push(`/upgrade${q}`);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pb-12 max-w-sm mx-auto" style={{ paddingTop: "max(64px, env(safe-area-inset-top, 64px))" }}>

      {/* Logo & Branding */}
      <div className="mb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-morado.png"
          alt="lukapp"
          className="mix-blend-multiply dark:hidden mb-3"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-verde.png"
          alt="lukapp"
          className="mix-blend-screen hidden dark:block mb-3"
          style={{ height: 52, width: "auto", objectFit: "contain" }}
        />
        <p className="text-[14px] text-muted-foreground leading-relaxed">
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
