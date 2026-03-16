"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-16 pb-12 max-w-sm mx-auto">

      {/* Logo & Branding */}
      <div className="mb-16">
        <span className="text-5xl font-black text-brand-purple leading-none">L</span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mt-4">
          Lukapp
        </h1>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
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
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple transition-all duration-200" />
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
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple transition-all duration-200" />
          )}
        </button>
      </div>

      {/* Form - Clean swap */}
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

