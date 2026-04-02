"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Spinner estilo indicador de actividad iOS (aro fino). */
export function IosActivityIndicator({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-5 w-5 border-[2px]" : size === "lg" ? "h-12 w-12 border-[3px]" : "h-9 w-9 border-[2.5px]";
  return (
    <div
      className={cn(
        "rounded-full border-primary/20 border-t-primary animate-spin motion-reduce:animate-none",
        dim,
        className
      )}
      aria-hidden
    />
  );
}

const cardSpring = { type: "spring" as const, damping: 28, stiffness: 380 };

/** Tarjeta centrada: título SF-like + subtítulo opcional (mismo patrón en overlay y pantallas). */
export function IosLoadingCard({
  title,
  subtitle,
  className,
  titleId,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  /** Para `aria-labelledby` del overlay global. */
  titleId?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 6 }}
      transition={cardSpring}
      className={cn(
        "w-full max-w-[300px] rounded-[22px] border border-border/50 bg-card/90 px-8 py-10 text-center shadow-[0_25px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-2xl supports-backdrop-filter:bg-card/72 dark:shadow-[0_28px_90px_-18px_rgba(0,0,0,0.75)]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center">
        <IosActivityIndicator size="md" className="mb-6" />
        <p
          id={titleId}
          className="text-[17px] font-semibold leading-snug tracking-tight text-foreground"
        >
          {title}
        </p>
        {subtitle ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

/** Contenido compacto (p. ej. dentro de un bottom sheet) con la misma tipografía que el modal global. */
export function IosLoadingInline({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-5 py-8 px-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <IosActivityIndicator size="md" />
      <div className="text-center">
        <p className="text-[17px] font-semibold leading-snug text-foreground">{title}</p>
        {subtitle ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Pantalla completa de carga (rutas, dashboard inicial) — sin portal; mismo look que el overlay global. */
export function FullScreenIosLoading({
  title = "Cargando…",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-background/88 px-6 backdrop-blur-xl"
      role="status"
      aria-busy="true"
    >
      <IosLoadingCard title={title} subtitle={subtitle} />
    </div>
  );
}
