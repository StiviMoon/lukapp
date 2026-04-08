"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Datos frescos durante 5 minutos → al navegar de vuelta no se refetcha
            staleTime: 5 * 60_000,
            // Mantener caché 15 minutos en memoria → sin skeleton al volver a una pantalla
            gcTime: 15 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
            // No refetch al reconectar (el usuario navega, no recarga)
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
