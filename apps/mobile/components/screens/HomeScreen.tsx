import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { BarChart } from "@/components/charts/BarChart";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import type { ChartBarPoint, HomeRestockAlert, HomeTransaction } from "@/types";

const GLASS = {
  backgroundColor: "rgba(255,255,255,0.82)",
};

function formatPesoDisplay(value: string): string {
  if (value === "—" || value.startsWith("₱")) return value;
  return `₱${value}`;
}

const statusConfig = {
  completed: { bg: "rgba(27,67,50,0.08)", color: "#1b4332", dot: "#34c759", label: "Completed" },
  pending: { bg: "rgba(255,159,10,0.12)", color: "#c97700", dot: "#ff9f0a", label: "Pending" },
};

function MetricCard(props: {
  iconKey: AppIconName;
  label: string;
  value: string;
  subtitle: string;
  delayMs?: number;
  accentColor: string;
}) {
  const { iconKey, label, value, subtitle, delayMs = 0, accentColor } = props;

  return (
    <Entrance delayMs={delayMs}>
      <View
        className="flex-1 rounded-2xl p-4"
        style={{
          backgroundColor: GLASS.backgroundColor,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
        }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="h-8 w-8 rounded-xl items-center justify-center" style={{ backgroundColor: `${accentColor}14` }}>
            <AppIcon name={iconKey} size={18} color={accentColor} strokeWidth={2} />
          </View>

          <Text className="text-[10px] font-label font-bold uppercase tracking-widest" style={{ color: "#8e8e93" }}>
            {label}
          </Text>
        </View>

        <Text
          className="mb-0.5"
          style={{
            color: "#1c1c1e",
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.2,
            lineHeight: 32,
          }}
        >
          {value}
        </Text>
        <Text className="text-[11px] font-body font-medium" style={{ color: "#8e8e93" }}>
          {subtitle}
        </Text>
      </View>
    </Entrance>
  );
}

function RevenueHeroCard(props: {
  amountDisplay: string;
  percentChange: number;
  onAddSale?: () => void;
  onAddProduct?: () => void;
}) {
  const { amountDisplay, percentChange, onAddSale, onAddProduct } = props;

  return (
    <Entrance>
      <View
        className="mx-4 rounded-3xl overflow-hidden"
        style={{
          backgroundColor: "#2d6a4f",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 20,
        }}
      >
        <Text className="text-[10px] font-label font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
          Today&apos;s Revenue
        </Text>

        <Text
          style={{
            color: "#fff",
            fontSize: 42,
            fontWeight: "900",
            letterSpacing: -0.6,
            lineHeight: 44,
          }}
        >
          {formatPesoDisplay(amountDisplay)}
        </Text>

        <View
          className="flex-row items-center gap-1.5 px-3 py-1 rounded-full mt-3 self-start"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <AppIcon name="trending_up" size={14} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
          <Text className="text-[11px] font-body font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
            {percentChange === 0 ? "No comparison data" : `+${percentChange}% from yesterday`}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-5">
          <Pressable
            accessibilityRole="button"
            onPress={onAddSale}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
          >
            <AppIcon name="add" size={16} color="#1b4332" strokeWidth={2.5} />
            <Text className="text-[13px] font-body font-bold" style={{ color: "#1b4332" }}>
              Add Sale
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onAddProduct}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.28)",
            }}
          >
            <AppIcon name="add_box" size={16} color="#fff" strokeWidth={2} />
            <Text className="text-[13px] font-body font-bold" style={{ color: "#fff" }}>
              Add Product
            </Text>
          </Pressable>
        </View>
      </View>
    </Entrance>
  );
}

function GCashRevenueCard(props: { amountDisplay: string; changeLabel: string }) {
  const { amountDisplay, changeLabel } = props;
  return (
    <Entrance delayMs={80}>
      <View
        className="flex-1 rounded-2xl p-4"
        style={{
          backgroundColor: "#0070e0",
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
        }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="h-8 w-8 rounded-xl items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            <AppIcon name="smartphone" size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text className="text-[10px] font-label font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>
            GCash
          </Text>
        </View>

        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.4,
            lineHeight: 30,
          }}
        >
          {formatPesoDisplay(amountDisplay)}
        </Text>

        <View className="flex-row items-center gap-1 mt-2">
          <AppIcon name="trending_up" size={12} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
          <Text className="text-[11px] font-body font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
            {changeLabel}
          </Text>
        </View>
      </View>
    </Entrance>
  );
}

