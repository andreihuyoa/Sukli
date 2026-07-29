import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { BarChart } from "@/components/charts/BarChart";
import { Card } from "@/components/home/Card";
import { SectionEmptyState } from "@/components/home/SectionEmptyState";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppIcon } from "@/components/ui/AppIcon";
import type {
  ChartBarPoint,
  HomeRestockAlert,
  HomeTransaction,
} from "@/lib/types/api/reporting";
import { router } from "expo-router";

const statusConfig = {
  completed: {
    badgeClassName: "bg-success/12",
    dotClassName: "bg-success",
    textClassName: "text-success",
    label: "Completed",
  },
  pending: {
    badgeClassName: "bg-warning/12",
    dotClassName: "bg-warning",
    textClassName: "text-warning",
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
  showWeeklyTrend?: boolean;
  showRestockAlerts?: boolean;
  showRecentTransactions?: boolean;
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
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/14">
              <AppIcon
                name="check"
                size={14}
                className="text-primary"
                strokeWidth={2.5}
              />
            </View>
            <Text
              numberOfLines={1}
              className="flex-1 text-[10px] font-label font-bold uppercase tracking-widest text-muted-foreground"
            >
              Weekly Trend
            </Text>
          </View>
          <View className="flex-shrink-0 rounded-lg border border-border bg-surface px-3 py-1">
            <Text className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-foreground">
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

        <View className="flex-row items-center justify-between gap-3 border-t border-border/40 pt-3 pb-1">
          <View className="min-w-0 flex-1">
            <Text className="text-[11px] font-body font-medium text-muted-foreground">
              Weekly Total
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm font-headline font-bold text-foreground"
            >
              {weeklyTotalDisplay}
            </Text>
          </View>
          <View className="min-w-0 flex-1 items-end">
            <Text className="text-[11px] font-body font-medium text-muted-foreground">
              Daily Avg
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm font-headline font-bold text-foreground"
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
              className="text-success"
              strokeWidth={2.5}
            />
            <Text
              numberOfLines={2}
              className="flex-1 text-base font-body font-bold text-foreground"
            >
              Restock Required
            </Text>
          </View>
          <View className="flex-shrink-0 rounded-full border border-warning/30 bg-warning/12 px-3 py-1">
            <Text className="text-[11px] font-body font-bold text-warning">
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
                {index > 0 ? <View className="mx-4 h-px bg-border/40" /> : null}
                <View className="gap-3 px-4 py-3">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-[15px] font-body-semibold text-foreground"
                      >
                        {item.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-1.5">
                        <View
                          className={`h-2 w-2 rounded-full ${
                            item.urgency === "critical"
                              ? "bg-destructive"
                              : "bg-success"
                          }`}
                        />
                        <Text className="text-[11px] font-body font-medium text-muted-foreground">
                          {item.unitsLeft} units left · {item.variant}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    className="self-start flex-row items-center gap-1 rounded-xl border border-warning/30 bg-warning/12 px-3 py-2"
                  >
                    <Text className="text-xs font-body font-bold text-warning">
                      Quick Reorder
                    </Text>
                    <AppIcon
                      name="chevron_right"
                      size={12}
                      className="text-warning"
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
          className="mt-1 w-full flex-row items-center justify-center gap-2 border-t border-border/40 py-3"
        >
          <Text className="text-sm font-body font-bold text-primary-strong">
            View All Stock Alerts
          </Text>
          <AppIcon
            name="chevron_right"
            size={14}
            className="text-primary-strong"
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
      <Text className="text-[11px] font-body font-bold text-primary-foreground">
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
            className="min-w-0 flex-1 text-foreground"
            style={{ fontSize: 16, fontWeight: "700" }}
          >
            Latest Sales
          </Text>
          <Pressable
            accessibilityRole="button"
            className="ml-3 flex-shrink-0 flex-row items-center gap-1"
            style={{ gap: 4 }}
            onPress={() => router.push({ pathname: "/sales" })}
          >
            <Text className="text-sm font-body font-bold text-primary-strong">
              View All
            </Text>
            <AppIcon
              name="chevron_right"
              size={14}
              className="text-primary-strong"
              strokeWidth={2.5}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center bg-surface-muted px-4 py-2">
          <Text className="flex-1 text-[10px] font-label font-bold uppercase text-muted-foreground">
            Sale
          </Text>
          <Text className="w-16 text-center text-[10px] font-label font-bold uppercase text-muted-foreground">
            Items
          </Text>
          <Text className="w-24 text-right text-[10px] font-label font-bold uppercase text-muted-foreground">
            Amount
          </Text>
        </View>

        {transactions.length === 0 ? (
          <SectionEmptyState
            iconKey="receipt_long"
            title={
              isEmpty ? "No sales recorded yet" : "No sales for this period"
            }
            body={
              isEmpty
                ? "Complete a transaction from the register to see it here."
                : "There were no sales recorded in the selected time window."
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
                    <View className="mx-4 h-px bg-border/20" />
                  ) : null}
                  <View className="flex-row items-center gap-3 px-4 py-3">
                    <Avatar initials={tx.initials} color={tx.avatarColor} />
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-body-semibold text-foreground"
                      >
                        {tx.customerName}
                      </Text>
                      <Text className="text-xs font-body font-medium text-muted-foreground">
                        {tx.timeDisplay}
                      </Text>
                    </View>
                    <View className="w-16 items-center">
                      <Text className="text-xs font-body font-bold text-muted-foreground">
                        {tx.itemCount} {tx.itemCount === 1 ? "item" : "items"}
                      </Text>
                    </View>
                    <View className="w-24 items-end">
                      <Text className="text-xs font-body font-bold text-foreground">
                        {tx.amountDisplay}
                      </Text>
                      <View
                        className={`mt-1 flex-row items-center gap-1 rounded-full px-2 py-0.5 ${status.badgeClassName}`}
                      >
                        <View
                          className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                        />
                        <Text
                          className={`text-[10px] font-body font-bold ${status.textClassName}`}
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

        <View className="flex-row items-center justify-between gap-3 border-t border-border/40 px-4 py-3">
          <Text className="min-w-0 flex-1 text-xs font-body font-medium text-muted-foreground">
            {totalToday > 0
              ? `Showing ${transactions.length} of ${totalToday} sales today`
              : isEmpty
                ? "Complete a sale to show live transactions here"
                : "No sales recorded today"}
          </Text>
          <View className="flex-shrink-0 items-center rounded-lg border border-border bg-surface px-2 py-1">
            <Text className="text-xs font-body font-bold text-foreground">
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
  showWeeklyTrend = true,
  showRestockAlerts = true,
  showRecentTransactions = true,
}: Props) {
  return (
    <View className="gap-4">
      {showWeeklyTrend ? (
        <WeeklyTrendCard
          bars={bars}
          weeklyTotalDisplay={weeklyTotalDisplay}
          dailyAvgDisplay={dailyAvgDisplay}
          isEmpty={isEmpty}
        />
      ) : null}
      {showRestockAlerts ? (
        <RestockAlertsCard alerts={alerts} isEmpty={isEmpty} />
      ) : null}
      {showRecentTransactions ? (
        <RecentTransactionsCard
          transactions={transactions}
          totalToday={totalToday}
          isEmpty={isEmpty}
        />
      ) : null}
    </View>
  );
}
