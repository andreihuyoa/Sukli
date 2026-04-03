import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { REPORT_PERIODS, useReportsAnalytics } from "@/hooks/useReportsAnalytics";
import type { ReportPeriod } from "@/types";

export function ReportsScreen() {
  const { snapshots } = useReportsAnalytics();
  const [period, setPeriod] = useState<ReportPeriod>("Monthly");
  const data = snapshots[period];

  const chartData = useMemo(() => data.chartBars, [data.chartBars]);

  const expenseShowing = data.expenses.length;
  const expenseTotal = data.expenseTotalCount;

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <AppHeader />

      <View className="pt-4">
        <View className="px-5 pt-2 pb-3">
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8e8e93" }}>
            Analytics Console
          </Text>
          <Text style={{ color: "#1b4332", fontSize: 30, fontWeight: "900", letterSpacing: -0.2, lineHeight: 34 }}>
            Performance Ledger
          </Text>
        </View>

        <View className="px-5 pb-3">
          <View
            className="flex-row rounded-full p-1"
            style={{ backgroundColor: "rgba(255,255,255,0.6)", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8 }}
          >
            {REPORT_PERIODS.map((p) => {
              const active = p === period;
              return (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${p}`}
                  onPress={() => setPeriod(p)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: active ? "#fff" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: active ? "900" : "800", color: active ? "#1b4332" : "#8e8e93" }}>{p}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Entrance delayMs={80}>
          <View
            className="mx-4 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "#2d6a4f",
              padding: 20,
              borderRadius: 24,
            }}
          >
            <View className="flex-row items-start justify-between mb-4">
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>
                  Total Net Profit
                </Text>
                <Text style={{ color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -0.2, lineHeight: 36 }}>{data.profitDisplay}</Text>
              </View>
              <View
                className="flex-row items-center gap-1 px-3 py-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
              >
                <AppIcon name="trending_up" size={14} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 13 }}>{data.profitChangeDisplay}</Text>
              </View>
            </View>

            <View>
              <View className="flex-row items-end justify-between mb-2">
                <Text style={{ color: "rgba(255,255,255,0.65)", fontWeight: "600", fontSize: 13 }}>Sales Velocity vs Forecast</Text>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 13 }}>{data.targetProgressPercent}% Target reached</Text>
              </View>
              <View style={{ width: "100%", height: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                <View
                  style={{
                    width: `${Math.min(100, Math.max(0, data.targetProgressPercent))}%`,
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          </View>
        </Entrance>

        <View className="flex-row gap-3 mx-4 mb-4" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Entrance delayMs={120}>
            <View className="w-[120px] rounded-2xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.82)" }}>
              <Text style={{ color: "#8e8e93", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 12, marginBottom: 8 }}>Avg. Order</Text>
              <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 18, lineHeight: 22, marginBottom: 6 }}>{data.aovDisplay}</Text>
              <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}>—</Text>
            </View>
          </Entrance>

          <Entrance delayMs={150}>
            <View className="flex-1 rounded-2xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.82)" }}>
              <Text style={{ color: "#8e8e93", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 12, marginBottom: 10 }}>Sales Trends</Text>
              {chartData.length > 0 ? (
                <BarChart data={chartData} highlightLastTwo barAreaHeight={70} enableSelection={false} />
              ) : (
                <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12, paddingVertical: 24 }}>No trend data yet.</Text>
              )}
            </View>
          </Entrance>
        </View>

        <Entrance delayMs={200}>
          <View className="mx-4 mb-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.82)" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>High Velocity Items</Text>
              <AppIcon name="trending_up" size={16} color="#1b4332" strokeWidth={2} />
            </View>
            {data.velocityItems.length === 0 ? (
              <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 13 }}>No velocity metrics yet.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {data.velocityItems.map((item, i) => (
                  <View key={`${item.name}-${i}`}>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: "#8e8e93", fontWeight: "700", fontSize: 12 }}>{item.progressPercent}% Sold</Text>
                    </View>
                    <View style={{ width: "100%", height: 6, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                      <View
                        style={{
                          width: `${Math.min(100, Math.max(0, item.progressPercent))}%`,
                          height: "100%",
                          backgroundColor: "#2d6a4f",
                          opacity: 0.7 + i * 0.08,
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
          <View className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.82)" }}>
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)" }}>
              <Text style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>Expense Ledger</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Export PDF" onPress={() => {}} className="flex-row items-center gap-2">
                <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 12 }}>Export PDF</Text>
                <AppIcon name="download" size={14} color="#1b4332" strokeWidth={2.5} />
              </Pressable>
            </View>

            <View className="px-4 py-3">
              {data.expenses.length === 0 ? (
                <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 13, paddingVertical: 8 }}>No expenses loaded.</Text>
              ) : (
                data.expenses.map((expense, idx) => (
                  <View key={expense.id}>
                    {idx > 0 ? <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.04)", marginVertical: 8 }} /> : null}
                    <View className="flex-row items-center gap-3 py-2">
                      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(27,67,50,0.08)" }}>
                        <AppIcon name={expense.icon as AppIconName} size={16} color="#1b4332" strokeWidth={1.8} />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 14 }}>
                          {expense.title}
                        </Text>
                        <Text numberOfLines={1} style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}>
                          {expense.subtitle}
                        </Text>
                      </View>
                      <View className="items-end" style={{ width: 120 }}>
                        <Text style={{ color: "#ba1a1a", fontWeight: "900", fontSize: 13 }}>{expense.amountDisplay}</Text>
                        <Text style={{ color: "#8e8e93", fontWeight: "800", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>
                          {expense.tag}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View className="flex-row items-center justify-between px-4 py-3" style={{ backgroundColor: "rgba(242,242,247,0.6)" }}>
              <Text style={{ color: "#8e8e93", fontWeight: "700", fontSize: 12 }}>
                {expenseTotal > 0
                  ? `Showing ${expenseShowing} of ${expenseTotal} expenses`
                  : "No expense totals from API yet"}
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous"
                  onPress={() => {}}
                  className="h-9 w-9 rounded-full items-center justify-center"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <AppIcon name="chevron_left" size={13} color="#8e8e93" strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next"
                  onPress={() => {}}
                  className="h-9 w-9 rounded-full items-center justify-center"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <AppIcon name="chevron_right" size={13} color="#8e8e93" strokeWidth={2.5} />
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
