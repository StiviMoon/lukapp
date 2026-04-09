import { prisma } from "@/db/client";
import Decimal from "decimal.js";
import type { Periodicity } from "@prisma/client";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface RecurringEntry {
  id: string;
  description: string | null;
  categoryName: string | null;
  amount: number;
  periodicity: Periodicity;
  type: "INCOME" | "EXPENSE";
  /** Equivalente mensual mínimo (mes corto: 4 semanas) */
  monthlyMin: number;
  /** Equivalente mensual máximo (mes largo: 5 semanas) */
  monthlyMax: number;
}

export interface BudgetProjection {
  recurringIncome: RecurringEntry[];
  recurringExpenses: RecurringEntry[];
  monthlyIncomeMin: number;
  monthlyIncomeMax: number;
  monthlyExpenseMin: number;
  monthlyExpenseMax: number;
  /** deficit = expense > income (mínimo para ser conservador) */
  deficitMin: number;
  deficitMax: number;
  /** Cuánto ingreso extra mensual necesitas para cubrir metas activas */
  goalContributionNeeded: number;
  /** Ingreso total necesario para vivir + metas */
  totalNeededMin: number;
  totalNeededMax: number;
  /** Candidatos para sugerir "¿es recurrente?" (3+ transacciones similares) */
  recurringCandidates: RecurringCandidate[];
}

export interface RecurringCandidate {
  categoryId: string;
  categoryName: string;
  avgAmount: number;
  count: number;
  suggestedPeriodicity: Periodicity;
}

// ─── Factores de normalización a mes ─────────────────────────────────────────

// Mes "corto" = 4 ocurrencias de evento semanal; mes "largo" = 5
const TO_MONTHLY_MIN: Record<Periodicity, number> = {
  ONCE:      0,     // No recurrente: no aporta a la proyección
  DAILY:     28,    // 28 días (mes corto)
  WEEKLY:    4,     // 4 semanas
  BI_WEEKLY: 2,     // 2 quincenas
  MONTHLY:   1,
  QUARTERLY: 1 / 3,
  YEARLY:    1 / 12,
};

