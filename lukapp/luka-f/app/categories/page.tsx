"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Plus, Tag } from "lucide-react";
import { cn, hashColor } from "@/lib/utils";
import { useCategories } from "@/lib/hooks/use-categories";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { useBudgetStatus } from "@/lib/hooks/use-budgets";
import { CategorySheet } from "@/components/categories/CategorySheet";
import { BudgetBar } from "@/components/categories/BudgetBar";
import type { Category, BudgetStatus } from "@/lib/types/budget";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CategorySkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-muted-foreground/10 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-24 rounded bg-muted-foreground/10" />
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
      </div>
      <div className="w-4 h-4 rounded bg-muted-foreground/10 shrink-0" />
    </div>
  );
}

function CategoriesPageSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
    </div>
  );
}

// ─── Category card ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
  budgetStatus,
  onClick,
}: {
  category: Category;
  budgetStatus: BudgetStatus | null;
  onClick: () => void;
}) {
  const color = category.color ?? hashColor(category.name);
  const displayLabel = category.icon || category.name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card hover:bg-muted/40 active:scale-[0.98] transition-all text-left"
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: color }}
      >
        {displayLabel}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate mb-1">
          {category.name}
        </p>
        {budgetStatus ? (
          <BudgetBar
            spent={budgetStatus.spent}
            total={Number(budgetStatus.amount)}
            percentage={budgetStatus.percentage}
            remaining={budgetStatus.remaining}
            isExceeded={budgetStatus.isExceeded}
            showAmounts={false}
          />
        ) : (
          <p className="text-[11px] text-muted-foreground/35">Sin presupuesto</p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/25 shrink-0" />
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: "EXPENSE" | "INCOME" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-[24px] bg-card">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 bg-background">
        <Tag className="w-5 h-5 text-muted-foreground/25" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground/40 mb-1">
        Sin categorías de {type === "EXPENSE" ? "gastos" : "ingresos"}
      </p>
      <p className="text-xs text-muted-foreground/25">Toca + para crear una</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "EXPENSE" | "INCOME";

export default function CategoriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("EXPENSE");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories, isLoading: catsRaw } = useCategories(activeTab);
  const { data: budgetStatuses, isLoading: budgetsRaw } = useBudgetStatus();
  const catsLoading = useMinDelay(catsRaw || budgetsRaw);

  const budgetByCategory = useMemo(() => {
    const map = new Map<string, BudgetStatus>();
    (budgetStatuses ?? []).forEach((b) => {
      if (b.category?.id) map.set(b.category.id, b);
    });
    return map;
  }, [budgetStatuses]);

  const openCreate = () => {
    setSelectedCategory(null);
    setSheetOpen(true);
  };

  const openEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <div className="h-dvh flex flex-col bg-transparent max-w-sm mx-auto">

        {/* Header */}
        <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/settings")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground font-display">
            Categorías
          </h1>
          <div className="w-9" />
        </header>

        {/* Tab bar */}
        <div className="flex-none px-5 pb-3">
          <div className="grid grid-cols-2 gap-0 p-1 rounded-2xl bg-muted/50">
            {(["EXPENSE", "INCOME"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                  activeTab === tab
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "EXPENSE" ? "Gastos" : "Ingresos"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-app-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-2"
            >
              {catsLoading ? (
                <CategoriesPageSkeleton />
              ) : categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    budgetStatus={budgetByCategory.get(cat.id) ?? null}
                    onClick={() => openEdit(cat)}
                  />
                ))
              ) : (
                <EmptyState type={activeTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40"
        style={{
          boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)",
        }}
        aria-label="Nueva categoría"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.4} />
      </button>

      {/* Sheet */}
      <CategorySheet
        isOpen={sheetOpen}
        onClose={closeSheet}
        category={selectedCategory}
        budgetStatus={
          selectedCategory ? (budgetByCategory.get(selectedCategory.id) ?? null) : null
        }
      />
    </>
  );
}
