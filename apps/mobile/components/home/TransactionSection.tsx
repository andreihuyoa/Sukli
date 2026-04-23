import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { Card } from "@/components/home/Card";
import { SectionEmptyState } from "@/components/home/SectionEmptyState";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppIcon } from "@/components/ui/AppIcon";
import type { ChartBarPoint, HomeRestockAlert, HomeTransaction } from "@/types";

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
} as const;

type Props = {
  bars: ChartBarPoint[];
  weeklyTotalDisplay: string;
  dailyAvgDisplay: string;
  alerts: HomeRestockAlert[];
  transactions: HomeTransaction[];
  totalToday: number;
  isEmpty: boolean;
};

function WeeklyTrendCard(props: {
  bars: ChartBarPoint[];
  weeklyTotalDisplay: string;
  dailyAvgDisplay: string;
  isEmpty: boolean;
}) {
  const { bars, weeklyTotalDisplay, dailyAvgDisplay, isEmpty } = props;

  return (
    <Entrance delayMs={120}>
      <Card className="p-4 pb-2">
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-forest-alpha-14">
              <AppIcon
                name="check"
                size={14}
                className="text-forest"
                strokeWidth={2.5}
              />
            </View>
            <Text
              numberOfLines={1}
              className="flex-1 text-[10px] font-label font-bold uppercase tracking-widest text-label-muted"
            >
              Weekly Trend
            </Text>
          </View>
          <View className="flex-shrink-0 rounded-lg border border-outline bg-surface-container px-3 py-1">
            <Text className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-label-primary">
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
          <SectionEmptyState
            iconKey="analytics"
            title={
              isEmpty
                ? "Sales trends will appear here"
                : "No weekly sales data yet"
            }
            body={
              isEmpty
                ? "Once daily sales are recorded, this card will chart the week without changing its layout."
                : "There is no weekly sales activity for the selected period."
            }
            tone="forest"
          />
        )}

        <View className="flex-row items-center justify-between gap-3 border-t border-separator pt-3 pb-1">
          <View className="min-w-0 flex-1">
            <Text className="text-[11px] font-body font-medium text-label-muted">
              Weekly Total
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm font-headline font-bold text-label-primary"
            >
              {weeklyTotalDisplay}
            </Text>
          </View>
          <View className="min-w-0 flex-1 items-end">
            <Text className="text-[11px] font-body font-medium text-label-muted">
              Daily Avg
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm font-headline font-bold text-label-primary"
            >
              {dailyAvgDisplay}
            </Text>
          </View>
        </View>
      </Card>
    </Entrance>
  );
}

function RestockAlertsCard(props: {
  alerts: HomeRestockAlert[];
  isEmpty: boolean;
}) {
  const { alerts, isEmpty } = props;

  return (
    <Entrance delayMs={160}>
      <Card>
        <View className="flex-row items-center justify-between gap-3 px-4 pt-4 pb-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <AppIcon
              name="warning"
              size={16}
              className="text-restock-icon"
              strokeWidth={2.5}
            />
            <Text
              numberOfLines={2}
              className="flex-1 text-base font-body font-bold text-label-primary"
            >
              Restock Required
            </Text>
          </View>
          <View className="flex-shrink-0 rounded-full border border-accent-warn-border bg-status-pending-bg px-3 py-1">
            <Text className="text-[11px] font-body font-bold text-status-pending-text">
              {alerts.length} Alerts
            </Text>
          </View>
        </View>

        {alerts.length === 0 ? (
          <SectionEmptyState
            iconKey="inventory_2"
            title={
              isEmpty
                ? "No inventory data connected"
                : "All stock levels look good"
            }
            body={
              isEmpty
                ? "Connect your catalog and stock counts to see reorder suggestions here."
                : "Your current stock levels do not require immediate action."
            }
            tone="warn"
            compact
          />
        ) : (
          <View>
            {alerts.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View className="mx-4 h-px bg-separator" /> : null}
                <View className="gap-3 px-4 py-3">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-thumbnail-placeholder">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-[15px] font-body-semibold text-label-primary"
                      >
                        {item.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-1.5">
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
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    className="self-start flex-row items-center gap-1 rounded-xl border border-accent-warn-border bg-accent-warn-soft px-3 py-2"
                  >
                    <Text className="text-xs font-body font-bold text-accent-warn">
                      Quick Reorder
                    </Text>
                    <AppIcon
                      name="chevron_right"
                      size={12}
                      className="text-accent-warn"
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
          className="mt-1 w-full flex-row items-center justify-center gap-2 border-t border-separator py-3"
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
      </Card>
    </Entrance>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View
      className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
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
  isEmpty: boolean;
}) {
  const { transactions, totalToday, isEmpty } = props;

  return (
    <Entrance delayMs={190}>
      <Card>
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <Text
            numberOfLines={2}
            className="min-w-0 flex-1 text-label-primary"
            style={{ fontSize: 16, fontWeight: "700" }}
          >
            Recent Transactions
          </Text>
          <Pressable
            accessibilityRole="button"
            className="ml-3 flex-shrink-0 flex-row items-center gap-1"
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

        <View className="flex-row items-center bg-table-header-bg px-4 py-2">
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
          <SectionEmptyState
            iconKey="receipt_long"
            title={
              isEmpty
                ? "No transactions connected yet"
                : "No transactions for this period"
            }
            body={
              isEmpty
                ? "Connect POS activity to populate the live transaction feed without changing card height."
                : "There were no transactions recorded in the selected time window."
            }
            tone="info"
            compact
          />
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
                    <View className="min-w-0 flex-1">
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
                        className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${status.badgeClassName}`}
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

        <View className="flex-row items-center justify-between gap-3 border-t border-separator px-4 py-3">
          <Text className="min-w-0 flex-1 text-xs font-body font-medium text-label-muted">
            {totalToday > 0
              ? `Showing ${transactions.length} of ${totalToday} transactions today`
              : isEmpty
                ? "Connect POS to show live transactions here"
                : "No transactions recorded today"}
          </Text>
          <View className="flex-shrink-0 items-center rounded-lg border border-outline bg-surface-container px-2 py-1">
            <Text className="text-xs font-body font-bold text-label-primary">
              Today
            </Text>
          </View>
        </View>
      </Card>
    </Entrance>
  );
}

export function TransactionSection({
  bars,
  weeklyTotalDisplay,
  dailyAvgDisplay,
  alerts,
  transactions,
  totalToday,
  isEmpty,
}: Props) {
  return (
    <View className="gap-4">
      <WeeklyTrendCard
        bars={bars}
        weeklyTotalDisplay={weeklyTotalDisplay}
        dailyAvgDisplay={dailyAvgDisplay}
        isEmpty={isEmpty}
      />
      <RestockAlertsCard alerts={alerts} isEmpty={isEmpty} />
      <RecentTransactionsCard
        transactions={transactions}
        totalToday={totalToday}
        isEmpty={isEmpty}
      />
    </View>
  );
}
