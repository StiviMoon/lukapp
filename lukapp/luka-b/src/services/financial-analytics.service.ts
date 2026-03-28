import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import {
  linearRegression,
  linearRegressionLine,
  mean,
  standardDeviation,
} from "simple-statistics";
import { prisma } from "@/db/client";

type DailyPoint = { date: string; income: number; expense: number; net: number };
type ForecastLevel = "alta" | "media" | "baja";
type HealthLevel = "estable" | "riesgo" | "alerta";

export type AnalyticsSummary = {
  health: {
    score: number;
    level: HealthLevel;
    reasons: string[];
  };
  today: {
    insight: string;
    action: string;
  };
  balances: {
    available: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyNet: number;
    burnRateDaily: number;
    runwayDays: number | null;
  };
  forecast: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
    confidence: ForecastLevel;
    trendDaily: number;
  };
  alerts: string[];
  debug: {
    generatedAt: string;
    calculationMs: number;
    payloadBytes: number;
  };
};

function toMoney(value: Decimal.Value): number {
  return Number(new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString());
}

function bounded(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function buildDailySeries(
  tx: { date: Date; amount: Decimal.Value; type: TransactionType }[],
  windowDays: number,
  now: Date = new Date()
): DailyPoint[] {
  const end = startOfDay(now);
  const start = new Date(end);
  start.setDate(start.getDate() - (windowDays - 1));

  const byDay = new Map<string, { income: Decimal; expense: Decimal }>();
  for (let i = 0; i < windowDays; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    byDay.set(dateKey(day), { income: new Decimal(0), expense: new Decimal(0) });
  }

  for (const item of tx) {
    const key = dateKey(item.date);
    const slot = byDay.get(key);
    if (!slot) continue;
    if (item.type === TransactionType.INCOME) {
      slot.income = slot.income.plus(item.amount);
    } else if (item.type === TransactionType.EXPENSE) {
      slot.expense = slot.expense.plus(item.amount);
    }
  }

  return Array.from(byDay.entries()).map(([date, values]) => {
    const net = values.income.minus(values.expense);
    return {
      date,
      income: toMoney(values.income),
      expense: toMoney(values.expense),
      net: toMoney(net),
    };
  });
}

export function computeForecast(dailySeries: DailyPoint[]): {
  next30Days: number;
  next60Days: number;
  next90Days: number;
  trendDaily: number;
  confidence: ForecastLevel;
} {
  if (dailySeries.length === 0) {
    return { next30Days: 0, next60Days: 0, next90Days: 0, trendDaily: 0, confidence: "baja" };
  }

  const netValues = dailySeries.map((d) => d.net);
  const avgNet = mean(netValues);
  const points = netValues.map((y, x) => [x, y] as [number, number]);
  const regression = linearRegression(points);
  const line = linearRegressionLine(regression);
  const trendDaily = line(points.length - 1) - line(points.length - 2 >= 0 ? points.length - 2 : 0);

  const project = (days: number) => {
    let projected = new Decimal(0);
    for (let i = 1; i <= days; i += 1) {
      projected = projected.plus(new Decimal(avgNet).plus(new Decimal(trendDaily).mul(i)));
    }
    return toMoney(projected);
  };

  const volatility = netValues.length > 1 ? standardDeviation(netValues) : Math.abs(avgNet);
  const confidence: ForecastLevel =
    dailySeries.length >= 45 && volatility <= Math.abs(avgNet || 1) * 1.25
      ? "alta"
      : dailySeries.length >= 21
      ? "media"
      : "baja";

  return {
    next30Days: project(30),
    next60Days: project(60),
    next90Days: project(90),
    trendDaily: toMoney(trendDaily),
    confidence,
  };
}

export function computeAnomalyAlerts(
  expenses: { date: Date; amount: Decimal.Value; description: string | null }[]
): string[] {
  if (expenses.length < 10) return [];
  const sorted = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
  const values = sorted.map((item) => Number(item.amount));
  const baseMean = mean(values);
  const std = standardDeviation(values);
  if (!Number.isFinite(std) || std === 0) return [];

  const threshold = baseMean + std * 2.2;
  const outliers = sorted.filter((item) => Number(item.amount) >= threshold).slice(-2).reverse();

  return outliers.map((item) => {
    const amount = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(item.amount));
    return `Detecte un gasto atipico de ${amount}${item.description ? ` en ${item.description}` : ""}.`;
  });
}

