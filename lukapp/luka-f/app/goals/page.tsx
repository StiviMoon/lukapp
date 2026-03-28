"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Plus, CheckCircle2, Trash2, Pencil, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSavingGoals, useCreateSavingGoal, useUpdateSavingGoal, useDeleteSavingGoal, SavingGoal } from "@/lib/hooks/use-saving-goals";
import { formatCOP, cn } from "@/lib/utils";

function GoalCard({ goal, onUpdate, onDelete }: {
  goal: SavingGoal;
  onUpdate: (id: string, data: { savedAmount?: number; completed?: boolean }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const saved = Number(goal.savedAmount);
  const target = Number(goal.targetAmount);
  const progress = Math.min((saved / target) * 100, 100);
  const remaining = Math.max(target - saved, 0);

  const handleAdd = () => {
    const amount = parseFloat(addAmount.replace(/\./g, "").replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;
    onUpdate(goal.id, { savedAmount: saved + amount });
    setAddAmount("");
    setEditing(false);
  };

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "rounded-2xl p-4 border",
        goal.completed
          ? "bg-lime/10 border-lime/30"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
            goal.completed ? "bg-lime/20" : "bg-purple-brand/10"
          )}>
            {goal.emoji ?? "🎯"}
          </div>
          <div>
            <p className="font-semibold text-[15px] text-foreground leading-tight">{goal.name}</p>
            {daysLeft !== null && !goal.completed && (
              <p className={cn("text-[11px] mt-0.5", daysLeft < 7 ? "text-red-400" : "text-muted-foreground")}>
                {daysLeft > 0 ? `${daysLeft} días restantes` : "Plazo vencido"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {goal.completed ? (
            <CheckCircle2 className="w-5 h-5 text-lime" />
          ) : (
            <button
              onClick={() => setEditing(!editing)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => onDelete(goal.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[12px] mb-1.5">
          <span className="text-muted-foreground">Ahorrado</span>
          <span className="font-semibold text-foreground">{formatCOP(saved)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", goal.completed ? "bg-lime" : "bg-purple-brand")}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[11px] mt-1.5">
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
          <span className="text-muted-foreground">Meta: {formatCOP(target)}</span>
        </div>
      </div>

      {!goal.completed && remaining > 0 && (
        <p className="text-[12px] text-muted-foreground mb-2">Faltan {formatCOP(remaining)}</p>
      )}

      {/* Add amount input */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Monto a agregar"
                className="flex-1 px-3 py-2 text-[13px] rounded-xl bg-background border border-border focus:outline-none focus:border-purple-brand"
              />
              <button onClick={handleAdd} className="w-9 h-9 flex items-center justify-center bg-purple-brand rounded-xl text-white">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)} className="w-9 h-9 flex items-center justify-center bg-muted rounded-xl">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NewGoalSheet({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: { name: string; targetAmount: number; emoji: string; deadline?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [deadline, setDeadline] = useState("");
  const EMOJIS = ["🎯", "🏠", "✈️", "🚗", "💻", "📱", "🎓", "💍", "🏋️", "🌴", "🛍️", "💊"];

  const handleSubmit = () => {
    const targetAmount = parseFloat(target.replace(/\./g, "").replace(",", "."));
    if (!name.trim() || isNaN(targetAmount) || targetAmount <= 0) return;
    onCreate({ name: name.trim(), targetAmount, emoji, deadline: deadline || undefined });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full bg-card rounded-t-3xl p-6 pb-10 border-t border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[17px] text-foreground">Nueva meta</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Emoji picker */}
        <div className="flex gap-2 flex-wrap mb-4">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                "w-10 h-10 text-xl rounded-xl transition-colors",
                emoji === e ? "bg-purple-brand/20 ring-2 ring-purple-brand" : "bg-muted hover:bg-muted/80"
              )}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la meta"
            className="w-full px-4 py-3 text-[15px] rounded-2xl bg-background border border-border focus:outline-none focus:border-purple-brand"
          />
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Monto objetivo ($)"
            className="w-full px-4 py-3 text-[15px] rounded-2xl bg-background border border-border focus:outline-none focus:border-purple-brand"
          />
          <div>
            <label className="text-[12px] text-muted-foreground mb-1 block">Fecha límite (opcional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 text-[15px] rounded-2xl bg-background border border-border focus:outline-none focus:border-purple-brand"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !target}
          className="w-full py-3.5 bg-purple-brand text-white font-bold text-[15px] rounded-2xl hover:bg-purple-brand/90 transition-colors disabled:opacity-40"
        >
          Crear meta
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const { data: goals = [], isLoading } = useSavingGoals();
  const createGoal = useCreateSavingGoal();
  const updateGoal = useUpdateSavingGoal();
  const deleteGoal = useDeleteSavingGoal();
  const [showNew, setShowNew] = useState(false);

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-[18px] text-foreground leading-tight">Metas de ahorro</h1>
            {goals.length > 0 && (
              <p className="text-[12px] text-muted-foreground">{formatCOP(totalSaved)} ahorrado en total</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-brand text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />
          ))
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-brand/10 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-purple-brand" />
            </div>
            <h3 className="font-bold text-[17px] text-foreground mb-2">Sin metas aún</h3>
            <p className="text-[14px] text-muted-foreground max-w-[240px] mb-6">
              Crea tu primera meta de ahorro y empieza a hacer seguimiento visual de tu progreso.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="px-6 py-3 bg-purple-brand text-white font-bold text-[14px] rounded-2xl"
            >
              Crear primera meta
            </button>
          </motion.div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">En progreso</p>
                <AnimatePresence>
                  {active.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={(id, data) => updateGoal.mutate({ id, ...data })}
                      onDelete={(id) => deleteGoal.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}

            {completed.length > 0 && (
              <>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1 pt-2">Completadas</p>
                <AnimatePresence>
                  {completed.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={(id, data) => updateGoal.mutate({ id, ...data })}
                      onDelete={(id) => deleteGoal.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showNew && (
          <NewGoalSheet
            onClose={() => setShowNew(false)}
            onCreate={(data) => createGoal.mutate(data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
