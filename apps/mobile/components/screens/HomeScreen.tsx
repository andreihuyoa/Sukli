import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import type { ChartBarPoint, HomeRestockAlert, HomeTransaction } from "@/types";

function formatPesoDisplay(value: string): string {
  if (value === "—" || value.startsWith("₱")) return value;
  return `₱${value}`;
}

const statusConfig = {
  completed: {
    badgeClassName: "bg-status-completed-bg",
    dotClassName: "bg-status-completed-dot",
    textClassName: "text-status-completed-text",
    label: "Completed",
  },
  pending: {
    badgeClassName: "bg-status-pending-bg",
    dotClassName: "bg-status-pending-dot",
    textClassName: "text-status-pending-text",
    label: "Pending",
  },
};

function MetricCard(props: {
  iconKey: AppIconName;
  label: string;
  value: string;
  subtitle: string;
  delayMs?: number;
  accentIconClassName: string;
  accentSurfaceClassName: string;
}) {
  const {
    iconKey,
    label,
    value,
    subtitle,
    delayMs = 0,
    accentIconClassName,
    accentSurfaceClassName,
  } = props;

  return (
    <Entrance delayMs={delayMs}>
      <View
        className="flex-1 rounded-2xl p-4 bg-glass-surface"
        style={{
          borderRadius: 16,
          shadowOpacity: 0.06,
          shadowRadius: 12,
        }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View
            className={`h-8 w-8 rounded-xl items-center justify-center ${accentSurfaceClassName}`}
          >
            <AppIcon
              name={iconKey}
              size={18}
              className={accentIconClassName}
              strokeWidth={2}
            />
          </View>

          <Text className="text-[10px] font-label font-bold uppercase tracking-widest text-label-muted">
            {label}
          </Text>
        </View>

        <Text
          className="mb-0.5 text-label-primary"
          style={{
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.2,
            lineHeight: 32,
          }}
        >
          {value}
        </Text>
        <Text className="text-[11px] font-body font-medium text-label-muted">
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
      <View className="mx-4 rounded-3xl overflow-hidden bg-revenue-hero px-6 pt-6 pb-5">
        <Text className="text-[10px] font-label font-bold uppercase tracking-widest mb-3 text-on-hero-muted">
          Today&apos;s Revenue
        </Text>

        <Text
          className="text-on-primary"
          style={{
            fontSize: 42,
            fontWeight: "900",
            letterSpacing: -0.6,
            lineHeight: 44,
          }}
        >
          {formatPesoDisplay(amountDisplay)}
        </Text>

        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full mt-3 self-start border bg-hero-pill-bg border-hero-pill-border">
          <AppIcon
            name="trending_up"
            size={14}
            className="text-on-hero-strong"
            strokeWidth={2.5}
          />
          <Text className="text-[11px] font-body font-bold text-on-hero-strong">
            {percentChange === 0
              ? "No comparison data"
              : `+${percentChange}% from yesterday`}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-5">
          <Pressable
            accessibilityRole="button"
            onPress={onAddSale}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-hero-cta-solid"
          >
            <AppIcon
              name="add"
              size={16}
              className="text-forest"
              strokeWidth={2.5}
            />
            <Text className="text-[13px] font-body font-bold text-forest">
              Add Sale
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onAddProduct}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl border bg-hero-cta-ghost border-hero-cta-ghost-border"
          >
            <AppIcon
              name="add_box"
              size={16}
              className="text-on-primary"
              strokeWidth={2}
            />
            <Text className="text-[13px] font-body font-bold text-on-primary">
              Add Product
            </Text>
          </Pressable>
        </View>
      </View>
    </Entrance>
  );
}

function GCashRevenueCard(props: {
  amountDisplay: string;
  changeLabel: string;
}) {
  const { amountDisplay, changeLabel } = props;
  return (
    <Entrance delayMs={80}>
      <View className="flex-1 rounded-2xl px-4 pt-4 bg-gcash">
        <View className="flex-row items-start justify-between mb-3">
          <View className="h-8 w-8 rounded-xl items-center justify-center bg-gcash-icon-tile">
            <AppIcon
              name="smartphone"
              size={16}
              className="text-on-primary"
              strokeWidth={2}
            />
          </View>
          <Text className="text-[10px] font-label font-bold uppercase tracking-widest text-on-hero-muted">
            GCash
          </Text>
        </View>

        <Text
          className="text-on-primary"
          style={{
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.4,
            lineHeight: 30,
          }}
        >
          {formatPesoDisplay(amountDisplay)}
        </Text>

        <View className="flex-row items-center gap-1 mt-2">
          <AppIcon
            name="trending_up"
            size={12}
            className="text-on-hero-soft"
            strokeWidth={2.5}
          />
          <Text className="text-[11px] font-body font-bold text-on-hero-label">
            {changeLabel}
          </Text>
        </View>
      </View>
    </Entrance>
  );
}

