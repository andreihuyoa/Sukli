import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { ScreenShell } from "@/components/ui/ScreenShell";
import {
  REPORT_PERIODS,
  useReportsAnalytics,
} from "@/lib/hooks/api/reporting/useReportsAnalytics";
import type { ReportPeriod } from "@/lib/types/api/reporting";

export default function ReportsScreen() {
  const { snapshots } = useReportsAnalytics();
  const [period, setPeriod] = useState<ReportPeriod>("Monthly");
  const data = snapshots[period];

  const chartData = useMemo(() => data.chartBars, [data.chartBars]);
  const expenseShowing = data.expenses.length;
  const expenseTotal = data.expenseTotalCount;

  return (
    <View className="flex-1 bg-background">
      <ScreenShell
        bottomExtra={2}
        withHeaderOffset={false}
        horizontalPadding={0}
      >
        <View>
          <View className="px-5 pt-1 pb-3">
            <Text className="text-xs font-label uppercase tracking-widest text-muted-foreground">
              Analytics Console
            </Text>
            <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-primary">
              Performance Ledger
            </Text>
          </View>

          <View className="px-5 pb-3">
            <View
              className="flex-row rounded-full border border-border bg-surface p-1"
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
                        ? "border border-border bg-surface"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        active
                          ? "font-label text-primary"
                          : "font-body-semibold text-muted-foreground"
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
            <View className="mx-4 overflow-hidden rounded-3xl border border-border bg-surface p-5">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="mb-3 self-start rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
                    <Text className="text-[10px] font-label uppercase tracking-[0.18em] text-accent">
                      Focus score
                    </Text>
                  </View>
                  <Text className="text-xs font-label uppercase tracking-[0.2em] text-muted-foreground">
                    Total net profit
                  </Text>
                  <Text className="text-4xl font-black leading-9 tracking-[-0.2px] text-foreground">
                    {data.profitDisplay}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full border border-success bg-success/12 px-3 py-2">
                  <AppIcon
                    name="trending_up"
                    size={14}
                    className="text-success"
                    strokeWidth={2.5}
                  />
                  <Text className="text-[13px] font-label text-success">
                    {data.profitChangeDisplay}
                  </Text>
                </View>
              </View>

              <View>
                <View className="mb-2 flex-row items-end justify-between">
                  <Text className="text-[13px] font-body-semibold text-muted-foreground">
                    Sales Velocity vs Forecast
                  </Text>
                  <Text className="text-[13px] font-label text-foreground">
                    {data.targetProgressPercent}% Target reached
                  </Text>
                </View>
                <View className="h-2 w-full overflow-hidden rounded-full bg-surface">
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
              <View className="w-[120px] rounded-2xl border border-border bg-surface p-3">
                <Text className="mb-2 text-xs font-label uppercase tracking-[0.1em] text-muted-foreground">
                  Avg. Order
                </Text>
                <Text className="mb-1.5 text-lg font-black leading-[22px] text-primary">
                  {data.aovDisplay}
                </Text>
                <Text className="text-xs font-body-semibold text-muted-foreground">
                  -
                </Text>
              </View>
            </Entrance>

            <Entrance delayMs={150}>
              <View className="flex-1 rounded-2xl border border-border bg-surface p-3">
                <Text className="mb-[10px] text-xs font-label uppercase tracking-[0.1em] text-muted-foreground">
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
                  <Text className="py-6 text-xs font-body-semibold text-muted-foreground">
                    No trend data yet.
                  </Text>
                )}
              </View>
            </Entrance>
          </View>

          <Entrance delayMs={200}>
            <View className="mx-4 mb-4 rounded-2xl border border-border bg-surface p-4">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base font-body-semibold tracking-[-0.2px] text-foreground">
                  High Velocity Items
                </Text>
                <AppIcon
                  name="trending_up"
                  size={16}
                  className="text-primary"
                  strokeWidth={2}
                />
              </View>
              {data.velocityItems.length === 0 ? (
                <Text className="text-[13px] font-body-semibold text-muted-foreground">
                  No velocity metrics yet.
                </Text>
              ) : (
                <View className="gap-[10px]">
                  {data.velocityItems.map((item, index) => (
                    <View key={`${item.name}-${index}`}>
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-sm font-body-semibold text-foreground">
                          {item.name}
                        </Text>
                        <Text className="text-xs font-body-semibold text-muted-foreground">
                          {item.progressPercent}% Sold
                        </Text>
                      </View>
                      <View className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
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
            <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
              <View className="flex-row items-center justify-between border-b border-border/20 px-4 pb-3 pt-4">
                <Text className="text-base font-body-semibold tracking-[-0.2px] text-foreground">
                  Expense Ledger
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Export PDF"
                  onPress={() => {}}
                  className="flex-row items-center gap-2"
                >
                  <Text className="text-xs font-label text-primary">
                    Export PDF
                  </Text>
                  <AppIcon
                    name="download"
                    size={14}
                    className="text-primary"
                    strokeWidth={2.5}
                  />
                </Pressable>
              </View>

              <View className="px-4 py-3">
                {data.expenses.length === 0 ? (
                  <Text className="py-2 text-[13px] font-body-semibold text-muted-foreground">
                    No expenses loaded.
                  </Text>
                ) : (
                  data.expenses.map((expense, index) => (
                    <View key={expense.id}>
                      {index > 0 ? (
                        <View className="my-2 h-px bg-border/20" />
                      ) : null}
                      <View className="flex-row items-center gap-3 py-2">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <AppIcon
                            name={expense.icon as AppIconName}
                            size={16}
                            className="text-primary"
                            strokeWidth={1.8}
                          />
                        </View>
                        <View className="min-w-0 flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-sm font-body-semibold text-foreground"
                          >
                            {expense.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            className="text-xs font-body-semibold text-muted-foreground"
                          >
                            {expense.subtitle}
                          </Text>
                        </View>
                        <View className="w-[120px] items-end">
                          <Text className="text-[13px] font-label text-destructive">
                            {expense.amountDisplay}
                          </Text>
                          <Text className="mt-1 text-[10px] font-label uppercase tracking-[0.1em] text-muted-foreground">
                            {expense.tag}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View className="flex-row items-center justify-between bg-surface-muted px-4 py-3">
                <Text className="text-xs font-body-semibold text-muted-foreground">
                  {expenseTotal > 0
                    ? `Showing ${expenseShowing} of ${expenseTotal} expenses`
                    : "No expense totals from API yet"}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Previous"
                    onPress={() => {}}
                    className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
                  >
                    <AppIcon
                      name="chevron_left"
                      size={13}
                      className="text-muted-foreground"
                      strokeWidth={2.5}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next"
                    onPress={() => {}}
                    className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
                  >
                    <AppIcon
                      name="chevron_right"
                      size={13}
                      className="text-muted-foreground"
                      strokeWidth={2.5}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </Entrance>
        </View>
      </ScreenShell>
    </View>
  );
}
