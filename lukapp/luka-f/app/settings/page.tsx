"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
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
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
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
  { value: "CASH", label: "Efectivo" },
  { value: "BANK", label: "Banco" },
  { value: "SAVINGS", label: "Ahorros" },
  { value: "CREDIT", label: "Crédito" },
  { value: "INVESTMENT", label: "Inversión" },
];

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
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("CASH");

  // Fetch accounts
  const { data: accountsRes } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
    staleTime: 30_000,
  });

  const accounts = (accountsRes?.data as AccountData[] | undefined) ?? [];

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: () =>
      api.accounts.create({
        name: newAccountName.trim(),
        type: newAccountType,
        balance: 0,
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
      setShowAddAccount(false);
    },
    onError: () => {
      toast.error("Error de conexión");
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
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
    <div className="min-h-dvh bg-background">
      <div className="px-5 pt-12 pb-20 max-w-sm mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
        </div>

        <div className="flex flex-col gap-6">

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
                      "flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-150 text-xs font-semibold",
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

          {/* Cuentas */}
          <SettingsSection title="Cuenta">
            {accounts.length === 0 && !showAddAccount && (
              <div className="px-4 py-4 text-sm text-muted-foreground/50">
                Sin cuentas registradas
              </div>
            )}

            {accounts.map((acc) => (
              <SettingsRow
                key={acc.id}
                icon={<Wallet className="w-4 h-4" />}
                label={acc.name}
                value={
                  <span className="font-nums font-semibold text-foreground">
                    {formatCOP(Number(acc.balance))}
                  </span>
                }
              />
            ))}

            {/* Add account form */}
            {showAddAccount ? (
              <div className="px-4 py-4 flex flex-col gap-3 border-t border-border/30">
                <Input
                  placeholder="Nombre de la cuenta"
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={
                      !newAccountName.trim() || addAccountMutation.isPending
                    }
                    onClick={() => addAccountMutation.mutate()}
                  >
                    {addAccountMutation.isPending ? "Creando..." : "Crear"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setShowAddAccount(false);
                      setNewAccountName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border/30"
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

        </div>
      </div>
    </div>
  );
}