const TO_MONTHLY_MAX: Record<Periodicity, number> = {
  ONCE:      0,
  DAILY:     31,    // 31 días (mes largo)
  WEEKLY:    5,     // 5 semanas
  BI_WEEKLY: 2.17,  // 2.17 quincenas promedio real
  MONTHLY:   1,
  QUARTERLY: 1 / 3,
  YEARLY:    1 / 12,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function toMonthlyRange(amount: number, periodicity: Periodicity): { min: number; max: number } {
  return {
    min: Math.round(amount * TO_MONTHLY_MIN[periodicity]),
    max: Math.round(amount * TO_MONTHLY_MAX[periodicity]),
  };
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const budgetProjectionService = {
  async getProjection(userId: string): Promise<BudgetProjection> {
    // 1. Traer todas las transacciones recurrentes del usuario
    const recurring = await prisma.transaction.findMany({
      where: {
        userId,
        periodicity: { not: "ONCE" },
      },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // 2. Traer metas activas para calcular contribución necesaria
    const goals = await prisma.savingGoal.findMany({
      where: { userId, completed: false },
      select: { targetAmount: true, savedAmount: true, deadline: true },
    });

    // 3. Construir entradas con rango mensual
    const buildEntry = (tx: (typeof recurring)[0]): RecurringEntry => {
      const amount = Number(tx.amount);
      const { min, max } = toMonthlyRange(amount, tx.periodicity);
      return {
        id: tx.id,
        description: tx.description,
        categoryName: tx.category?.name ?? null,
        amount,
        periodicity: tx.periodicity,
        type: tx.type as "INCOME" | "EXPENSE",
        monthlyMin: min,
        monthlyMax: max,
      };
    };

    const incomeEntries = recurring.filter((t) => t.type === "INCOME").map(buildEntry);
    const expenseEntries = recurring.filter((t) => t.type === "EXPENSE").map(buildEntry);

    const monthlyIncomeMin = incomeEntries.reduce((s, e) => s + e.monthlyMin, 0);
    const monthlyIncomeMax = incomeEntries.reduce((s, e) => s + e.monthlyMax, 0);
    const monthlyExpenseMin = expenseEntries.reduce((s, e) => s + e.monthlyMin, 0);
    const monthlyExpenseMax = expenseEntries.reduce((s, e) => s + e.monthlyMax, 0);

    // 4. Calcular contribución mensual necesaria para metas
    let goalContributionNeeded = 0;
    const now = new Date();
    for (const goal of goals) {
      const remaining = new Decimal(goal.targetAmount).minus(goal.savedAmount).toNumber();
      if (remaining <= 0) continue;
      if (goal.deadline) {
        const monthsLeft = Math.max(
          1,
          Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
        );
        goalContributionNeeded += Math.ceil(remaining / monthsLeft);
      } else {
        // Sin deadline: sugerir 12 meses como horizonte
        goalContributionNeeded += Math.ceil(remaining / 12);
      }
    }

    const deficitMin = Math.max(0, monthlyExpenseMin - monthlyIncomeMin);
    const deficitMax = Math.max(0, monthlyExpenseMax - monthlyIncomeMax);

    const totalNeededMin = monthlyExpenseMin + goalContributionNeeded;
    const totalNeededMax = monthlyExpenseMax + goalContributionNeeded;

    // 5. Detectar candidatos a recurrente (3+ transacciones ONCE de misma categoría)
    const candidatesRaw = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        periodicity: "ONCE",
        categoryId: { not: null },
        // Últimos 90 días
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      _count: { id: true },
      _avg: { amount: true },
      having: { id: { _count: { gte: 3 } } },
    });

    // Traer nombres de categorías
    const categoryIds = candidatesRaw
      .map((c) => c.categoryId)
      .filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const recurringCandidates: RecurringCandidate[] = candidatesRaw.map((c) => {
      const count = c._count.id;
      // Sugerir periodicidad según frecuencia en 90 días
      let suggestedPeriodicity: Periodicity = "MONTHLY";
      if (count >= 12) suggestedPeriodicity = "WEEKLY";
      else if (count >= 6) suggestedPeriodicity = "BI_WEEKLY";
      else if (count >= 3) suggestedPeriodicity = "MONTHLY";

      return {
        categoryId: c.categoryId!,
        categoryName: catMap.get(c.categoryId ?? "") ?? "Categoría desconocida",
        avgAmount: Math.round(Number(c._avg.amount ?? 0)),
        count,
        suggestedPeriodicity,
      };
    });

    return {
      recurringIncome: incomeEntries,
      recurringExpenses: expenseEntries,
      monthlyIncomeMin,
      monthlyIncomeMax,
      monthlyExpenseMin,
      monthlyExpenseMax,
      deficitMin,
      deficitMax,
      goalContributionNeeded,
      totalNeededMin,
      totalNeededMax,
      recurringCandidates,
    };
  },

  async confirmCandidate(
    userId: string,
    categoryId: string,
    periodicity: Periodicity
  ): Promise<{ updated: number }> {
    if (periodicity === "ONCE") {
      return { updated: 0 };
    }

    const windowStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        periodicity: "ONCE",
        categoryId,
        date: { gte: windowStart },
      },
      _count: { id: true },
      _avg: { amount: true },
    });

    const candidate = grouped[0];
    if (!candidate || candidate._count.id < 3) {
      return { updated: 0 };
    }

    const avg = Number(candidate._avg.amount ?? 0);
    const tolerance = Math.max(2_000, avg * 0.35);

    const txsToPromote = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        periodicity: "ONCE",
        categoryId,
        date: { gte: windowStart },
        ...(avg > 0 && {
          amount: {
            gte: avg - tolerance,
            lte: avg + tolerance,
          },
        }),
      },
      orderBy: { date: "desc" },
      take: candidate._count.id,
      select: { id: true },
    });

    if (txsToPromote.length === 0) {
      return { updated: 0 };
    }

    const result = await prisma.transaction.updateMany({
      where: {
        id: { in: txsToPromote.map((tx) => tx.id) },
      },
      data: { periodicity },
    });

    return { updated: result.count };
  },
};
