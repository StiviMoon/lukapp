import test from "node:test";
import assert from "node:assert/strict";
import { TransactionType } from "@prisma/client";
import Decimal from "decimal.js";
import {
  buildDailySeries,
  computeAnomalyAlerts,
  computeForecast,
} from "@/services/financial-analytics.service";

test("buildDailySeries rellena dias faltantes y conserva precision", () => {
  const base = new Date("2026-03-10T12:00:00.000Z");
  const tx = [
    { date: new Date("2026-03-09T10:00:00.000Z"), amount: new Decimal("100.10"), type: TransactionType.INCOME },
    { date: new Date("2026-03-09T12:00:00.000Z"), amount: new Decimal("40.05"), type: TransactionType.EXPENSE },
    { date: new Date("2026-03-10T12:00:00.000Z"), amount: new Decimal("10.00"), type: TransactionType.EXPENSE },
  ];

  const series = buildDailySeries(tx, 3, base);
  assert.equal(series.length, 3);
  assert.equal(series[0]?.date, "2026-03-08");
  assert.equal(series[0]?.net, 0);
  assert.equal(series[1]?.income, 100.1);
  assert.equal(series[1]?.expense, 40.05);
  assert.equal(series[1]?.net, 60.05);
});

test("computeForecast produce valores numericos estables", () => {
  const series = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, "0")}`,
    income: 100000 + i * 1500,
    expense: 80000 + i * 500,
    net: 20000 + i * 1000,
  }));

  const result = computeForecast(series);
  assert.equal(Number.isFinite(result.next30Days), true);
  assert.equal(Number.isFinite(result.next90Days), true);
  assert.equal(Number.isFinite(result.trendDaily), true);
  assert.ok(["alta", "media", "baja"].includes(result.confidence));
});

test("computeAnomalyAlerts detecta gastos atipicos", () => {
  const normal = Array.from({ length: 15 }, (_, i) => ({
    date: new Date(`2026-02-${String(i + 1).padStart(2, "0")}T12:00:00.000Z`),
    amount: new Decimal(50000 + i * 2000),
    description: "Gasto normal",
  }));
  const withOutlier = [
    ...normal,
    {
      date: new Date("2026-03-01T12:00:00.000Z"),
      amount: new Decimal(900000),
      description: "Compra excepcional",
    },
  ];

  const alerts = computeAnomalyAlerts(withOutlier);
  assert.equal(alerts.length > 0, true);
});
