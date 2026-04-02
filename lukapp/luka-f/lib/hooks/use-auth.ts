"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Hook de autenticación con sesión optimista.
 *
 * En lugar de empezar con loading=true (que provoca un flash de pantalla completa
 * cada vez que el usuario navega al dashboard), intentamos leer la sesión del
 * localStorage de Supabase de forma síncrona antes del primer render.
 *
 * Si hay una sesión guardada → loading arranca en false y user ya tiene valor.
 * Si no hay sesión → loading arranca en true hasta que getUser() resuelve.
 */
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    // Supabase SSR guarda la sesión en localStorage con esta clave
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.includes("auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const u = parsed?.user ?? parsed?.currentSession?.user ?? null;
      if (u?.id) return u as User;
    }
  } catch {
    // localStorage no disponible o JSON inválido
  }
  return null;
}

export const useAuth = () => {
  const storedUser = useRef(getStoredUser());

  const [user, setUser] = useState<User | null>(storedUser.current);
  // Si ya tenemos usuario en storage, no mostramos loading inicial
  const [loading, setLoading] = useState(storedUser.current === null);

  const supabase = createClient();

  useEffect(() => {
    // Verificación real en background (no bloquea la UI si ya hay sesión)
    supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
      setUser(freshUser);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
