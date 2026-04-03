import type { ChartBarPoint } from "./common";

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
