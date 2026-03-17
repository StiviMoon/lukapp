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

const signupSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm = ({ onSuccess, onSwitchToLogin }: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (authData.user && !authData.session) {
        toast.success("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
      } else {
        toast.success("¡Bienvenido a Lukapp!");
        onSuccess?.();
      }
    } catch {
      toast.error("Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Nombre <span className="font-normal text-[0.65rem]">(opcional)</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Tu nombre completo"
          {...register("fullName")}
          disabled={isLoading}
          className="auth-input border-0 border-b-2 rounded-none bg-transparent px-2 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/40 transition-colors duration-150"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive pt-1.5 pl-0.5">
            {errors.fullName.message}
          </p>
        )}
      </div>

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
          placeholder="Mínimo 6 caracteres"
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

      <div className="space-y-2.5">
        <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Confirmar contraseña
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repite tu contraseña"
          {...register("confirmPassword")}
          disabled={isLoading}
          className="auth-input border-0 border-b-2 rounded-none bg-transparent px-2 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/40 transition-colors duration-150"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive pt-1.5 pl-0.5">
            {errors.confirmPassword.message}
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
              Creando...
            </>
          ) : (
            "Registrarse"
          )}
        </Button>
      </div>
    </form>
  );
};

