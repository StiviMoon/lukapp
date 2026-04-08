"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, User, Wallet, CheckCircle2, ArrowRight, ChevronLeft, Loader2, Banknote, Building2, PiggyBank, TrendingUp, TrendingDown, Plus, X } from "lucide-react";
import { useCompleteOnboarding, useUpdateProfile } from "@/lib/hooks/use-profile";
import { api, type PeriodicityValue } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

// ─── Constantes ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const ACCOUNT_TYPES = [
  { value: "CASH",     label: "Efectivo",         icon: Banknote,  desc: "Dinero en mano" },
  { value: "CHECKING", label: "Cuenta corriente", icon: Building2, desc: "Banco o nequi" },
  { value: "SAVINGS",  label: "Ahorros",          icon: PiggyBank, desc: "Cuenta de ahorros" },
];

// ─── Slide variants ───────────────────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: EASE_OUT },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: EASE_OUT },
  }),
};

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            backgroundColor: i <= current ? "var(--color-primary)" : "var(--color-border)",
            opacity: i < current ? 0.4 : 1,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep]         = useState(0);
  const [direction, setDir]     = useState(1);
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name ?? ""
  );
  const [accountType, setAccountType] = useState("CASH");
  const [accountName, setAccountName] = useState("Mi billetera");
  const [balance, setBalance]         = useState("");
  const [finishing, setFinishing]     = useState(false);

  // Step recurring
  const [recurringItems, setRecurringItems] = useState<
    { type: "INCOME" | "EXPENSE"; description: string; amount: string; periodicity: PeriodicityValue }[]
  >([]);

  const queryClient      = useQueryClient();
  const updateProfile    = useUpdateProfile();
  const completeOnboarding = useCompleteOnboarding();

  const goNext = () => {
    setDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep(s => s - 1);
  };

  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      // 1. Guardar nombre si fue modificado
      if (fullName.trim()) {
        await updateProfile.mutateAsync({ fullName: fullName.trim() });
      }
      // 2. Crear primera cuenta
      await api.accounts.create({
        name: accountName.trim() || "Mi billetera",
        type: accountType,
        balance: parseFloat(balance) || 0,
      });
      // 3. Guardar recurrentes si hay alguno
      const validItems = recurringItems.filter(
        i => i.description.trim() && parseFloat(i.amount) > 0
      );
      if (validItems.length > 0) {
        await api.voice.save(
          validItems.map(i => ({
            type: i.type,
            amount: parseFloat(i.amount),
            description: i.description.trim(),
            suggestedCategoryName: i.type === "INCOME" ? "Ingresos" : "Gastos fijos",
            periodicity: i.periodicity,
          }))
        );
      }
      // 4. Marcar onboarding como completado
      const updatedProfile = await completeOnboarding.mutateAsync();
      // 5. Actualizar el cache ANTES de navegar — evita el race condition
      //    que haría que el dashboard leyera onboardingCompleted=false y volviera acá
      queryClient.setQueryData(["profile"], updatedProfile);
      // 6. Ir al dashboard
      router.push("/dashboard");
    } catch {
      toast.error("Hubo un error. Intenta de nuevo.");
      setFinishing(false);
    }
  };

  return (
    <div className="min-h-dvh bg-transparent flex flex-col max-w-sm mx-auto px-6 pt-14 pb-10">

      {/* Header: progress + back */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={goBack}
          className={`w-9 h-9 flex items-center justify-center rounded-xl bg-card text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95 ${step === 0 ? "invisible" : ""}`}
          aria-label="Atrás"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <ProgressDots current={step} />
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Wizard steps */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full flex flex-col"
            >
              <StepWelcome onNext={goNext} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full flex flex-col"
            >
              <StepName
                value={fullName}
                onChange={setFullName}
                onNext={goNext}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full flex flex-col"
            >
              <StepAccount
                type={accountType}
                onTypeChange={setAccountType}
                name={accountName}
                onNameChange={setAccountName}
                balance={balance}
                onBalanceChange={setBalance}
                onNext={goNext}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full flex flex-col"
            >
              <StepRecurring
                items={recurringItems}
                onChange={setRecurringItems}
                onNext={goNext}
                onSkip={goNext}
              />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full flex flex-col"
            >
              <StepDone
                name={fullName}
                onFinish={handleFinish}
                loading={finishing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Steps ─────────────────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-10 h-full">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10"
        >
          <Sparkles className="w-7 h-7 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3 }}
          className="text-[34px] font-bold tracking-tight text-foreground font-display leading-tight mb-5"
        >
          ¡Hola!<br />Llegaste a Lukapp ✦
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-[15px] text-muted-foreground leading-relaxed"
        >
          Soy tu compinche financiero. En 4 pasitos dejamos tus lukas organizadas y te cuento cómo manejarlas mejor.
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-primary text-background font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
      >
        ¡Vamos! <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

function StepName({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-10 h-full">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-10">
          <User className="w-6 h-6 text-brand-blue" />
        </div>

        <h2 className="text-[30px] font-bold tracking-tight text-foreground font-display mb-3">
          ¿Cómo te llaman<br />tus parceros?
        </h2>
        <p className="text-[14px] text-muted-foreground mb-8 leading-relaxed">
          Tu nombre, apodo, como te digan — así te voy a saludar cada vez que abramos esto 😊
        </p>

        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Tu nombre o apodo"
          maxLength={60}
          className="w-full px-4 py-4 rounded-2xl bg-card border border-border text-foreground text-base placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          onKeyDown={e => e.key === "Enter" && value.trim() && onNext()}
        />
      </div>

      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="w-full py-4 rounded-2xl bg-primary text-background font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-35 disabled:cursor-not-allowed"
      >
        Continuar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepAccount({
  type, onTypeChange,
  name, onNameChange,
  balance, onBalanceChange,
  onNext,
}: {
  type: string;
  onTypeChange: (v: string) => void;
  name: string;
  onNameChange: (v: string) => void;
  balance: string;
  onBalanceChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-lime/10 flex items-center justify-center mb-8">
            <Wallet className="w-6 h-6 text-lime" />
          </div>
          <h2 className="text-[30px] font-bold tracking-tight text-foreground font-display mb-3">
            ¿Dónde guardas<br />tus lukas?
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Elige tu cuenta principal — efectivo, banco, lo que uses. Más adelante agregas las que quieras.
          </p>
        </div>

        {/* Tipo de cuenta */}
        <div className="grid grid-cols-3 gap-2.5">
          {ACCOUNT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => {
                onTypeChange(t.value);
                onNameChange(t.label);
              }}
              className={`flex flex-col items-center gap-2 py-5 px-2 rounded-2xl border transition-all active:scale-95 ${
                type === t.value
                  ? "border-primary/50 bg-primary/8 shadow-sm"
                  : "border-border bg-card hover:border-primary/25"
              }`}
            >
              <t.icon className="w-6 h-6 text-foreground/70" />
              <span className={`text-[11px] font-semibold leading-tight text-center ${type === t.value ? "text-primary" : "text-foreground/60"}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Nombre de la cuenta */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/45 block">
            Nombre de tu cuenta
          </label>
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Mi billetera"
            maxLength={40}
            className="w-full px-4 py-4 rounded-2xl bg-card border border-border text-foreground text-[15px] placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {!name.trim() && (
            <p className="text-[11px] text-muted-foreground/55 px-1">
              Dale un nombre a tu cuenta para continuar
            </p>
          )}
        </div>

        {/* Balance inicial */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/45 block">
            ¿Cuánto tienes ahorita?{" "}
            <span className="text-muted-foreground/30 normal-case font-normal">· opcional</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/40">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={balance}
              onChange={e => onBalanceChange(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full pl-9 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground text-[15px] placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!name.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
          name.trim()
            ? "bg-primary text-[#111] active:scale-[0.97]"
            : "bg-muted/60 text-foreground/30 cursor-not-allowed"
        }`}
      >
        Continuar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Recurring Item Types ──────────────────────────────────────────────────────

type RecurringItem = {
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: string;
  periodicity: PeriodicityValue;
};

const PERIODICITY_LABELS: Record<PeriodicityValue, string> = {
  ONCE: "Una vez",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BI_WEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
};

const COMMON_PERIODICITIES: PeriodicityValue[] = ["WEEKLY", "BI_WEEKLY", "MONTHLY", "YEARLY"];

function StepRecurring({
  items,
  onChange,
  onNext,
  onSkip,
}: {
  items: RecurringItem[];
  onChange: (items: RecurringItem[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [addingType, setAddingType] = useState<"INCOME" | "EXPENSE" | null>(null);
  const [draft, setDraft] = useState<RecurringItem>({
    type: "INCOME",
    description: "",
    amount: "",
    periodicity: "MONTHLY",
  });

  const startAdd = (type: "INCOME" | "EXPENSE") => {
    setDraft({ type, description: "", amount: "", periodicity: "MONTHLY" });
    setAddingType(type);
  };

  const confirmAdd = () => {
    if (!draft.description.trim() || !parseFloat(draft.amount)) return;
    onChange([...items, { ...draft }]);
    setAddingType(null);
  };

  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 flex flex-col justify-start pt-2 overflow-y-auto">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-[28px] font-bold tracking-tight text-foreground font-display mb-2 leading-tight">
          ¿Tienes ingresos o gastos fijos?
        </h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-1">
          Los <strong>gastos recurrentes</strong> son los que se repiten: arriendo, servicios, Netflix…
        </p>
        <p className="text-[12px] text-muted-foreground/60 mb-6">
          Opcional — puedes agregarlos después desde Analíticas.
        </p>

        {/* Lista de items ya agregados */}
        {items.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-card border border-border/50">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === "INCOME" ? "bg-lime/10" : "bg-rose-500/10"
                }`}>
                  {item.type === "INCOME"
                    ? <TrendingUp className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
                    : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    ${parseFloat(item.amount).toLocaleString("es-CO")} · {PERIODICITY_LABELS[item.periodicity]}
                  </p>
                </div>
                <button onClick={() => remove(i)} className="p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form de nuevo item */}
        {addingType ? (
          <div className="rounded-2xl bg-card border border-primary/30 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {addingType === "INCOME" ? "Nuevo ingreso fijo" : "Nuevo gasto fijo"}
            </p>
            <input
              autoFocus
              type="text"
              placeholder={addingType === "INCOME" ? "ej: Salario, Freelance…" : "ej: Arriendo, Netflix, Gym…"}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/40">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={draft.amount}
                onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PERIODICITIES.map(p => (
                <button
                  key={p}
                  onClick={() => setDraft(d => ({ ...d, periodicity: p }))}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                    draft.periodicity === p
                      ? "bg-primary text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {PERIODICITY_LABELS[p]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAddingType(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAdd}
                disabled={!draft.description.trim() || !parseFloat(draft.amount)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-background text-sm font-semibold transition-all disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => startAdd("INCOME")}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-dashed border-lime/40 bg-lime/5 text-lime-700 dark:text-lime-400 text-sm font-semibold hover:bg-lime/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Ingreso
            </button>
            <button
              onClick={() => startAdd("EXPENSE")}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Gasto
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {items.length === 0 && (
          <button
            onClick={onSkip}
            className="flex-1 py-4 rounded-2xl border border-border text-foreground/60 font-semibold text-[14px] hover:bg-muted/30 transition-colors"
          >
            Omitir por ahora
          </button>
        )}
        <button
          onClick={onNext}
          className={`py-4 rounded-2xl bg-primary text-background font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform ${
            items.length === 0 ? "hidden" : "flex-1"
          }`}
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StepDone({ name, onFinish, loading }: {
  name: string;
  onFinish: () => void;
  loading: boolean;
}) {
  const firstName = name.split(" ")[0] || "tú";

  return (
    <div className="flex flex-col gap-10 h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[32px] font-bold tracking-tight text-foreground font-display mb-4"
        >
          ¡Ya estás, {firstName}! 🎉
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="text-[15px] text-muted-foreground leading-relaxed max-w-[270px]"
        >
          Todo listo. Ahora soy tu compinche y te ayudo a manejar esas lukas con cabeza 💪
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        onClick={onFinish}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-primary text-background font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Configurando tu cuenta...</span>
          </>
        ) : (
          <>Entrar a Lukapp <ArrowRight className="w-4 h-4" /></>
        )}
      </motion.button>
    </div>
  );
}
