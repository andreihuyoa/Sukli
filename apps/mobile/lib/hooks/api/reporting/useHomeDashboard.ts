import { useMemo } from "react";

import { getDb } from "@/lib/db/client";
import {
  buildHomeSalesQuery,
  buildHomeStockQuery,
  type HomeSalesRow,
  type HomeStockRow,
} from "@/lib/db/repositories/home.repository";
import {
  getCurrentUserId,
  getSetupProfile,
} from "@/lib/db/repositories/setup.repository";
import type {
  HomeDashboardModel,
  HomeRestockAlert,
  HomeTransactionStatus,
} from "@/lib/types/api/reporting";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const EMPTY_VALUE = "—";
const AVATAR_COLORS = ["#1b4332", "#6a3342", "#4b5563", "#2d6a4f"];

interface DashboardDateRange {
  weekStart: Date;
  yesterdayStart: Date;
  todayStart: Date;
  tomorrowStart: Date;
  weekDays: Date[];
}

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function timeBasedGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function emptyDashboard(): HomeDashboardModel {
  return {
    dateLabel: formatTodayLabel(),
    greetingLine: timeBasedGreeting(),
    displayName: "",
    revenueTodayDisplay: EMPTY_VALUE,
    revenueChangePercent: 0,
    activeStockDisplay: EMPTY_VALUE,
    activeStockSubtitle: "Add products to your catalog",
    profitEstDisplay: EMPTY_VALUE,
    profitEstSubtitle: EMPTY_VALUE,
    gcashAmountDisplay: EMPTY_VALUE,
    gcashChangeLabel: EMPTY_VALUE,
    cashSalesAmountDisplay: EMPTY_VALUE,
    cashSalesShareLabel: EMPTY_VALUE,
    weeklyChartBars: [],
    weeklyTotalDisplay: EMPTY_VALUE,
    dailyAvgDisplay: EMPTY_VALUE,
    restockAlerts: [],
    transactions: [],
    transactionTotalToday: 0,
  };
}

