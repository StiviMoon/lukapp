"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitch?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToSignup }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { show: showOverlay, hide: hideOverlay } = useLoadingOverlay();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      showOverlay("Iniciando sesión...");
      onSuccess?.();
    } catch {
      toast.error("Error al iniciar sesión");
      hideOverlay();
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      // Redirección la hace Supabase; no llamar onSuccess aquí.
    } catch {
      toast.error("Error al conectar con Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={signInWithGoogle}
        className="w-full h-11 rounded-xl font-medium text-sm cursor-pointer border-border/60 bg-background text-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/30 transition-colors"
      >
        <GoogleIcon className="mr-2 h-5 w-5" />
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-background px-3 text-muted-foreground/50">o con email</span>
        </div>
      </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2.5">
        <Label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          {...register("email")}
          disabled={isLoading}
          className="auth-input border-0 border-b-2 rounded-none bg-transparent px-2 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/40 transition-colors duration-150"
        />
        {errors.email && (
          <p className="text-xs text-destructive pt-1.5 pl-0.5">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="password" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          {...register("password")}
          disabled={isLoading}
          className="auth-input border-0 border-b-2 rounded-none bg-transparent px-2 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/40 transition-colors duration-150"
        />
        {errors.password && (
          <p className="text-xs text-destructive pt-1.5 pl-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity duration-150 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </div>
    </form>
    </div>
  );
};

