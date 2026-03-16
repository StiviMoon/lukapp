"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

      toast.success("¡Bienvenido de vuelta!");
      onSuccess?.();
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          className="w-full h-11 rounded-xl font-medium text-sm text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#6600FF" }}
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
  );
};