function WeeklyTrendCard(props: { bars: ChartBarPoint[]; weeklyTotalDisplay: string; dailyAvgDisplay: string }) {
  const { bars, weeklyTotalDisplay, dailyAvgDisplay } = props;

  return (
    <Entrance delayMs={120}>
      <View
        className="mx-4 rounded-2xl p-4 pb-2"
        style={{
          backgroundColor: GLASS.backgroundColor,
          borderRadius: 16,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 rounded-lg items-center justify-center" style={{ backgroundColor: "#1b433214" }}>
              <AppIcon name="check" size={14} color="#1b4332" strokeWidth={2.5} />
            </View>
            <Text className="text-[10px] font-label font-bold uppercase tracking-widest" style={{ color: "#8e8e93" }}>
              Weekly Trend
            </Text>
          </View>
          <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: "#1b433210" }}>
            <Text className="text-[10px] font-label font-bold uppercase" style={{ color: "#1b4332" }}>
              This Week
            </Text>
          </View>
        </View>

        {bars.length > 0 ? (
          <BarChart data={bars} highlightLastTwo barAreaHeight={110} enableSelection />
        ) : (
          <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 13, paddingVertical: 32, textAlign: "center" }}>
            No weekly sales data yet.
          </Text>
        )}

        <View className="flex-row items-center justify-between pt-2 pb-1 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <View>
            <Text className="text-[11px] font-body font-medium" style={{ color: "#8e8e93" }}>
              Weekly Total
            </Text>
            <Text className="text-sm font-headline font-bold" style={{ color: "#1c1c1e" }}>
              {formatPesoDisplay(weeklyTotalDisplay)}
            </Text>
          </View>
          <View>
            <Text className="text-[11px] font-body font-medium" style={{ color: "#8e8e93" }}>
              Daily Avg
            </Text>
            <Text className="text-sm font-headline font-bold" style={{ color: "#1c1c1e" }}>
              {formatPesoDisplay(dailyAvgDisplay)}
            </Text>
          </View>
        </View>
      </View>
    </Entrance>
  );
}

function RestockAlertsCard(props: { alerts: HomeRestockAlert[] }) {
  const { alerts } = props;

  return (
    <Entrance delayMs={160}>
      <View className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: GLASS.backgroundColor, borderRadius: 16 }}>
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <View className="flex-row items-center gap-2">
            <AppIcon name="warning" size={16} color="#ff9f0a" strokeWidth={2.5} />
            <Text className="text-base font-body font-bold" style={{ color: "#1c1c1e" }}>
              Restock Required
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#ff9f0a18", borderWidth: 0 }}>
            <Text className="text-[11px] font-body font-bold" style={{ color: "#c97700" }}>
              {alerts.length} Alerts
            </Text>
          </View>
        </View>

        {alerts.length === 0 ? (
          <View className="px-4 pb-4">
            <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 13 }}>All stock levels look good.</Text>
          </View>
        ) : (
          <View>
            {alerts.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginHorizontal: 16 }} /> : null}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                    <ImageWithFallback src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%" }} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text numberOfLines={1} style={{ color: "#1c1c1e", fontSize: 15, fontWeight: "700" }}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: item.urgency === "critical" ? "#ff3b30" : "#ff9f0a",
                        }}
                      />
                      <Text className="text-[11px] font-body font-medium" style={{ color: "#8e8e93" }}>
                        {item.unitsLeft} units left · {item.variant}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center gap-1 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "#2d6a4f", marginLeft: 8 }}
                  >
                    <Text className="text-xs font-body font-bold" style={{ color: "#fff" }}>
                      Quick Reorder
                    </Text>
                    <AppIcon name="chevron_right" size={12} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          className="w-full flex-row items-center justify-center gap-2 py-3 border-t"
          style={{ borderColor: "rgba(0,0,0,0.06)", marginTop: 4 }}
        >
          <Text className="text-sm font-body font-bold" style={{ color: "#2d6a4f" }}>
            View All Stock Alerts
          </Text>
          <AppIcon name="chevron_right" size={14} color="#2d6a4f" strokeWidth={2.5} />
        </Pressable>
      </View>
    </Entrance>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View className="h-9 w-9 rounded-full items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
      <Text className="text-[11px] font-body font-bold" style={{ color: "#fff" }}>
        {initials}
      </Text>
    </View>
  );
}