export class FinancialAnalyticsService {
  async getSummary(userId: string): Promise<AnalyticsSummary> {
    const startedAt = Date.now();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const analyticsWindowStart = new Date(startOfDay(now));
    analyticsWindowStart.setDate(analyticsWindowStart.getDate() - 89);

    const [accountsAgg, monthIncomeAgg, monthExpenseAgg, txWindow, budgetStatus] =
      await Promise.all([
        prisma.account.aggregate({
          where: { userId, isActive: true },
          _sum: { balance: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.INCOME,
            date: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            date: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.findMany({
          where: {
            userId,
            date: { gte: analyticsWindowStart },
          },
          select: {
            date: true,
            type: true,
            amount: true,
            description: true,
            categoryId: true,
          },
          orderBy: { date: "asc" },
        }),
        prisma.budget.findMany({
          where: { userId, startDate: { lte: now }, endDate: { gte: now } },
          include: { category: true },
        }),
      ]);

    const available = new Decimal(accountsAgg._sum.balance ?? 0);
    const monthlyIncome = new Decimal(monthIncomeAgg._sum.amount ?? 0);
    const monthlyExpense = new Decimal(monthExpenseAgg._sum.amount ?? 0);
    const monthlyNet = monthlyIncome.minus(monthlyExpense);

    const series = buildDailySeries(
      txWindow.map((item) => ({ date: item.date, type: item.type, amount: item.amount })),
      90,
      now
    );
    const forecast = computeForecast(series);

    const burnRateDaily = toMoney(monthlyExpense.div(Math.max(now.getDate(), 1)));
    const runwayDays =
      burnRateDaily > 0 ? Math.floor(available.div(burnRateDaily).toNumber()) : null;

    const spentByCategoryId = new Map<string, Decimal>();
    for (const item of txWindow) {
      if (item.type !== TransactionType.EXPENSE) continue;
      const day = startOfDay(item.date);
      if (day < startOfMonth) continue;
      const key = item.categoryId;
      if (!key) continue;
      spentByCategoryId.set(key, (spentByCategoryId.get(key) ?? new Decimal(0)).plus(item.amount));
    }

    const budgetReasons: string[] = [];
    let budgetOverruns = 0;
    for (const budget of budgetStatus) {
      if (!budget.categoryId) continue;
      const spent = spentByCategoryId.get(budget.categoryId) ?? new Decimal(0);
      const pct = Number(spent.div(new Decimal(budget.amount || 1)).mul(100).toFixed(0));
      if (pct >= 100) {
        budgetOverruns += 1;
        budgetReasons.push(`Excediste el presupuesto de ${budget.category?.name ?? "una categoria"}.`);
      } else if (pct >= 85) {
        budgetReasons.push(`Vas cerca del limite en ${budget.category?.name ?? "una categoria"}.`);
      }
    }

    const savingsRate =
      monthlyIncome.gt(0) ? Number(monthlyNet.div(monthlyIncome).mul(100).toFixed(2)) : 0;

    let score = 55;
    if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate < 0) score -= 20;

    if (runwayDays !== null) {
      if (runwayDays >= 180) score += 20;
      else if (runwayDays >= 90) score += 10;
      else if (runwayDays < 30) score -= 15;
    }

    score -= budgetOverruns * 6;
    score = bounded(Math.round(score), 0, 100);

    const level: HealthLevel = score >= 75 ? "estable" : score >= 50 ? "riesgo" : "alerta";

    const anomalyAlerts = computeAnomalyAlerts(
      txWindow
        .filter((item) => item.type === TransactionType.EXPENSE)
        .map((item) => ({
          date: item.date,
          amount: item.amount,
          description: item.description,
        }))
    );

    const alerts = [
      ...(runwayDays !== null && runwayDays < 45
        ? [`Tu runway estimado es de ${runwayDays} dias.`]
        : []),
      ...(savingsRate < 0
        ? ["Este mes estas gastando mas de lo que ingresas."]
        : []),
      ...budgetReasons,
      ...anomalyAlerts,
    ].slice(0, 3);

    const todayInsight =
      monthlyNet.gte(0)
        ? `Vas con balance positivo este mes: ${toMoney(monthlyNet)}.`
        : `Vas en negativo este mes: ${toMoney(monthlyNet.abs())}.`;

    const todayAction =
      savingsRate < 0
        ? "Recorta una categoria variable esta semana y registra cada gasto diario."
        : "Mantiene el ritmo: revisa tus 2 categorias mas altas y define un tope semanal.";

    const summary: AnalyticsSummary = {
      health: {
        score,
        level,
        reasons: [
          `Ahorro mensual: ${savingsRate.toFixed(1)}%.`,
          ...(runwayDays !== null ? [`Runway: ${runwayDays} dias.`] : ["Runway no aplica con burn rate 0."]),
        ].slice(0, 2),
      },
      today: {
        insight: todayInsight,
        action: todayAction,
      },
      balances: {
        available: toMoney(available),
        monthlyIncome: toMoney(monthlyIncome),
        monthlyExpense: toMoney(monthlyExpense),
        monthlyNet: toMoney(monthlyNet),
        burnRateDaily,
        runwayDays,
      },
      forecast: {
        next30Days: forecast.next30Days,
        next60Days: forecast.next60Days,
        next90Days: forecast.next90Days,
        confidence: forecast.confidence,
        trendDaily: forecast.trendDaily,
      },
      alerts,
      debug: {
        generatedAt: new Date().toISOString(),
        calculationMs: Date.now() - startedAt,
        payloadBytes: 0,
      },
    };

    const payloadBytes = Buffer.byteLength(JSON.stringify(summary), "utf8");
    summary.debug.payloadBytes = payloadBytes;
    return summary;
  }
}

export const financialAnalyticsService = new FinancialAnalyticsService();
