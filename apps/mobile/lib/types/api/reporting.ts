export interface ChartBarPoint {
  label: string;
  value: number;
}

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

export type ReportPeriod = "Monthly" | "Quarterly" | "Yearly";

export interface ReportVelocityRow {
  name: string;
  /** 0–100 share sold vs forecast, or API-defined metric */
  progressPercent: number;
}

/** Icon key aligned with `AppIcon` names; validated when wiring API responses */
export interface ReportExpenseRow {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  amountDisplay: string;
  tag: string;
}

export interface ReportPeriodSnapshot {
  chartBars: ChartBarPoint[];
  profitDisplay: string;
  aovDisplay: string;
  /** 0–100 progress toward target */
  targetProgressPercent: number;
  profitChangeDisplay: string;
  velocityItems: ReportVelocityRow[];
  expenses: ReportExpenseRow[];
  expenseTotalCount: number;
}

export interface RestockSuggestion {
  id: string;
  name: string;
  /** Secondary line e.g. "4 kg" — optional detail from API */
  detailDisplay: string;
  suggestedQty: number;
  critical: boolean;
  imageUrl: string;
  /** Estimated line total in PHP for selected-qty calculations */
  estimatedLineTotalPhp: number;
}

export interface RestockInsight {
  title: string;
  body: string;
  criticalCount: number;
}