function WeeklyTrendCard(props: {
  bars: ChartBarPoint[];
  weeklyTotalDisplay: string;
  dailyAvgDisplay: string;
}) {
  const { bars, weeklyTotalDisplay, dailyAvgDisplay } = props;

  return (
    <Entrance delayMs={120}>
      <View
        className="mx-4 rounded-2xl p-4 pb-2 bg-glass-surface"
        style={{ borderRadius: 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 rounded-lg items-center justify-center bg-forest-alpha-14">
              <AppIcon
                name="check"
                size={14}
                className="text-forest"
                strokeWidth={2.5}
              />
            </View>
            <Text className="text-[10px] font-label font-bold uppercase tracking-widest text-label-muted">
              Weekly Trend
            </Text>
          </View>
          <View className="px-3 py-1 rounded-lg bg-forest-alpha-10">
            <Text className="text-[10px] font-label font-bold uppercase text-forest">
              This Week
            </Text>
          </View>
        </View>

        {bars.length > 0 ? (
          <BarChart
            data={bars}
            highlightLastTwo
            barAreaHeight={110}
            enableSelection
          />
        ) : (
          <Text className="text-label-muted font-semibold text-[13px] py-8 text-center">
            No weekly sales data yet.
          </Text>
        )}

        <View className="flex-row items-center justify-between pt-2 pb-1 border-t border-separator">
          <View>
            <Text className="text-[11px] font-body font-medium text-label-muted">
              Weekly Total
            </Text>
            <Text className="text-sm font-headline font-bold text-label-primary">
              {formatPesoDisplay(weeklyTotalDisplay)}
            </Text>
          </View>
          <View>
            <Text className="text-[11px] font-body font-medium text-label-muted">
              Daily Avg
            </Text>
            <Text className="text-sm font-headline font-bold text-label-primary">
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
      <View className="mx-4 rounded-2xl overflow-hidden bg-glass-surface">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <View className="flex-row items-center gap-2">
            <AppIcon
              name="warning"
              size={16}
              className="text-restock-icon"
              strokeWidth={2.5}
            />
            <Text className="text-base font-body font-bold text-label-primary">
              Restock Required
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-status-pending-bg">
            <Text className="text-[11px] font-body font-bold text-status-pending-text">
              {alerts.length} Alerts
            </Text>
          </View>
        </View>

        {alerts.length === 0 ? (
          <View className="px-4 pb-4">
            <Text className="text-[13px] font-body-semibold text-label-muted">
              All stock levels look good.
            </Text>
          </View>
        ) : (
          <View>
            {alerts.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View className="mx-4 h-px bg-separator" /> : null}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-thumbnail-placeholder">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      numberOfLines={1}
                      className="text-[15px] font-body-semibold text-label-primary"
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <View
                        className={`h-2 w-2 rounded-full ${
                          item.urgency === "critical"
                            ? "bg-destructive"
                            : "bg-restock-icon"
                        }`}
                      />
                      <Text className="text-[11px] font-body font-medium text-label-muted">
                        {item.unitsLeft} units left · {item.variant}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    className="ml-2 flex-row items-center gap-1 px-3 py-2 rounded-xl bg-revenue-hero"
                  >
                    <Text className="text-xs font-body font-bold text-on-primary">
                      Quick Reorder
                    </Text>
                    <AppIcon
                      name="chevron_right"
                      size={12}
                      className="text-on-hero-soft"
                      strokeWidth={2.5}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          className="mt-1 w-full flex-row items-center justify-center gap-2 py-3 border-t border-separator"
        >
          <Text className="text-sm font-body font-bold text-revenue-hero">
            View All Stock Alerts
          </Text>
          <AppIcon
            name="chevron_right"
            size={14}
            className="text-revenue-hero"
            strokeWidth={2.5}
          />
        </Pressable>
      </View>
    </Entrance>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View
      className="h-9 w-9 rounded-full items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      <Text className="text-[11px] font-body font-bold text-on-primary">
        {initials}
      </Text>
    </View>
  );
}

function RecentTransactionsCard(props: {
  transactions: HomeTransaction[];
  totalToday: number;
}) {
  const { transactions, totalToday } = props;

  return (
    <Entrance delayMs={190}>
      <View className="mx-4 rounded-2xl overflow-hidden bg-glass-surface">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <Text
            className="text-label-primary"
            style={{ fontSize: 16, fontWeight: "700" }}
          >
            Recent Transactions
          </Text>
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1"
            style={{ gap: 4 }}
          >
            <Text className="text-sm font-body font-bold text-revenue-hero">
              View All
            </Text>
            <AppIcon
              name="chevron_right"
              size={14}
              className="text-revenue-hero"
              strokeWidth={2.5}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center px-4 py-2 bg-table-header-bg">
          <Text className="flex-1 text-[10px] font-label font-bold uppercase text-label-muted">
            Customer
          </Text>
          <Text className="w-16 text-center text-[10px] font-label font-bold uppercase text-label-muted">
            Items
          </Text>
          <Text className="w-24 text-right text-[10px] font-label font-bold uppercase text-label-muted">
            Status
          </Text>
        </View>

        {transactions.length === 0 ? (
          <View className="px-4 py-6">
            <Text className="text-[13px] font-body-semibold text-label-muted">
              No transactions for this period.
            </Text>
          </View>
        ) : (
          <View>
            {transactions.map((tx, index) => {
              const status = statusConfig[tx.status];
              return (
                <View key={tx.id}>
                  {index > 0 ? (
                    <View className="mx-4 h-px bg-separator-subtle" />
                  ) : null}
                  <View className="flex-row items-center gap-3 px-4 py-3">
                    <Avatar initials={tx.initials} color={tx.avatarColor} />
                    <View className="flex-1 min-w-0">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-body-semibold text-label-primary"
                      >
                        {tx.customerName}
                      </Text>
                      <Text className="text-xs font-body font-medium text-time-muted">
                        {tx.timeDisplay}
                      </Text>
                    </View>

                    <View className="w-16 items-center">
                      <Text className="text-xs font-body font-bold text-label-tertiary">
                        {tx.itemCount} {tx.itemCount === 1 ? "item" : "items"}
                      </Text>
                    </View>

                    <View className="w-24 flex-row justify-end">
                      <View
                        className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${status.badgeClassName}`}
                      >
                        <View
                          className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                        />
                        <Text
                          className={`text-xs font-body font-bold ${status.textClassName}`}
                        >
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

        <View className="flex-row items-center justify-between px-4 py-3 border-t border-separator">
          <Text className="text-xs font-body font-medium text-label-muted">
            {totalToday > 0
              ? `Showing ${transactions.length} of ${totalToday} transactions today`
              : "Connect POS to see live transactions"}
          </Text>
          <View className="px-2 py-1 rounded-lg bg-forest-alpha-10 items-center">
            <Text className="text-xs font-body font-bold text-forest">
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
    <View className="flex-1 bg-screen-grouped">
      <AppHeader onRefresh={handleRefresh} />
      <ScreenShell>
        <View className="flex-col">
          <View className="pb-4">
            <Text
              className="text-xs font-body font-medium text-label-muted"
              style={{ fontWeight: 500 }}
            >
              {dashboard.dateLabel}
            </Text>
            <Text
              className="mt-1 text-label-primary"
              style={{ fontSize: 18, fontWeight: 800 }}
            >
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
              accentIconClassName="text-forest"
              accentSurfaceClassName="bg-forest-alpha-14"
            />
            <MetricCard
              iconKey="payments"
              label="Profit Est."
              value={dashboard.profitEstDisplay}
              subtitle={dashboard.profitEstSubtitle}
              delayMs={100}
              accentIconClassName="text-revenue-hero"
              accentSurfaceClassName="bg-forest-alpha-10"
            />
          </View>

          <View className="flex-row gap-3 mx-4 mb-4">
            <GCashRevenueCard
              amountDisplay={dashboard.gcashAmountDisplay}
              changeLabel={dashboard.gcashChangeLabel}
            />
            <View className="flex-1 rounded-2xl p-4 justify-between bg-glass-surface">
              <View className="flex-row items-start justify-between">
                <View className="h-8 w-8 rounded-xl items-center justify-center bg-forest-alpha-14">
                  <View className="h-3 w-3 rounded-full border-2 border-forest" />
                </View>
                <Text className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-label-muted">
                  Cash Sales
                </Text>
              </View>

              <View>
                <Text
                  className="text-label-primary"
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                    lineHeight: 30,
                  }}
                >
                  {formatPesoDisplay(dashboard.cashSalesAmountDisplay)}
                </Text>
                <Text
                  className="text-xs font-body font-medium text-label-muted"
                  style={{ fontWeight: 500 }}
                >
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
          <RecentTransactionsCard
            transactions={dashboard.transactions}
            totalToday={dashboard.transactionTotalToday}
          />
        </View>
      </ScreenShell>
    </View>
  );
}

export default HomeScreen;
