export default function Loading() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-card">
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}

