import type { HomeDashboardModel } from "@/lib/types/api/reporting";

export function formatPesoDisplay(value: string): string {
  if (value === "—" || value.startsWith("₱")) return value;
  return `₱${value}`;
}

export function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim();
  return normalized === "—" || normalized === "-";
}

export function hasDashboardData(dashboard: HomeDashboardModel): boolean {
  return !(
    isPlaceholderValue(dashboard.revenueTodayDisplay) &&
    isPlaceholderValue(dashboard.activeStockDisplay) &&
    isPlaceholderValue(dashboard.profitEstDisplay) &&
    isPlaceholderValue(dashboard.gcashAmountDisplay) &&
    isPlaceholderValue(dashboard.cashSalesAmountDisplay) &&
    dashboard.weeklyChartBars.length === 0 &&
    dashboard.restockAlerts.length === 0 &&
    dashboard.transactions.length === 0
  );
}