function RecentTransactionsCard(props: { transactions: HomeTransaction[]; totalToday: number }) {
  const { transactions, totalToday } = props;

  return (
    <Entrance delayMs={190}>
      <View className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: GLASS.backgroundColor, borderRadius: 16 }}>
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <Text style={{ color: "#1c1c1e", fontSize: 16, fontWeight: "700" }}>Recent Transactions</Text>
          <Pressable accessibilityRole="button" className="flex-row items-center gap-1" style={{ gap: 4 }}>
            <Text className="text-sm font-body font-bold" style={{ color: "#2d6a4f" }}>
              View All
            </Text>
            <AppIcon name="chevron_right" size={14} color="#2d6a4f" strokeWidth={2.5} />
          </Pressable>
        </View>

        <View className="flex-row items-center px-4 py-2" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
          <Text className="flex-1 text-[10px] font-label font-bold uppercase" style={{ color: "#8e8e93" }}>
            Customer
          </Text>
          <Text className="w-16 text-center text-[10px] font-label font-bold uppercase" style={{ color: "#8e8e93" }}>
            Items
          </Text>
          <Text className="w-24 text-right text-[10px] font-label font-bold uppercase" style={{ color: "#8e8e93" }}>
            Status
          </Text>
        </View>

        {transactions.length === 0 ? (
          <View className="px-4 py-6">
            <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 13 }}>No transactions for this period.</Text>
          </View>
        ) : (
          <View>
            {transactions.map((tx, index) => {
              const status = statusConfig[tx.status];
              return (
                <View key={tx.id}>
                  {index > 0 ? <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.05)", marginHorizontal: 16 }} /> : null}
                  <View className="flex-row items-center gap-3 px-4 py-3">
                    <Avatar initials={tx.initials} color={tx.avatarColor} />
                    <View className="flex-1 min-w-0">
                      <Text numberOfLines={1} style={{ color: "#1c1c1e", fontSize: 14, fontWeight: "600" }}>
                        {tx.customerName}
                      </Text>
                      <Text className="text-xs font-body font-medium" style={{ color: "#aeaeb2" }}>
                        {tx.timeDisplay}
                      </Text>
                    </View>

                    <View className="w-16 items-center">
                      <Text className="text-xs font-body font-bold" style={{ color: "#3c3c43" }}>
                        {tx.itemCount} {tx.itemCount === 1 ? "item" : "items"}
                      </Text>
                    </View>

                    <View className="w-24 flex-row justify-end">
                      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
                        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                        <Text className="text-xs font-body font-bold" style={{ color: status.color }}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="flex-row items-center justify-between px-4 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <Text className="text-xs font-body font-medium" style={{ color: "#8e8e93" }}>
            {totalToday > 0
              ? `Showing ${transactions.length} of ${totalToday} transactions today`
              : "Connect POS to see live transactions"}
          </Text>
          <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: "#1b433210", alignItems: "center" }}>
            <Text className="text-xs font-body font-bold" style={{ color: "#1b4332" }}>
              Today
            </Text>
          </View>
        </View>
      </View>
    </Entrance>
  );
}

export function HomeScreen() {
  const { dashboard } = useHomeDashboard();
  const handleRefresh = () => {};

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <AppHeader onRefresh={handleRefresh} />
      <ScreenShell>
        <View className="flex-col">
          <View className="pb-4">
            <Text className="text-xs font-body font-medium" style={{ color: "#8e8e93", fontWeight: 500 }}>
              {dashboard.dateLabel}
            </Text>
            <Text className="mt-1" style={{ color: "#1c1c1e", fontSize: 18, fontWeight: 800 }}>
              {dashboard.greetingLine}
            </Text>
          </View>

          <RevenueHeroCard
            amountDisplay={dashboard.revenueTodayDisplay}
            percentChange={dashboard.revenueChangePercent}
          />

          <View className="flex-row gap-3 mx-4 mb-4">
            <MetricCard
              iconKey="inventory_2"
              label="Active Stock"
              value={dashboard.activeStockDisplay}
              subtitle={dashboard.activeStockSubtitle}
              delayMs={50}
              accentColor="#1b4332"
            />
            <MetricCard
              iconKey="payments"
              label="Profit Est."
              value={dashboard.profitEstDisplay}
              subtitle={dashboard.profitEstSubtitle}
              delayMs={100}
              accentColor="#2d6a4f"
            />
          </View>

          <View className="flex-row gap-3 mx-4 mb-4">
            <GCashRevenueCard amountDisplay={dashboard.gcashAmountDisplay} changeLabel={dashboard.gcashChangeLabel} />
            <View className="flex-1 rounded-2xl p-4 justify-between" style={{ backgroundColor: GLASS.backgroundColor, borderRadius: 16 }}>
              <View className="flex-row items-start justify-between">
                <View className="h-8 w-8 rounded-xl items-center justify-center" style={{ backgroundColor: "#1b433214" }}>
                  <View className="h-3 w-3 rounded-full" style={{ borderWidth: 2, borderColor: "#1b4332" }} />
                </View>
                <Text className="text-[10px] font-label font-bold uppercase tracking-[0.2em]" style={{ color: "#8e8e93", letterSpacing: 2 }}>
                  Cash Sales
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#1c1c1e",
                    letterSpacing: -0.3,
                    lineHeight: 30,
                  }}
                >
                  {formatPesoDisplay(dashboard.cashSalesAmountDisplay)}
                </Text>
                <Text className="text-xs font-body font-medium" style={{ color: "#8e8e93", fontWeight: 500 }}>
                  {dashboard.cashSalesShareLabel}
                </Text>
              </View>
            </View>
          </View>

          <WeeklyTrendCard
            bars={dashboard.weeklyChartBars}
            weeklyTotalDisplay={dashboard.weeklyTotalDisplay}
            dailyAvgDisplay={dashboard.dailyAvgDisplay}
          />
          <RestockAlertsCard alerts={dashboard.restockAlerts} />
          <RecentTransactionsCard transactions={dashboard.transactions} totalToday={dashboard.transactionTotalToday} />
        </View>
      </ScreenShell>
    </View>
  );
}

export default HomeScreen;
