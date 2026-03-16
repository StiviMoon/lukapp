import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Crea un cliente de Supabase
 */
export const createSupabaseClient = (accessToken?: string): SupabaseClient => {
  const url = process.env.SUPABASE_URL!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;

  if (!url || !anonKey) {
    throw new Error("Supabase URL y ANON KEY deben estar configuradas");
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Si hay un token de acceso, configurarlo
  if (accessToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: "",
    } as any);
  }

  return client;
};

