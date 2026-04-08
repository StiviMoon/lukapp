"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  // Auto-recarga cuando el browser detecta que volvió la conexión
  useEffect(() => {
    const handleOnline = () => {
      setRetrying(true);
      window.location.reload();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    window.location.reload();
  };

  return (
    <div className="min-h-dvh bg-transparent flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-brand/10 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-purple-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.111 8.111A7.5 7.5 0 0118.01 17.89M1.5 8.25a11.25 11.25 0 0121 0M5.25 11.25a7.5 7.5 0 019.495-1.005M12 20.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-[22px] font-bold text-foreground mb-2">Sin conexión</h1>
      <p className="text-[14px] text-muted-foreground mb-8 max-w-[260px] leading-relaxed">
        Revisa tu conexión a internet. La app se reconectará automáticamente.
      </p>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="px-6 py-3 bg-purple-brand text-white font-semibold text-[14px] rounded-2xl transition-all duration-75 active:scale-[0.97] disabled:opacity-60"
      >
        {retrying ? "Reconectando…" : "Reintentar"}
      </button>
    </div>
  );
}
