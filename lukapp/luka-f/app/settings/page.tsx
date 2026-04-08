"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Plus,
  LogOut,
  ChevronRight,
  Wallet,
  Tag,
  Banknote,
  Building2,
  PiggyBank,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { useLoadingOverlay } from "@/lib/store/loading-overlay-store";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PwaInstallSection } from "@/components/settings/PwaInstallSection";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

function SettingsContentSkeleton() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Perfil skeleton */}
      <div>
        <div className="w-12 h-3 rounded bg-muted-foreground/10 animate-pulse mb-2 ml-1" />
        <div className="rounded-[24px] bg-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted-foreground/10 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-24 rounded bg-muted-foreground/10 animate-pulse" />
            <div className="h-2.5 w-36 rounded bg-muted-foreground/10 animate-pulse" />
          </div>
        </div>
      </div>
      {/* Apariencia skeleton */}
      <div>
        <div className="w-20 h-3 rounded bg-muted-foreground/10 animate-pulse mb-2 ml-1" />
        <div className="rounded-[24px] bg-card p-4">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted-foreground/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      {/* Cuentas skeleton */}
      <div>
        <div className="w-16 h-3 rounded bg-muted-foreground/10 animate-pulse mb-2 ml-1" />
        <div className="rounded-[24px] bg-card overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border/20 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-muted-foreground/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-muted-foreground/10 animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-muted-foreground/10 animate-pulse" />
              </div>
              <div className="h-3 w-16 rounded bg-muted-foreground/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 px-1">
        {title}
      </p>
      <div className="rounded-[24px] bg-card overflow-hidden">{children}</div>
    </div>
  );
}

// ─── Settings row ────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  label,
  value,
  onClick,
  destructive = false,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 w-full px-4 py-3.5 border-b border-border/30 last:border-0 transition-colors",
        onClick && "hover:bg-muted/40 active:bg-muted/60",
        destructive && "text-rose-500",
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0",
            destructive ? "text-rose-500" : "text-muted-foreground"
          )}
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          "flex-1 text-[13px] font-semibold text-left",
          destructive ? "text-rose-500" : "text-foreground"
        )}
      >
        {label}
      </span>
      {value && (
        <span className="text-[12px] text-muted-foreground shrink-0">
          {value}
        </span>
      )}
      {onClick && !destructive && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
      )}
    </Tag>
  );
}

// ─── Account types ───────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
  { value: "CASH",        label: "Efectivo" },
  { value: "CHECKING",    label: "Cuenta bancaria" },
  { value: "SAVINGS",     label: "Cuenta de ahorros" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
  { value: "INVESTMENT",  label: "Inversiones" },
  { value: "OTHER",       label: "Otra" },
];

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote, CHECKING: Building2, SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard, INVESTMENT: TrendingUp, OTHER: Wallet,
};

function AccountIcon({ type }: { type: string }) {
  const Icon = ACCOUNT_ICONS[type] ?? Wallet;
  return <Icon className="w-4 h-4 text-muted-foreground/60" />;
}

