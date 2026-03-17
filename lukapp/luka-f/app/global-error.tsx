"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-dvh bg-background">
        <div className="min-h-dvh flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
              Error crítico
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">
              La app tuvo un problema
            </h1>
            <p className="mt-2 text-sm text-muted-foreground/70 leading-relaxed">
              Intenta reintentar o recargar. Esto evita que la app quede en blanco si ocurre una excepción.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.99] transition-transform"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="h-11 px-4 rounded-2xl border border-border/50 text-sm font-semibold text-foreground/80 hover:bg-muted/40 transition-colors"
              >
                Recargar
              </button>
            </div>

            {error?.digest ? (
              <p className="mt-4 text-[11px] text-muted-foreground/45">
                Código: <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  );
}

