"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, Wallet, Pencil, Trash2, TrendingDown, Heart, MoreHorizontal, Settings2, AlertTriangle, Trash, Share2 } from "lucide-react";
// Plus se usa en los botones de presupuesto inline
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { displayMemberName } from "@/lib/display";
import { shareMonthSummary } from "@/lib/share";
import {
  useSpaceStatus,
  useSpaceTransactions,
  useUpdateSalary,
  useCreateSharedBudget,
  useDeleteSharedBudget,
  useDeleteSharedTransaction,
  useRequestSpaceDeletion,
  useCancelSpaceDeletion,
  useConfirmSpaceDeletion,
} from "@/lib/hooks/use-spaces";
import { SharedBudgetCard } from "@/components/shared/SharedBudgetCard";
import { AddSharedTransactionSheet } from "@/components/shared/AddSharedTransactionSheet";
import { SharedSpaceBottomBar } from "@/components/shared/SharedSpaceBottomBar";
import { toast } from "@/lib/toast";
import { formatCompact, cn } from "@/lib/utils";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import type { SharedSpace, SharedTransaction } from "@/lib/types/shared";
import { useAuth } from "@/lib/hooks";
import { useKeyboardBottomInset } from "@/lib/hooks/use-keyboard-bottom-inset";
import { useSheetAutofocus } from "@/lib/hooks/use-sheet-autofocus";

// ─── Constantes ───────────────────────────────────────────────────────────────

const BUDGET_TEMPLATES = [
  { emoji: "🏠", name: "Arriendo",    pct: 30 },
  { emoji: "🛒", name: "Mercado",     pct: 15 },
  { emoji: "💡", name: "Servicios",   pct: 8  },
  { emoji: "🚗", name: "Transporte",  pct: 10 },
  { emoji: "🏥", name: "Salud",       pct: 5  },
  { emoji: "🎬", name: "Salidas",     pct: 10 },
  { emoji: "💰", name: "Ahorro",      pct: 20 },
  { emoji: "🐾", name: "Mascotas",    pct: 5  },
];

// ─── Skeletons ────────────────────────────────────────────────────────────────

function MemberCardSkeleton() {
  return <div className="bg-card rounded-2xl p-4 animate-pulse h-[110px]" />;
}
function BudgetCardSkeleton() {
  return <div className="bg-card rounded-2xl animate-pulse h-[170px]" />;
}
function TxSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 shrink-0 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-muted-foreground/10 animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-muted-foreground/10 animate-pulse" />
      </div>
      <div className="h-3.5 w-14 rounded bg-muted-foreground/10 animate-pulse" />
    </div>
  );
}

// ─── Salary modal ─────────────────────────────────────────────────────────────

function SalaryModal({
  isOpen, currentSalary, onClose, onSave, isPending,
}: {
  isOpen: boolean; currentSalary: number; onClose: () => void;
  onSave: (salary: number) => void; isPending: boolean;
}) {
  const [raw, setRaw] = useState(currentSalary > 0 ? currentSalary.toLocaleString("es-CO") : "");
  const salary = parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardBottomInset(isOpen);
  useSheetAutofocus(isOpen, inputRef);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-card shadow-none border-t border-[#e0e0e0] dark:border-[#3d3560] rounded-t-3xl px-5 pt-5 w-full max-w-sm mx-auto z-10 flex flex-col max-h-[min(92dvh,calc(100dvh-0.5rem))]"
        style={{
          paddingBottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
        }}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5 shrink-0" />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <h3 className="text-[15px] font-bold mb-1">
            {currentSalary > 0 ? "Actualizar salario" : "Declara tu salario"}
          </h3>
          <p className="text-[12px] text-muted-foreground/60 mb-5">
            Solo tu pareja verá este dato. Tus gastos personales siguen siendo 100% privados.
          </p>
          <div className="flex items-center gap-2 mb-5 bg-muted/40 rounded-2xl px-4 py-3">
            <span className="text-xl font-bold text-muted-foreground/40 font-nums">$</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              value={raw}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "");
                setRaw(val ? Number(val).toLocaleString("es-CO") : "");
              }}
              placeholder="0"
              className="flex-1 text-[28px] font-extrabold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/20 font-nums tabular-nums"
            />
          </div>
          <button
            onClick={() => onSave(salary)}
            disabled={salary <= 0 || isPending}
            className="w-full py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-40 active:scale-[0.97] transition-all"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add budget modal ─────────────────────────────────────────────────────────

