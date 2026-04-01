import { TransactionType } from "@prisma/client";
import { prisma } from "@/db/client";

export type RecurringFrequency = "weekly" | "biweekly" | "monthly";

export interface RecurringExpense {
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  averageAmount: number;
  frequency: RecurringFrequency;
  occurrences: number;
  lastDate: string;
  nextExpectedDate: string;
}

function normalizeDesc(desc: string | null): string {
  if (!desc) return "";
  return desc.toLowerCase().trim().replace(/\s+/g, " ");
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function avgInterval(dates: Date[]): number {
  if (dates.length < 2) return 0;
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  let totalDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalDays += (sorted[i].getTime() - sorted[i - 1].getTime()) / 86_400_000;
  }
  return totalDays / (sorted.length - 1);
}

function classifyFrequency(avgDays: number): RecurringFrequency | null {
  if (avgDays >= 6 && avgDays <= 9) return "weekly";
  if (avgDays >= 12 && avgDays <= 18) return "biweekly";
  if (avgDays >= 25 && avgDays <= 37) return "monthly";
  return null;
}

export class RecurringDetectorService {
  async detect(userId: string): Promise<RecurringExpense[]> {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 120); // 4-month window

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: windowStart },
      },
      select: {
        date: true,
        amount: true,
        description: true,
        categoryId: true,
        category: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    // Group by normalized description; if empty, group by categoryId
    const groups = new Map<
      string,
      {
        key: string;
        categoryId: string | null;
        categoryName: string | null;
        amounts: number[];
        dates: Date[];
      }
    >();

    for (const tx of expenses) {
      const desc = normalizeDesc(tx.description);
      const groupKey = desc.length >= 3 ? desc : tx.categoryId ?? "__uncategorized__";

      const existing = groups.get(groupKey);
      if (existing) {
        existing.amounts.push(Number(tx.amount));
        existing.dates.push(tx.date);
      } else {
        groups.set(groupKey, {
          key: groupKey,
          categoryId: tx.categoryId,
          categoryName: tx.category?.name ?? null,
          amounts: [Number(tx.amount)],
          dates: [tx.date],
        });
      }
    }

    const recurring: RecurringExpense[] = [];

    for (const group of groups.values()) {
      if (group.dates.length < 2) continue;

      const avg = avgInterval(group.dates);
      const frequency = classifyFrequency(avg);
      if (!frequency) continue;

      const sorted = [...group.dates].sort((a, b) => a.getTime() - b.getTime());
      const lastDate = sorted[sorted.length - 1];
      const intervalDays =
        frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
      const nextExpectedDate = addDays(lastDate, intervalDays);

      // Only include if next expected date is in the future or recently past (within 7 days)
      const daysSinceExpected = (Date.now() - nextExpectedDate.getTime()) / 86_400_000;
      if (daysSinceExpected > 7) continue;

      const averageAmount =
        group.amounts.reduce((s, a) => s + a, 0) / group.amounts.length;

      // Use description as name if available, else category name
      const name =
        group.key.length >= 3 && group.key !== group.categoryId
          ? group.key
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : group.categoryName ?? "Sin categoría";

      recurring.push({
        name,
        categoryId: group.categoryId,
        categoryName: group.categoryName,
        averageAmount: Math.round(averageAmount),
        frequency,
        occurrences: group.dates.length,
        lastDate: lastDate.toISOString().slice(0, 10),
        nextExpectedDate: nextExpectedDate.toISOString().slice(0, 10),
      });
    }

    // Sort by amount desc
    return recurring.sort((a, b) => b.averageAmount - a.averageAmount).slice(0, 12);
  }
}

export const recurringDetectorService = new RecurringDetectorService();