export interface UseHomeDashboardResult {
  dashboard: HomeDashboardModel;
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export function useHomeDashboard(): UseHomeDashboardResult {
  const db = getDb();
  const setupProfile = getSetupProfile(db, getCurrentUserId());
  const range = useMemo(() => buildDateRange(new Date()), []);

  const stockQuery = useMemo(() => buildHomeStockQuery(db), [db]);
  const salesQuery = useMemo(
    () => buildHomeSalesQuery(db, range.weekStart, range.tomorrowStart),
    [db, range.tomorrowStart, range.weekStart]
  );

  const { data: stockRows, error: stockError } = useLiveQuery(stockQuery);
  const { data: salesRows, error: salesError } = useLiveQuery(salesQuery);

  const error = stockError ?? salesError ?? null;
  const isLoading =
    (stockRows === undefined || salesRows === undefined) && !error;

  const dashboard = useMemo(() => {
    if (isLoading || error) return emptyDashboard();
    return buildDashboard(
      stockRows ?? [],
      salesRows ?? [],
      range,
      setupProfile?.displayName ?? ""
    );
  }, [
    error,
    isLoading,
    range,
    salesRows,
    setupProfile?.displayName,
    stockRows,
  ]);

  return {
    dashboard,
    isLoading,
    isEmpty: !isLoading && !error && !hasDashboardData(dashboard),
    error,
  };
}

function buildDashboard(
  stockRows: HomeStockRow[],
  salesRows: HomeSalesRow[],
  range: DashboardDateRange,
  displayName: string
): HomeDashboardModel {
  const orders = aggregateOrders(salesRows);
  const todayOrders = orders.filter((order) =>
    isWithin(order.createdAt, range.todayStart, range.tomorrowStart)
  );
  const yesterdayOrders = orders.filter((order) =>
    isWithin(order.createdAt, range.yesterdayStart, range.todayStart)
  );
  const confirmedToday = todayOrders.filter(
    (order) => order.status === "confirmed"
  );
  const confirmedYesterday = yesterdayOrders.filter(
    (order) => order.status === "confirmed"
  );

  const revenueToday = sumBy(confirmedToday, (order) => order.totalAmount);
  const revenueYesterday = sumBy(
    confirmedYesterday,
    (order) => order.totalAmount
  );
  const grossProfitToday = sumBy(confirmedToday, (order) => order.grossProfit);
  const cashSalesToday = sumBy(
    confirmedToday.filter((order) => order.paymentMethod === "cash"),
    (order) => order.totalAmount
  );
  const gcashSalesToday = sumBy(
    confirmedToday.filter((order) => order.paymentMethod === "gcash"),
    (order) => order.totalAmount
  );
  const totalUnits = sumBy(stockRows, (row) => row.quantityOnHand ?? 0);
  const weeklyBars = range.weekDays.map((day) => {
    const nextDay = addDays(day, 1);
    return {
      label: new Intl.DateTimeFormat("en-PH", { weekday: "short" }).format(day),
      value: sumBy(
        orders.filter(
          (order) =>
            order.status === "confirmed" &&
            isWithin(order.createdAt, day, nextDay)
        ),
        (order) => order.totalAmount
      ),
    };
  });
  const weeklyTotal = sumBy(weeklyBars, (bar) => bar.value);

  return {
    dateLabel: formatTodayLabel(),
    greetingLine: timeBasedGreeting(),
    displayName,
    revenueTodayDisplay:
      revenueToday > 0 ? formatCurrency(revenueToday) : EMPTY_VALUE,
    revenueChangePercent: getPercentChange(revenueToday, revenueYesterday),
    activeStockDisplay:
      stockRows.length > 0
        ? stockRows.length.toLocaleString("en-PH")
        : EMPTY_VALUE,
    activeStockSubtitle:
      stockRows.length > 0
        ? `${formatQuantity(totalUnits)} units on hand`
        : "Add products to your catalog",
    profitEstDisplay:
      confirmedToday.length > 0
        ? formatCurrency(grossProfitToday)
        : EMPTY_VALUE,
    profitEstSubtitle:
      confirmedToday.length > 0
        ? `${getMarginPercent(grossProfitToday, revenueToday)}% gross margin`
        : EMPTY_VALUE,
    gcashAmountDisplay:
      gcashSalesToday > 0 ? formatCurrency(gcashSalesToday) : EMPTY_VALUE,
    gcashChangeLabel: gcashSalesToday > 0 ? "Recorded today" : EMPTY_VALUE,
    cashSalesAmountDisplay:
      cashSalesToday > 0 ? formatCurrency(cashSalesToday) : EMPTY_VALUE,
    cashSalesShareLabel:
      revenueToday > 0
        ? `${Math.round((cashSalesToday / revenueToday) * 100)}% of today's sales`
        : EMPTY_VALUE,
    weeklyChartBars: weeklyTotal > 0 ? weeklyBars : [],
    weeklyTotalDisplay:
      weeklyTotal > 0 ? formatCurrency(weeklyTotal) : EMPTY_VALUE,
    dailyAvgDisplay:
      weeklyTotal > 0
        ? formatCurrency(weeklyTotal / range.weekDays.length)
        : EMPTY_VALUE,
    restockAlerts: buildRestockAlerts(stockRows),
    transactions: todayOrders.slice(0, 5).map((order, index) => ({
      id: order.id,
      customerName: "Walk-in Customer",
      initials: "WC",
      itemCount: order.itemCount,
      status: mapTransactionStatus(order.status),
      timeDisplay: formatTime(order.createdAt),
      amountDisplay: formatCurrency(order.totalAmount),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    })),
    transactionTotalToday: todayOrders.length,
  };
}

interface OrderAggregate {
  id: string;
  status: "draft" | "confirmed";
  paymentMethod: string | null;
  totalAmount: number;
  createdAt: Date;
  itemCount: number;
  grossProfit: number;
}

function aggregateOrders(rows: HomeSalesRow[]): OrderAggregate[] {
  const orders = new Map<string, OrderAggregate>();

  for (const row of rows) {
    const existing = orders.get(row.orderId);
    const order = existing ?? {
      id: row.orderId,
      status: row.status === "confirmed" ? "confirmed" : "draft",
      paymentMethod: row.paymentMethod,
      totalAmount: row.totalAmount,
      createdAt: row.createdAt,
      itemCount: 0,
      grossProfit: 0,
    };

    if (row.itemId) {
      const quantity = row.itemQuantity ?? 0;
      order.itemCount += quantity;
      order.grossProfit +=
        (row.itemTotal ?? 0) - (row.productCostPrice ?? 0) * quantity;
    }

    orders.set(row.orderId, order);
  }

  return [...orders.values()].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

function buildRestockAlerts(rows: HomeStockRow[]): HomeRestockAlert[] {
  return rows
    .map((row) => {
      const quantity = row.quantityOnHand ?? 0;
      const reorderPoint = row.reorderPoint ?? 0;
      return { row, quantity, reorderPoint };
    })
    .filter(({ quantity, reorderPoint }) => quantity <= reorderPoint)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 4)
    .map(({ row, quantity, reorderPoint }) => ({
      id: row.id,
      name: row.name,
      variant: row.categoryName ?? row.unit,
      unitsLeft: quantity,
      urgency: quantity <= Math.max(0, reorderPoint / 2) ? "critical" : "high",
      imageUrl: safeParseJsonArray(row.imageUrls)[0] ?? "",
    }));
}

function buildDateRange(now: Date): DashboardDateRange {
  const todayStart = startOfDay(now);
  const yesterdayStart = addDays(todayStart, -1);
  const weekStart = addDays(todayStart, -6);
  const tomorrowStart = addDays(todayStart, 1);

  return {
    weekStart,
    yesterdayStart,
    todayStart,
    tomorrowStart,
    weekDays: Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index)
    ),
  };
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWithin(date: Date, from: Date, to: Date): boolean {
  return date >= from && date < to;
}

function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function getPercentChange(today: number, yesterday: number): number {
  if (today <= 0 || yesterday <= 0) return 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

function getMarginPercent(grossProfit: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return Math.round((grossProfit / revenue) * 100);
}

function mapTransactionStatus(
  status: OrderAggregate["status"]
): HomeTransactionStatus {
  return status === "confirmed" ? "completed" : "pending";
}

function formatCurrency(value: number): string {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatQuantity(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString("en-PH")
    : value.toLocaleString("en-PH", { maximumFractionDigits: 3 });
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function safeParseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hasDashboardData(dashboard: HomeDashboardModel): boolean {
  return !(
    dashboard.revenueTodayDisplay === EMPTY_VALUE &&
    dashboard.activeStockDisplay === EMPTY_VALUE &&
    dashboard.profitEstDisplay === EMPTY_VALUE &&
    dashboard.gcashAmountDisplay === EMPTY_VALUE &&
    dashboard.cashSalesAmountDisplay === EMPTY_VALUE &&
    dashboard.weeklyChartBars.length === 0 &&
    dashboard.restockAlerts.length === 0 &&
    dashboard.transactions.length === 0
  );
}