function AddBudgetModal({
  isOpen, onClose, onSave, isPending, existingNames,
}: {
  isOpen: boolean; onClose: () => void;
  onSave: (name: string, pct: number) => void;
  isPending: boolean; existingNames: string[];
}) {
  const [name, setName] = useState("");
  const [pct,  setPct]  = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardBottomInset(isOpen);
  useSheetAutofocus(isOpen, nameInputRef);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setPct("");
  }, [isOpen]);

  const handleTemplate = (t: typeof BUDGET_TEMPLATES[0]) => {
    setName(t.name);
    setPct(String(t.pct));
  };

  if (!isOpen) return null;

  const available = BUDGET_TEMPLATES.filter(t => !existingNames.includes(t.name));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-card shadow-none border-t border-[#e0e0e0] dark:border-[#3d3560] rounded-t-3xl px-5 pt-5 w-full max-w-sm mx-auto z-10 flex flex-col max-h-[min(92dvh,calc(100dvh-0.5rem))]"
        style={{
          paddingBottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
        }}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto shrink-0" />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4 mt-4">
        <h3 className="text-[15px] font-bold">Nuevo presupuesto compartido</h3>

        {/* Plantillas rápidas */}
        {available.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wide mb-2">
              Sugerencias para el hogar
            </p>
            <div className="flex gap-2 flex-wrap">
              {available.map(t => (
                <button
                  key={t.name}
                  onClick={() => handleTemplate(t)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors",
                    name === t.name
                      ? "bg-primary text-white border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nombre personalizado */}
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          enterKeyHint="next"
          placeholder="O escribe un nombre personalizado"
          className="w-full px-4 py-3 rounded-2xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 transition-all"
        />

        {/* % del salario */}
        <div className="relative">
          <input
            type="number"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="% del salario de cada uno"
            min={1}
            max={100}
            enterKeyHint="done"
            className="w-full px-4 py-3 rounded-2xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 pr-10 transition-all font-nums"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-muted-foreground/40 font-nums">%</span>
        </div>

        <button
          onClick={() => onSave(name.trim(), Number(pct))}
          disabled={!name.trim() || Number(pct) < 1 || Number(pct) > 100 || isPending}
          className="w-full py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-40 active:scale-[0.97] transition-all"
        >
          {isPending ? "Creando..." : "Crear presupuesto"}
        </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 2)  return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

// ─── Transaction action sheet ─────────────────────────────────────────────────

function TxActionSheet({
  tx, onClose, onEdit, onDelete,
}: {
  tx: SharedTransaction | null;
  onClose: () => void;
  onEdit: (tx: SharedTransaction) => void;
  onDelete: (tx: SharedTransaction) => void;
}) {
  return (
    <AnimatePresence>
      {tx && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-60 bg-card shadow-none border-t border-[#e0e0e0] dark:border-[#3d3560] rounded-t-3xl px-5 pt-4 pb-10 max-w-sm mx-auto"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />

            {/* Tx preview */}
            <div className="flex items-center gap-3 pb-4 mb-2 border-b border-border/20">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                <Wallet className="w-4.5 h-4.5 text-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-foreground truncate">
                  {tx.description ?? tx.sharedBudget?.categoryName ?? "Gasto compartido"}
                </p>
                <p className="text-[12px] text-muted-foreground/60">
                  {tx.author.fullName?.split(" ")[0] ?? (tx.author.email?.split("@")[0] ?? "—")} · {timeAgo(tx.date)}
                </p>
              </div>
              <p className="text-[16px] font-extrabold text-foreground font-nums tabular-nums shrink-0">
                -{formatCompact(Number(tx.amount))}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onEdit(tx); onClose(); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors active:scale-[0.97] text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[14px] font-semibold text-foreground">Editar gasto</span>
              </button>
              <button
                onClick={() => { onDelete(tx); onClose(); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 transition-colors active:scale-[0.97] text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <span className="text-[14px] font-semibold text-rose-500">Eliminar gasto</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Transaction item ─────────────────────────────────────────────────────────

function TxItem({
  tx, myUserId, spaceType, onTap,
}: {
  tx: SharedTransaction;
  myUserId: string;
  spaceType: "PAREJA" | "FAMILIAR";
  onTap: (tx: SharedTransaction) => void;
}) {
  const isMe  = tx.authorId === myUserId;
  const who   = displayMemberName(tx.author.fullName, tx.author.email, spaceType, isMe);
  const title = tx.description ?? tx.sharedBudget?.categoryName ?? "Gasto compartido";

  return (
    <button
      type="button"
      onClick={() => onTap(tx)}
      className="w-full flex items-center gap-3 py-3 border-b border-border/[0.08] last:border-0 text-left active:bg-muted/40 transition-colors rounded-lg -mx-1 px-1"
    >
      {/* Icono */}
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
        <Wallet className="w-4 h-4 text-muted-foreground/40" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Fila 1: título + monto */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
            {title}
          </p>
          <p className="text-[13px] font-bold text-foreground font-nums tabular-nums shrink-0 leading-tight">
            -{formatCompact(Number(tx.amount))}
          </p>
        </div>

        {/* Fila 2: metadatos */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] text-muted-foreground/50 shrink-0">{who}</span>
          <span className="text-[11px] text-muted-foreground/30">·</span>
          <span className="text-[11px] text-muted-foreground/50 shrink-0">{timeAgo(tx.date)}</span>
          {tx.sharedBudget?.categoryName && (
            <>
              <span className="text-[11px] text-muted-foreground/30">·</span>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 text-[10px] font-semibold leading-none">
                {tx.sharedBudget.categoryName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Indicador de acción */}
      <MoreHorizontal className="w-4 h-4 text-muted-foreground/20 shrink-0" />
    </button>
  );
}

// ─── Member salary card ───────────────────────────────────────────────────────

function MemberSalaryCard({
  label, salary, deductions, available, isMe, onEdit,
}: {
  label: string; salary: number; deductions: number;
  available: number; isMe: boolean; onEdit?: () => void;
}) {
  const isNegative = available < 0;
  const usedPct    = salary > 0 ? Math.min((deductions / salary) * 100, 100) : 0;

  return (
    <div className="bg-card rounded-2xl p-3.5 flex flex-col gap-2.5 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wide truncate">
          {label}
        </p>
        {isMe && onEdit && (
          <button
            onClick={onEdit}
            className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors shrink-0"
          >
            <Pencil className="w-3 h-3 text-muted-foreground/40" />
          </button>
        )}
      </div>

      {salary > 0 ? (
        <>
          <p className="text-[20px] font-extrabold text-foreground font-nums tabular-nums leading-none truncate">
            {formatCompact(salary)}
          </p>

          {/* Mini barra */}
          {deductions > 0 && (
            <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isNegative ? "bg-rose-500" : usedPct >= 70 ? "bg-amber-400" : "bg-primary"
                )}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          )}

          {deductions > 0 && (
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-muted-foreground/45">Gastado</span>
                <span className="text-[11px] font-bold text-rose-400 font-nums tabular-nums">
                  -{formatCompact(deductions)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground/60">Libre</span>
                <span className={cn(
                  "text-[12px] font-extrabold font-nums tabular-nums",
                  isNegative ? "text-rose-500" : "text-lime"
                )}>
                  {formatCompact(available)}
                </span>
              </div>
            </div>
          )}
        </>
      ) : isMe ? (
        <button onClick={onEdit} className="text-[12px] text-primary font-semibold text-left leading-snug">
          Declarar mi salario →
        </button>
      ) : (
        <p className="text-[11px] text-muted-foreground/35 italic">Sin declarar</p>
      )}
    </div>
  );
}

// ─── Space settings sheet ────────────────────────────────────────────────────

function SpaceSettingsSheet({
  isOpen,
  onClose,
  onRequestDelete,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRequestDelete: () => void;
  isPending: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bd"
            className="fixed inset-0 bg-black/50 z-60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-60 bg-card shadow-none border-t border-[#e0e0e0] dark:border-[#3d3560] rounded-t-3xl px-5 pt-4 pb-10 max-w-sm mx-auto"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-[15px] font-bold text-foreground mb-4">Opciones de la sala</h3>
            <button
              onClick={() => { onRequestDelete(); onClose(); }}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-rose-500/8 hover:bg-rose-500/12 transition-colors active:scale-[0.97] text-left disabled:opacity-40"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <Trash className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-rose-500">Solicitar eliminar sala</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  Tu pareja deberá confirmar
                </p>
              </div>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Deletion confirmation modal ──────────────────────────────────────────────

function DeleteConfirmModal({
  isOpen,
  requesterName,
  isRequester,
  onConfirm,
  onCancel,
  isPending,
}: {
  isOpen: boolean;
  requesterName: string;
  isRequester: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!isRequester ? undefined : onCancel} />
      <div className="relative bg-card rounded-t-3xl px-5 pt-5 pb-10 w-full max-w-sm mx-auto z-10">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

        {/* Icono */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Trash className="w-7 h-7 text-rose-500" />
          </div>
        </div>

        {isRequester ? (
          <>
            <h3 className="text-[16px] font-bold text-center text-foreground mb-2">
              Esperando confirmación
            </h3>
            <p className="text-[13px] text-muted-foreground/70 text-center mb-6 leading-relaxed">
              Enviaste una solicitud para eliminar esta sala.{"\n"}
              Tu pareja debe confirmar para proceder.
            </p>
            <button
              onClick={onCancel}
              disabled={isPending}
              className="w-full py-3.5 rounded-2xl bg-muted/60 text-[14px] font-semibold text-foreground disabled:opacity-40 active:scale-[0.97]"
            >
              Cancelar solicitud
            </button>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-bold text-center text-foreground mb-2">
              {requesterName} quiere eliminar la sala
            </h3>
            <p className="text-[13px] text-muted-foreground/70 text-center mb-6 leading-relaxed">
              Se eliminarán todos los presupuestos, gastos y registros compartidos. Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirm}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-rose-500 text-white text-[14px] font-bold disabled:opacity-40 active:scale-[0.97]"
              >
                {isPending ? "Eliminando..." : "Sí, eliminar sala"}
              </button>
              <button
                onClick={onCancel}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-muted/50 text-[14px] font-semibold text-foreground disabled:opacity-40"
              >
                No, cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Deletion pending banner ──────────────────────────────────────────────────

function DeletionPendingBanner({
  requesterName,
  isRequester,
  onViewRequest,
}: {
  requesterName: string;
  isRequester: boolean;
  onViewRequest: () => void;
}) {
  return (
    <button
      onClick={onViewRequest}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left active:scale-[0.97] transition-all"
    >
      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-rose-500 leading-tight">
          {isRequester
            ? "Esperando que tu pareja confirme la eliminación"
            : `${requesterName} quiere eliminar esta sala`}
        </p>
        <p className="text-[11px] text-rose-400/70 mt-0.5">
          {isRequester ? "Toca para cancelar" : "Toca para responder"}
        </p>
      </div>
    </button>
  );
}

// ─── Monthly summary ──────────────────────────────────────────────────────────

function MonthSummary({
  transactions, myUserId, partnerName, spaceName,
}: {
  transactions: SharedTransaction[]; myUserId: string; partnerName: string; spaceName: string;
}) {
  const now = new Date();
  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (thisMonth.length === 0) return null;

  const total       = thisMonth.reduce((s, tx) => s + Number(tx.amount), 0);
  const mySpent     = thisMonth.filter(tx => tx.authorId === myUserId).reduce((s, tx) => s + Number(tx.amount), 0);
  const partnerSpent = total - mySpent;
  const myPct       = total > 0 ? (mySpent / total) * 100 : 50;

  const monthName = now.toLocaleString("es-CO", { month: "long" });

  return (
    <div className="bg-card rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-muted-foreground/50" />
          <p className="text-[11px] font-bold text-muted-foreground/60 capitalize">{monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-extrabold text-foreground font-nums tabular-nums">
            {formatCompact(total)}
          </p>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={() => shareMonthSummary(spaceName, total, mySpent, partnerName)}
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors active:scale-95"
              aria-label="Compartir resumen"
            >
              <Share2 className="w-3.5 h-3.5 text-muted-foreground/50" />
            </button>
          )}
        </div>
      </div>

      {/* Barra doble — mi parte vs pareja */}
      <div className="flex h-2 rounded-full overflow-hidden bg-muted-foreground/10 mb-2.5">
        <div
          className="h-full bg-primary/70 transition-all duration-700"
          style={{ width: `${myPct}%` }}
        />
        <div className="flex-1 h-full bg-lime/50" />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary/70" />
          <span className="text-muted-foreground/60">Yo</span>
          <span className="font-bold text-foreground font-nums tabular-nums">{formatCompact(mySpent)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground font-nums tabular-nums">{formatCompact(partnerSpent)}</span>
          <span className="text-muted-foreground/60">{partnerName}</span>
          <div className="w-2 h-2 rounded-full bg-lime/50" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharedSpacePage() {
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const spaceId  = params.id;
  const { user } = useAuth();
  const myUserId = user?.id ?? "";

  const { data: space, isLoading: spaceRaw, isError: spaceError } = useQuery<SharedSpace>({
    queryKey: ["spaces", spaceId],
    queryFn: async () => {
      const res = await api.spaces.getById(spaceId);
      if (!res.success) throw new Error(res.error?.message);
      return res.data as SharedSpace;
    },
    enabled: !!spaceId,
    retry: false,
  });

  const spaceLoading  = useMinDelay(spaceRaw);
  const { data: spaceStatus, isLoading: statusRaw } = useSpaceStatus(spaceId);
  const statusLoading = useMinDelay(statusRaw);
  const { data: transactions = [], isLoading: txRaw } = useSpaceTransactions(spaceId);
  const txLoading     = useMinDelay(txRaw);

  const [salaryOpen,        setSalaryOpen]        = useState(false);
  const [addBudgetOpen,     setAddBudgetOpen]      = useState(false);
  const [settingsOpen,      setSettingsOpen]       = useState(false);
  const [deletionModalOpen, setDeletionModalOpen]  = useState(false);
  const [selectedTx,        setSelectedTx]         = useState<SharedTransaction | null>(null);
  const [txSheet, setTxSheet] = useState<{
    open: boolean; budgetId?: string | null; editing?: SharedTransaction | null;
  }>({ open: false });

  const { mutateAsync: updateSalary,    isPending: updatingSalary  } = useUpdateSalary();
  const { mutateAsync: createBudget,    isPending: creatingBudget  } = useCreateSharedBudget();
  const { mutateAsync: deleteBudget  } = useDeleteSharedBudget();
  const { mutateAsync: deleteTx      } = useDeleteSharedTransaction();
  const { mutateAsync: requestDelete,   isPending: requestingDelete } = useRequestSpaceDeletion();
  const { mutateAsync: cancelDelete,    isPending: cancelingDelete  } = useCancelSpaceDeletion();
  const { mutateAsync: confirmDelete,   isPending: confirmingDelete } = useConfirmSpaceDeletion();

  // Guards: wait for auth + space to resolve
  const me      = space?.members.find((m) => m.userId === myUserId);
  const partner = space?.members.find((m) => m.userId !== myUserId);

  const budgetStatuses        = spaceStatus?.budgetStatuses ?? [];
  const myAvailableSalary     = spaceStatus?.myAvailableSalary ?? 0;
  const partnerAvailableSalary = spaceStatus?.partnerAvailableSalary ?? 0;
  const myTotalDeductions     = spaceStatus?.myTotalDeductions ?? 0;
  const partnerTotalDeductions = spaceStatus?.partnerTotalDeductions ?? 0;
  const existingBudgetNames   = (space?.budgets ?? []).map(b => b.categoryName);

  const spaceType = space?.type ?? "PAREJA";
  const partnerFirstName = partner
    ? displayMemberName(partner.profile.fullName, partner.profile.email, spaceType, false)
    : (spaceType === "PAREJA" ? "My love" : "Miembro");

  const handleSalary = async (salary: number) => {
    const res = await updateSalary({ id: spaceId, salary });
    if (!res.success) { toast.error(res.error?.message ?? "Error"); return; }
    toast.success("Salario actualizado");
    setSalaryOpen(false);
  };

  const handleCreateBudget = async (categoryName: string, percentage: number) => {
    const res = await createBudget({ id: spaceId, data: { categoryName, percentage } });
    if (!res.success) { toast.error(res.error?.message ?? "Error"); return; }
    toast.success("Presupuesto creado");
    setAddBudgetOpen(false);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const res = await deleteBudget({ id: spaceId, budgetId });
    if (!res.success) toast.error(res.error?.message ?? "Error");
    else toast.success("Presupuesto eliminado");
  };

  const handleDeleteTx = async (tx: SharedTransaction) => {
    const res = await deleteTx({ id: spaceId, txId: tx.id });
    if (!res.success) toast.error(res.error?.message ?? "Error");
    else toast.success("Gasto eliminado");
  };

  const handleRequestDelete = async () => {
    const res = await requestDelete(spaceId);
    if (!res.success) { toast.error(res.error?.message ?? "Error"); return; }
    setDeletionModalOpen(true);
  };

  const handleCancelDelete = async () => {
    const res = await cancelDelete(spaceId);
    if (!res.success) { toast.error(res.error?.message ?? "Error"); return; }
    setDeletionModalOpen(false);
    toast.success("Solicitud cancelada");
  };

  const handleConfirmDelete = async () => {
    const res = await confirmDelete(spaceId);
    if (!res.success) { toast.error(res.error?.message ?? "Error"); return; }
    toast.success("Sala eliminada");
    router.replace("/dashboard");
  };

  // Estado de eliminación
  const deletionRequested  = space?.deletionRequestedBy ?? null;
  const iAmRequester       = deletionRequested === myUserId;
  const requesterName      = iAmRequester
    ? "Tú"
    : (partner ? displayMemberName(partner.profile.fullName, partner.profile.email, spaceType, false) : "Tu pareja");

  // ─── Full-page skeleton while loading space ────────────────────────────────
  if (spaceLoading) {
    return (
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">
        <header className="flex-none px-5 pt-12 pb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-card animate-pulse shrink-0" />
          <div className="flex-1 h-5 rounded-xl bg-card animate-pulse" />
        </header>
        <div className="flex-1 px-5 flex flex-col gap-4 pt-4 overflow-y-auto pb-36">
          <div className="grid grid-cols-2 gap-3">
            <MemberCardSkeleton />
            <MemberCardSkeleton />
          </div>
          <div className="h-14 rounded-2xl bg-card animate-pulse" />
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
        </div>
      </div>
    );
  }

  // Sala no existe o fue eliminada → redirigir al dashboard
  if (spaceError || (!spaceLoading && !space)) {
    router.replace("/dashboard");
    return null;
  }

  if (!space) return null;

  return (
    <>
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <h1 className="text-[15px] font-bold text-foreground font-display truncate">{space.name}</h1>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors"
          >
            <Settings2 className="w-4 h-4 text-muted-foreground/60" />
          </button>
        </header>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-36 pt-2 flex flex-col gap-4">

          {/* Miembros */}
          <div className="grid grid-cols-2 gap-3">
            <MemberSalaryCard
              label="Yo"
              salary={Number(me?.salary ?? 0)}
              deductions={myTotalDeductions}
              available={myAvailableSalary}
              isMe
              onEdit={() => setSalaryOpen(true)}
            />
            <MemberSalaryCard
              label={partnerFirstName}
              salary={Number(partner?.salary ?? 0)}
              deductions={partnerTotalDeductions}
              available={partnerAvailableSalary}
              isMe={false}
            />
          </div>

          {/* Banner de eliminación pendiente */}
          {deletionRequested && (
            <DeletionPendingBanner
              requesterName={requesterName}
              isRequester={iAmRequester}
              onViewRequest={() => setDeletionModalOpen(true)}
            />
          )}

          {/* Resumen mensual */}
          {!txLoading && (
            <MonthSummary
              transactions={transactions}
              myUserId={myUserId}
              partnerName={partnerFirstName}
              spaceName={space.name}
            />
          )}

          {/* Presupuestos */}
          <section>
            <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-2 px-0.5">
              Presupuestos
            </p>

            {statusLoading ? (
              <div className="flex flex-col gap-3">
                <BudgetCardSkeleton />
                <BudgetCardSkeleton />
              </div>
            ) : budgetStatuses.length > 0 ? (
              <div className="flex flex-col gap-3">
                {budgetStatuses.map((s) => (
                  <SharedBudgetCard
                    key={s.budget.id}
                    status={s}
                    me={me}
                    partner={partner}
                    spaceType={spaceType}
                    onAddTransaction={(budgetId) =>
                      setTxSheet({ open: true, budgetId, editing: null })
                    }
                    onDelete={handleDeleteBudget}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 rounded-2xl bg-card">
                <p className="text-[13px] font-semibold text-muted-foreground/40 mb-1">Sin presupuestos aún</p>
                <p className="text-[11px] text-muted-foreground/25">Crea uno para empezar a controlar juntos</p>
              </div>
            )}

            <button
              onClick={() => setAddBudgetOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-muted-foreground/15 text-[13px] font-semibold text-muted-foreground/40 hover:border-primary/30 hover:text-primary/60 transition-colors active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              Nuevo presupuesto
            </button>
          </section>

          {/* Transacciones recientes */}
          <section>
            <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-2 px-0.5">
              Recientes
            </p>
            {txLoading ? (
              <div className="bg-card rounded-2xl px-4">
                <TxSkeleton /><TxSkeleton /><TxSkeleton />
              </div>
            ) : transactions.length > 0 ? (
              <div className="bg-card rounded-2xl px-4 py-1">
                {transactions.slice(0, 20).map(tx => (
                  <TxItem
                    key={tx.id}
                    tx={tx}
                    myUserId={myUserId}
                    spaceType={space.type ?? "PAREJA"}
                    onTap={setSelectedTx}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 rounded-2xl bg-card gap-1">
                <Wallet className="w-8 h-8 text-muted-foreground/15 mb-1" />
                <p className="text-[13px] font-semibold text-muted-foreground/40">Sin gastos aún</p>
                <p className="text-[11px] text-muted-foreground/25">Toca + para registrar el primero</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Navbar custom con + expandible ─────────────────────────────────── */}
      <SharedSpaceBottomBar
        onAddExpense={() => setTxSheet({ open: true, budgetId: null, editing: null })}
      />

      {/* ── Transaction action sheet ────────────────────────────────────────── */}
      <TxActionSheet
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
        onEdit={(t) => setTxSheet({ open: true, budgetId: null, editing: t })}
        onDelete={handleDeleteTx}
      />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <SalaryModal
        isOpen={salaryOpen}
        currentSalary={Number(me?.salary ?? 0)}
        onClose={() => setSalaryOpen(false)}
        onSave={handleSalary}
        isPending={updatingSalary}
      />

      <AddBudgetModal
        isOpen={addBudgetOpen}
        onClose={() => setAddBudgetOpen(false)}
        onSave={handleCreateBudget}
        isPending={creatingBudget}
        existingNames={existingBudgetNames}
      />

      <AddSharedTransactionSheet
        isOpen={txSheet.open}
        onClose={() => setTxSheet({ open: false })}
        spaceId={spaceId}
        budgets={space?.budgets ?? []}
        defaultBudgetId={txSheet.budgetId}
        editingTransaction={txSheet.editing}
      />

      {/* ── Space settings sheet ────────────────────────────────────────────── */}
      <SpaceSettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRequestDelete={handleRequestDelete}
        isPending={requestingDelete}
      />

      {/* ── Deletion confirmation modal ──────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deletionModalOpen || (!!deletionRequested && !settingsOpen)}
        requesterName={requesterName}
        isRequester={iAmRequester}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isPending={confirmingDelete || cancelingDelete}
      />
    </>
  );
}
