import type {
  ReportPeriod,
  ReportPeriodSnapshot,
} from "@/lib/types/api/reporting";

export const REPORT_PERIODS = [
  "Monthly",
  "Quarterly",
  "Yearly",
] as const satisfies readonly ReportPeriod[];

function emptySnapshot(): ReportPeriodSnapshot {
  return {
    chartBars: [],
    profitDisplay: "—",
    aovDisplay: "—",
    targetProgressPercent: 0,
    profitChangeDisplay: "—",
    velocityItems: [],
    expenses: [],
    expenseTotalCount: 0,
  };
}

export interface UseReportsAnalyticsResult {
  snapshots: Record<ReportPeriod, ReportPeriodSnapshot>;
  isLoading: boolean;
  error: Error | null;
}

export function useReportsAnalytics(): UseReportsAnalyticsResult {
  const empty = emptySnapshot();
  return {
    snapshots: {
      Monthly: empty,
      Quarterly: empty,
      Yearly: empty,
    },
    isLoading: false,
    error: null,
  };
}
