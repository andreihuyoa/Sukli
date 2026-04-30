import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import {
  REPORT_PERIODS,
  useReportsAnalytics,
} from "@/lib/hooks/api/reporting/useReportsAnalytics";
import type { ReportPeriod } from "@/lib/types/api/reporting";

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { snapshots } = useReportsAnalytics();
  const [period, setPeriod] = useState<ReportPeriod>("Monthly");
  const data = snapshots[period];

  const chartData = useMemo(() => data.chartBars, [data.chartBars]);
  const expenseShowing = data.expenses.length;
  const expenseTotal = data.expenseTotalCount;

  return (
    <View
      className="flex-1 bg-screen-grouped"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="pt-4">
        <View className="px-5 pt-2 pb-3">
          <Text className="text-xs font-label font-bold uppercase tracking-widest text-label-muted">
            Analytics Console
          </Text>
          <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-forest">
            Performance Ledger
          </Text>
        </View>

        <View className="px-5 pb-3">
          <View
            className="flex-row rounded-full border border-outline bg-glass-surface p-1"
            style={{
              shadowColor: "#a99f8f",
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}
          >
            {REPORT_PERIODS.map((value) => {
              const active = value === period;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${value}`}
                  onPress={() => setPeriod(value)}
                  className={`flex-1 items-center justify-center rounded-full py-2.5 ${
                    active
                      ? "border border-outline bg-surface-container"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      active
                        ? "font-label font-bold text-forest"
                        : "font-body font-bold text-label-muted"
                    }`}
                  >
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Entrance delayMs={80}>
          <View className="mx-4 overflow-hidden rounded-3xl border border-outline bg-glass-surface p-5">
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1">
                <View className="mb-3 self-start rounded-full border border-accent-focus-border bg-accent-focus-soft px-3 py-1.5">
                  <Text className="text-[10px] font-label font-bold uppercase tracking-[0.18em] text-accent-focus">
                    Focus score
                  </Text>
                </View>
                <Text className="text-xs font-label font-bold uppercase tracking-[0.2em] text-label-muted">
                  Total net profit
                </Text>
                <Text className="text-4xl font-black leading-9 tracking-[-0.2px] text-label-primary">
                  {data.profitDisplay}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full border border-status-completed-dot bg-status-completed-bg px-3 py-2">
                <AppIcon
                  name="trending_up"
                  size={14}
                  className="text-status-completed-text"
                  strokeWidth={2.5}
                />
                <Text className="text-[13px] font-label font-bold text-status-completed-text">
                  {data.profitChangeDisplay}
                </Text>
              </View>
            </View>

            <View>
              <View className="mb-2 flex-row items-end justify-between">
                <Text className="text-[13px] font-body-semibold text-label-muted">
                  Sales Velocity vs Forecast
                </Text>
                <Text className="text-[13px] font-label font-bold text-label-primary">
                  {data.targetProgressPercent}% Target reached
                </Text>
              </View>
              <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <View
                  style={{
                    width: `${Math.min(100, Math.max(0, data.targetProgressPercent))}%`,
                    height: "100%",
                    backgroundColor: "#5f7d67",
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          </View>
        </Entrance>

        <View className="mx-4 mb-4 flex-row gap-3">
          <Entrance delayMs={120}>
            <View className="w-[120px] rounded-2xl border border-outline bg-glass-surface p-3">
              <Text className="mb-2 text-xs font-label font-bold uppercase tracking-[0.1em] text-label-muted">
                Avg. Order
              </Text>
              <Text className="mb-1.5 text-lg font-black leading-[22px] text-forest">
                {data.aovDisplay}
              </Text>
              <Text className="text-xs font-body-semibold text-label-muted">
                —
              </Text>
            </View>
          </Entrance>

          <Entrance delayMs={150}>
            <View className="flex-1 rounded-2xl border border-outline bg-glass-surface p-3">
              <Text className="mb-[10px] text-xs font-label font-bold uppercase tracking-[0.1em] text-label-muted">
                Sales Trends
              </Text>
              {chartData.length > 0 ? (
                <BarChart
                  data={chartData}
                  highlightLastTwo
                  barAreaHeight={70}
                  enableSelection={false}
                />
              ) : (
                <Text className="py-6 text-xs font-body-semibold text-label-muted">
                  No trend data yet.
                </Text>
              )}
            </View>
          </Entrance>
        </View>

        <Entrance delayMs={200}>
          <View className="mx-4 mb-4 rounded-2xl border border-outline bg-glass-surface p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-body font-bold tracking-[-0.2px] text-label-primary">
                High Velocity Items
              </Text>
              <AppIcon
                name="trending_up"
                size={16}
                className="text-forest"
                strokeWidth={2}
              />
            </View>
            {data.velocityItems.length === 0 ? (
              <Text className="text-[13px] font-body-semibold text-label-muted">
                No velocity metrics yet.
              </Text>
            ) : (
              <View className="gap-[10px]">
                {data.velocityItems.map((item, index) => (
                  <View key={`${item.name}-${index}`}>
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-sm font-body font-bold text-label-primary">
                        {item.name}
                      </Text>
                      <Text className="text-xs font-body font-bold text-label-muted">
                        {item.progressPercent}% Sold
                      </Text>
                    </View>
                    <View className="h-1.5 w-full overflow-hidden rounded-full bg-overlay-muted">
                      <View
                        style={{
                          width: `${Math.min(100, Math.max(0, item.progressPercent))}%`,
                          height: "100%",
                          backgroundColor: "#204e2b",
                          opacity: 0.7 + index * 0.08,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Entrance>

        <Entrance delayMs={260}>
          <View className="mx-4 overflow-hidden rounded-2xl border border-outline bg-glass-surface">
            <View className="flex-row items-center justify-between border-b border-separator-subtle px-4 pb-3 pt-4">
              <Text className="text-base font-body font-bold tracking-[-0.2px] text-label-primary">
                Expense Ledger
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Export PDF"
                onPress={() => {}}
                className="flex-row items-center gap-2"
              >
                <Text className="text-xs font-label font-bold text-forest">
                  Export PDF
                </Text>
                <AppIcon
                  name="download"
                  size={14}
                  className="text-forest"
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>

            <View className="px-4 py-3">
              {data.expenses.length === 0 ? (
                <Text className="py-2 text-[13px] font-body-semibold text-label-muted">
                  No expenses loaded.
                </Text>
              ) : (
                data.expenses.map((expense, index) => (
                  <View key={expense.id}>
                    {index > 0 ? (
                      <View className="my-2 h-px bg-separator-subtle" />
                    ) : null}
                    <View className="flex-row items-center gap-3 py-2">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-forest-alpha-10">
                        <AppIcon
                          name={expense.icon as AppIconName}
                          size={16}
                          className="text-forest"
                          strokeWidth={1.8}
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-sm font-body font-bold text-label-primary"
                        >
                          {expense.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-xs font-body-semibold text-label-muted"
                        >
                          {expense.subtitle}
                        </Text>
                      </View>
                      <View className="w-[120px] items-end">
                        <Text className="text-[13px] font-label font-bold text-destructive">
                          {expense.amountDisplay}
                        </Text>
                        <Text className="mt-1 text-[10px] font-label font-bold uppercase tracking-[0.1em] text-label-muted">
                          {expense.tag}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View className="flex-row items-center justify-between bg-table-header-bg px-4 py-3">
              <Text className="text-xs font-body font-bold text-label-muted">
                {expenseTotal > 0
                  ? `Showing ${expenseShowing} of ${expenseTotal} expenses`
                  : "No expense totals from API yet"}
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous"
                  onPress={() => {}}
                  className="h-9 w-9 items-center justify-center rounded-full border border-outline bg-surface-container"
                >
                  <AppIcon
                    name="chevron_left"
                    size={13}
                    className="text-label-muted"
                    strokeWidth={2.5}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next"
                  onPress={() => {}}
                  className="h-9 w-9 items-center justify-center rounded-full border border-outline bg-surface-container"
                >
                  <AppIcon
                    name="chevron_right"
                    size={13}
                    className="text-label-muted"
                    strokeWidth={2.5}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </Entrance>
      </View>
    </View>
  );
}

export default ReportsScreen;