interface AccountData {
  id: string;
  name: string;
  type: string;
  balance: string | number;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { show: showOverlay, hide: hideOverlay } = useLoadingOverlay();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [showAddAccount,  setShowAddAccount]  = useState(false);
  const [newAccountName,  setNewAccountName]  = useState("");
  const [newAccountType,  setNewAccountType]  = useState("CASH");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  // Fetch accounts
  const { data: accountsRes, isLoading: accountsRaw } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
    staleTime: 30_000,
  });

  const accountsLoading = useMinDelay(accountsRaw);
  const accounts = (accountsRes?.data as AccountData[] | undefined) ?? [];

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: () =>
      api.accounts.create({
        name: newAccountName.trim(),
        type: newAccountType,
        balance: parseFloat(newAccountBalance.replace(/\./g, "").replace(",", ".")) || 0,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al crear cuenta");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Cuenta creada");
      setNewAccountName("");
      setNewAccountType("CASH");
      setNewAccountBalance("");
      setShowAddAccount(false);
    },
    onError: () => {
      toast.error("Error de conexión");
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => api.accounts.delete(id),
    onSuccess: (res) => {
      setDeletingAccountId(null);
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al eliminar cuenta");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      toast.success("Cuenta eliminada");
    },
    onError: () => {
      setDeletingAccountId(null);
      toast.error("Error de conexión");
    },
  });

  const handleSignOut = async () => {
    showOverlay("Cerrando sesión…", "Hasta pronto.");
    await signOut();
    router.push("/auth");
    setTimeout(() => hideOverlay(), 400);
  };

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const avatarLetter = firstName.charAt(0).toUpperCase();

  const themeOptions: {
    value: "light" | "dark" | "system";
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "light", label: "Claro", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Oscuro", icon: <Moon className="w-4 h-4" /> },
    {
      value: "system",
      label: "Sistema",
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  return (
    <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

      {/* Header fijo */}
      <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground font-display">
          Ajustes
        </h1>
        <div className="w-9" />
      </header>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-app-scroll">
        {accountsLoading ? (
          <SettingsContentSkeleton />
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col gap-6 pt-2"
        >

          {/* Perfil */}
          <SettingsSection title="Perfil">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-primary-foreground">
                  {avatarLetter}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate capitalize">
                  {firstName}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* Apariencia */}
          <SettingsSection title="Apariencia">
            <div className="px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mb-3">
                Tema
              </p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-75 text-xs font-semibold",
                      theme === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Instalar app (PWA) — Android, iOS y escritorio */}
          <SettingsSection title="Instalar app">
            <PwaInstallSection />
          </SettingsSection>

          {/* Finanzas */}
          <SettingsSection title="Finanzas">
            <SettingsRow
              icon={<Tag className="w-4 h-4" />}
              label="Categorías"
              onClick={() => router.push("/categories")}
            />
          </SettingsSection>

          {/* Cuentas */}
          <SettingsSection title="Mis cuentas">
            {accounts.length === 0 && !showAddAccount && (
              <div className="px-4 py-4 text-[13px] text-muted-foreground/50">
                Sin cuentas registradas. Agrega Nequi, Bancolombia, efectivo…
              </div>
            )}

            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/20 last:border-0">
                {/* Emoji */}
                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 text-base">
                  <AccountIcon type={acc.type} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{acc.name}</p>
                  <p className="text-[11px] text-muted-foreground/50">
                    {ACCOUNT_TYPES.find(t => t.value === acc.type)?.label ?? acc.type}
                  </p>
                </div>
                {/* Balance */}
                <div className="text-right shrink-0">
                  <span className="text-[13px] font-bold font-nums text-foreground">
                    {formatCOP(Number(acc.balance))}
                  </span>
                </div>
                {/* Delete */}
                {deletingAccountId === acc.id ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => deleteAccountMutation.mutate(acc.id)}
                      disabled={deleteAccountMutation.isPending}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold disabled:opacity-40"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setDeletingAccountId(null)}
                      className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[11px] font-semibold"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingAccountId(acc.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-colors shrink-0 ml-1"
                    aria-label="Eliminar cuenta"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/25 rotate-0 hidden" />
                    <span className="text-[10px] text-muted-foreground/30 hover:text-rose-500 font-bold">✕</span>
                  </button>
                )}
              </div>
            ))}

            {/* Add account form */}
            {showAddAccount ? (
              <div className="px-4 py-4 flex flex-col gap-3 border-t border-border/30">
                <Input
                  placeholder="Nombre · ej. Nequi, Bancolombia"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
                  autoFocus
                />
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full rounded-xl bg-muted/40 border-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Saldo actual · ej. 9000000"
                  value={newAccountBalance}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setNewAccountBalance(cleaned ? Number(cleaned).toLocaleString("es-CO") : "");
                  }}
                  className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40 font-nums"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!newAccountName.trim() || addAccountMutation.isPending}
                    onClick={() => addAccountMutation.mutate()}
                  >
                    {addAccountMutation.isPending ? "Creando..." : "Crear cuenta"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setShowAddAccount(false);
                      setNewAccountName("");
                      setNewAccountBalance("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border/20"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px] font-semibold">
                  Agregar cuenta
                </span>
              </button>
            )}
          </SettingsSection>

          {/* Sesión */}
          <SettingsSection title="Sesión">
            <SettingsRow
              icon={<LogOut className="w-4 h-4" />}
              label="Cerrar sesión"
              destructive
              onClick={handleSignOut}
            />
          </SettingsSection>

        </motion.div>
        )}
      </div>
    </div>
  );
}
