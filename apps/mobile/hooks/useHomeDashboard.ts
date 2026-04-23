import { useMemo } from "react";

import type { HomeDashboardModel } from "@/types";

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
    greetingLine: `${timeBasedGreeting()} 👋`,
    revenueTodayDisplay: "—",
    revenueChangePercent: 0,
    activeStockDisplay: "—",
    activeStockSubtitle: "Connect your catalog",
    profitEstDisplay: "—",
    profitEstSubtitle: "—",
    gcashAmountDisplay: "—",
    gcashChangeLabel: "—",
    cashSalesAmountDisplay: "—",
    cashSalesShareLabel: "—",
    weeklyChartBars: [],
    weeklyTotalDisplay: "—",
    dailyAvgDisplay: "—",
    restockAlerts: [],
    transactions: [],
    transactionTotalToday: 0,
  };
}

export interface UseHomeDashboardResult {
  dashboard: HomeDashboardModel;
  error: Error | null;
}

export function useHomeDashboard(): UseHomeDashboardResult {
  const dashboard = useMemo(() => emptyDashboard(), []);
  return { dashboard, error: null };
}
