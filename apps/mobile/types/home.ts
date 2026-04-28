import type { ChartBarPoint } from "./common";

export type HomeRestockUrgency = "high" | "critical";

export interface HomeRestockAlert {
  id: string;
  name: string;
  variant: string;
  unitsLeft: number;
  urgency: HomeRestockUrgency;
  imageUrl: string;
}

export type HomeTransactionStatus = "completed" | "pending";

export interface HomeTransaction {
  id: string;
  customerName: string;
  initials: string;
  itemCount: number;
  status: HomeTransactionStatus;
  timeDisplay: string;
  amountDisplay: string;
  avatarColor: string;
}

export interface HomeDashboardModel {
  dateLabel: string;
  greetingLine: string;
  displayName: string;
  revenueTodayDisplay: string;
  revenueChangePercent: number;
  activeStockDisplay: string;
  activeStockSubtitle: string;
  profitEstDisplay: string;
  profitEstSubtitle: string;
  gcashAmountDisplay: string;
  gcashChangeLabel: string;
  cashSalesAmountDisplay: string;
  cashSalesShareLabel: string;
  weeklyChartBars: ChartBarPoint[];
  weeklyTotalDisplay: string;
  dailyAvgDisplay: string;
  restockAlerts: HomeRestockAlert[];
  transactions: HomeTransaction[];
  transactionTotalToday: number;
}
