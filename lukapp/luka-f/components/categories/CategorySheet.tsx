"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, PiggyBank, Pencil } from "lucide-react";
import { cn, CATEGORY_COLORS, hashColor } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BudgetBar } from "./BudgetBar";
import { BudgetSheet } from "./BudgetSheet";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks/use-categories";
import type { Category, BudgetStatus } from "@/lib/types/budget";

// ─── Animation variants ─────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.05 } },
};

const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 28, stiffness: 280 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

// ─── Color dot ──────────────────────────────────────────────────────────────

function ColorDot({
  color,
  selected,
  onSelect,
}: {
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-8 h-8 rounded-full shrink-0 transition-all duration-150 active:scale-90",
        selected && "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
      )}
      style={{ backgroundColor: color }}
      aria-label={color}
    />
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  budgetStatus: BudgetStatus | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CategorySheet({
  isOpen,
  onClose,
  category,
  budgetStatus,
}: CategorySheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [icon, setIcon] = useState("");
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // In create mode, after saving the category we keep the new ID here
  // so BudgetSheet can reference it
  const [savedCategory, setSavedCategory] = useState<Category | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const isEditing = Boolean(category);
  const activeCategory = savedCategory ?? category;
  const isPending = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  // Reset / prefill when sheet opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setType(category.type === "INCOME" ? "INCOME" : "EXPENSE");
        setSelectedColor(category.color ?? null);
        setIcon(category.icon ?? "");
      } else {
        setName("");
        setType("EXPENSE");
        setSelectedColor(null);
        setIcon("");
      }
      setSavedCategory(null);
      setConfirmDelete(false);
    }
  }, [isOpen, category]);

  const resolvedColor = selectedColor ?? (name ? hashColor(name) : CATEGORY_COLORS[0]);

  const handleClose = () => {
    setBudgetSheetOpen(false);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (isEditing && category) {
      const res = await updateCategory.mutateAsync({
        id: category.id,
        name: name.trim(),
        color: selectedColor || resolvedColor,
        icon: icon.trim() || null,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al guardar cambios");
        return;
      }
      toast.success("Categoría actualizada");
      handleClose();
    } else {
      const res = await createCategory.mutateAsync({
        name: name.trim(),
        type,
        color: selectedColor || resolvedColor,
        icon: icon.trim() || null,
      });
      if (!res.success) {
        toast.error(res.error?.message ?? "Error al crear categoría");
        return;
      }
      toast.success("Categoría creada");
      // Store the newly created category so BudgetSheet can use its ID
      setSavedCategory(res.data as unknown as Category);
    }
  };

  const handleBudgetButtonTap = async () => {
    // If in create mode and not yet saved, save the category first
    if (!isEditing && !savedCategory) {
      await handleSave();
      // handleSave sets savedCategory on success — open budget sheet after
      // We rely on the state update triggering the effect below
      return;
    }
    setBudgetSheetOpen(true);
  };

  // After saving a new category, auto-open budget sheet if user tapped the budget button
  const [pendingBudgetOpen, setPendingBudgetOpen] = useState(false);
  useEffect(() => {
    if (pendingBudgetOpen && savedCategory) {
      setBudgetSheetOpen(true);
      setPendingBudgetOpen(false);
    }
  }, [pendingBudgetOpen, savedCategory]);

  const handleBudgetTapForCreate = async () => {
    if (!name.trim()) {
      toast.error("Primero ingresa un nombre para la categoría");
      return;
    }
    if (!savedCategory) {
      setPendingBudgetOpen(true);
      await handleSave();
    } else {
      setBudgetSheetOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    const res = await deleteCategory.mutateAsync(category.id);
    if (!res.success) {
      toast.error(res.error?.message ?? "Error al eliminar");
      return;
    }
    toast.success("Categoría eliminada");
    handleClose();
  };

  // After create+save: if no budget open yet, show "Guardar y cerrar"
  const justCreated = !isEditing && Boolean(savedCategory);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cat-sheet-backdrop"
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClose}
            />

            {/* Sheet */}
            <motion.div
              key="cat-sheet"
              className="fixed bottom-0 left-0 right-0 z-[61] max-w-sm mx-auto rounded-t-[32px] px-6 pt-5 pb-10"
              style={{
                backgroundColor: "var(--background)",
                borderTop: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              }}
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-6 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-5">
                {/* Title */}
                <p className="text-sm font-semibold text-foreground">
                  {isEditing ? "Editar categoría" : justCreated ? "Categoría creada" : "Nueva categoría"}
                </p>

                {/* Type toggle (create only) / badge (edit only) */}
                {!isEditing && !justCreated ? (
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/50">
                    <button
                      type="button"
                      onClick={() => setType("EXPENSE")}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                        type === "EXPENSE"
                          ? "bg-rose-500 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Gasto
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("INCOME")}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                        type === "INCOME"
                          ? "bg-lime text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Ingreso
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      (category?.type ?? type) === "INCOME"
                        ? "bg-lime/15 text-lime-dark dark:text-lime"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    )}>
                      {(category?.type ?? type) === "INCOME" ? "Ingreso" : "Gasto"}
                    </span>
                  </div>
                )}

                {/* Name input */}
                {!justCreated && (
                  <Input
                    type="text"
                    placeholder="Nombre de la categoría"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
                    autoFocus={!isEditing}
                  />
                )}

                {justCreated && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: resolvedColor }}
                    >
                      {icon || name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                  </div>
                )}

                {/* Color picker */}
                {!justCreated && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                      Color
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {CATEGORY_COLORS.map((color) => (
                        <ColorDot
                          key={color}
                          color={color}
                          selected={selectedColor === color}
                          onSelect={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Emoji input */}
                {!justCreated && (
                  <Input
                    type="text"
                    placeholder="Emoji (opcional) · ej. 🍕"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value.slice(0, 2))}
                    className="bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                )}

                {/* Budget section */}
                <div className="flex flex-col gap-3">
                  <div className="h-px bg-border/30" />

                  {budgetStatus && activeCategory ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40">
                          Presupuesto mensual
                        </p>
                        <button
                          type="button"
                          onClick={() => setBudgetSheetOpen(true)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                      </div>
                      <BudgetBar
                        spent={budgetStatus.spent}
                        total={Number(budgetStatus.amount)}
                        percentage={budgetStatus.percentage}
                        remaining={budgetStatus.remaining}
                        isExceeded={budgetStatus.isExceeded}
                        showAmounts
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={isEditing || justCreated ? () => setBudgetSheetOpen(true) : handleBudgetTapForCreate}
                      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all active:scale-[0.98]"
                    >
                      <PiggyBank className="w-4 h-4 shrink-0" />
                      <span className="text-[13px] font-semibold">
                        Añadir presupuesto mensual
                      </span>
                    </button>
                  )}
                </div>

                {/* Actions */}
                {!justCreated && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={!name.trim() || isPending}
                      className="w-full"
                    >
                      {isPending
                        ? "Guardando..."
                        : isEditing
                        ? "Guardar cambios"
                        : "Crear categoría"}
                    </Button>

                    {isEditing && !confirmDelete && (
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmDelete(true)}
                        className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/8"
                      >
                        Eliminar categoría
                      </Button>
                    )}
                    {isEditing && confirmDelete && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 text-muted-foreground"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleDelete}
                          disabled={deleteCategory.isPending}
                          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                        >
                          {deleteCategory.isPending ? "Eliminando..." : "Confirmar"}
                        </Button>
                      </div>
                    )}

                    {!isEditing && (
                      <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="w-full text-muted-foreground"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}

                {justCreated && (
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full text-muted-foreground"
                  >
                    Listo
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Budget sheet — montado fuera del AnimatePresence de CategorySheet */}
      <BudgetSheet
        isOpen={budgetSheetOpen}
        onClose={() => setBudgetSheetOpen(false)}
        categoryId={activeCategory?.id ?? ""}
        categoryName={name || (activeCategory?.name ?? "")}
        existingBudget={budgetStatus}
      />
    </>
  );
}
