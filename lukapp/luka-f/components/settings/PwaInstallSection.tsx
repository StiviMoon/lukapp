"use client";

import { useState } from "react";
import { Download, Share, Plus, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePwaInstallPrompt } from "@/lib/hooks/use-pwa-install";

function StepRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-background/60">
        {icon}
      </div>
      <p className="text-[13px] text-foreground leading-snug pt-1">{children}</p>
    </div>
  );
}

export function PwaInstallSection() {
  const { isStandalone, platform, canUseNativePrompt, promptInstall, recheckStandalone } =
    usePwaInstallPrompt();
  const [iosExpanded, setIosExpanded] = useState(false);

  if (isStandalone) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-lime/10 border border-lime/25 px-3 py-3">
          <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">Lukapp está instalada</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              La abres como una app desde tu pantalla de inicio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Lukapp es una <span className="font-semibold text-foreground/90">app web</span> que puedes
        instalar para abrirla en pantalla completa, más rápido y con mejor acceso offline.
      </p>

      {/* Android / escritorio Chrome: prompt nativo */}
      {canUseNativePrompt && (platform === "android" || platform === "desktop") && (
        <button
          type="button"
          onClick={async () => {
            await promptInstall();
            recheckStandalone();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-brand text-white font-bold text-[14px] active:scale-[0.98] transition-transform"
        >
          <Download className="w-4 h-4" />
          {platform === "android" ? "Instalar en este dispositivo" : "Instalar en el ordenador"}
        </button>
      )}

      {/* Android sin prompt (otro navegador o criterios del sistema) */}
      {platform === "android" && !canUseNativePrompt && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Desde Android
          </p>
          <StepRow icon={<Smartphone className="w-4 h-4 text-primary" />}>
            Abre <span className="font-semibold">lukapp</span> en{" "}
            <span className="font-semibold">Google Chrome</span> (recomendado).
          </StepRow>
          <StepRow icon={<span className="text-lg leading-none">⋮</span>}>
            Toca el menú <span className="font-semibold">⋮</span> arriba a la derecha y elige{" "}
            <span className="font-semibold">Instalar app</span> o{" "}
            <span className="font-semibold">Añadir a la pantalla de inicio</span>.
          </StepRow>
        </div>
      )}

      {/* iOS */}
      {platform === "ios" && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Desde iPhone o iPad
          </p>
          {!iosExpanded ? (
            <button
              type="button"
              onClick={() => setIosExpanded(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-brand text-white font-bold text-[14px] active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
              Cómo añadir a inicio
            </button>
          ) : (
            <div className="space-y-2">
              <StepRow icon={<Share className="w-4 h-4 text-brand-blue" />}>
                En <span className="font-semibold">Safari</span>, toca el botón{" "}
                <span className="font-semibold">Compartir</span>
                <span className="whitespace-nowrap"> (cuadrado con flecha)</span>.
              </StepRow>
              <StepRow icon={<Plus className="w-4 h-4 text-purple-brand" />}>
                Baja y elige <span className="font-semibold">Añadir a inicio</span> y confirma.
              </StepRow>
            </div>
          )}
        </div>
      )}

      {/* Escritorio sin prompt */}
      {platform === "desktop" && !canUseNativePrompt && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            En ordenador (Chrome)
          </p>
          <StepRow icon={<Download className="w-4 h-4 text-primary" />}>
            Mira a la derecha de la barra de direcciones: si aparece el icono de{" "}
            <span className="font-semibold">instalar</span> (⊕ o monitor con flecha), haz clic y
            confirma.
          </StepRow>
        </div>
      )}

      {/* Genérico */}
      {platform === "other" && !canUseNativePrompt && (
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Usa <span className="font-semibold text-foreground/90">Chrome</span> en móvil o
          escritorio y busca la opción del menú para instalar o añadir a inicio. En{" "}
          <span className="font-semibold text-foreground/90">Safari en iOS</span>, usa Compartir →
          Añadir a inicio.
        </p>
      )}

      <p className={cn("text-[10px] text-muted-foreground/45 leading-snug pt-1")}>
        Si no ves “Instalar”, el navegador aún no ofrece la PWA; prueba Chrome actualizado o vuelve
        más tarde.
      </p>
    </div>
  );
}
