import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon } from "@/components/ui/AppIcon";
import { RevenueSummaryCard } from "@/components/dashboard/RevenueSummaryCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActionButtons } from "@/components/dashboard/QuickActionButtons";
import { WeeklySalesChart } from "@/components/dashboard/WeeklySalesChart";
import { RestockAlerts } from "@/components/dashboard/RestockAlerts";

const RECENT_TRANSACTIONS = [
  {
    id: "1",
    title: "3-in-1 Coffee Packs",
    time: "10:42 AM • 5 units",
    amount: "₱75.00",
    icon: "coffee" as const,
  },
  {
    id: "2",
    title: "Laundry Detergent",
    time: "09:15 AM • 2 units",
    amount: "₱110.00",
    icon: "reusable_bag" as const,
  },
  {
    id: "3",
    title: "Mineral Water 500ml",
    time: "08:30 AM • 1 unit",
    amount: "₱15.00",
    icon: "water_bottle" as const,
  },
];

const RESTOCK_ITEMS = [
  { id: "1", name: "Artisan Mango Jam", unitsLeft: 4, icon: "inventory_2" },
  { id: "2", name: "Mountain Arabica (250g)", unitsLeft: 2, icon: "inventory_2" },
];

export default function DashboardScreen() {
  const handleQuickReorder = (itemId: string) => {
    console.log("[v0] Quick reorder triggered for item:", itemId);
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader syncPill />
      <ScreenShell bottomExtra={8}>
        {/* PRIMARY KPI: TODAY'S REVENUE */}
        <RevenueSummaryCard
          label="Today's Revenue"
          amount="₱42,850.00"
          trend={{ percentage: 12, direction: "up" }}
          variant="primary"
        />

        {/* SECONDARY METRICS: WEEKLY & GCASH REVENUE */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1">
            <RevenueSummaryCard
              label="Weekly Sales"
              amount="₱78,290"
              variant="secondary"
            />
          </View>
          <View className="flex-1">
            <RevenueSummaryCard
              label="GCash Revenue"
              amount="₱18,450"
              variant="tertiary"
            />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View className="mb-6">
          <QuickActionButtons
            actions={[
              {
                icon: "point_of_sale",
                label: "Add Sale",
                onPress: () => router.push("/sales"),
                variant: "primary",
              },
              {
                icon: "add_box",
                label: "Add Product",
                onPress: () => router.push("/inventory"),
                variant: "secondary",
              },
            ]}
          />
        </View>

        {/* KEY METRICS GRID */}
        <View className="mb-6 flex-row gap-3">
          <MetricCard
            icon="inventory_2"
            label="Stock"
            value="1,284"
            subtitle="Items in store"
            backgroundColor="bg-surface-container-lowest"
            iconColor="#204e2b"
          />
          <MetricCard
            icon="payments"
            label="Profit"
            value="₱14,210"
            subtitle="Est. margin 33.1%"
            backgroundColor="bg-surface-container-lowest"
            iconColor="#204e2b"
          />
        </View>

        {/* WEEKLY SALES CHART */}
        <View className="mb-6">
          <WeeklySalesChart
            data={[
              { day: "Mon", value: 8400 },
              { day: "Tue", value: 6210 },
              { day: "Wed", value: 7290 },
              { day: "Thu", value: 9200 },
              { day: "Fri", value: 7240 },
              { day: "Sat", value: 12900 },
              { day: "Sun", value: 8940, isToday: true },
            ]}
          />
        </View>

        {/* RESTOCK ALERTS */}
        <View className="mb-6">
          <RestockAlerts items={RESTOCK_ITEMS} onQuickReorder={handleQuickReorder} />
        </View>

        {/* RECENT TRANSACTIONS */}
        <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-headline text-lg font-extrabold text-on-surface">
              Recent Transactions
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="View all transactions">
              <Text className="text-sm font-bold text-primary">View All</Text>
            </Pressable>
          </View>
          <View className="gap-3">
            {RECENT_TRANSACTIONS.map((t) => (
              <View
                key={t.id}
                className="flex-row items-center justify-between rounded-2xl bg-surface-container-lowest p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-variant">
                    <AppIcon name={t.icon} size={20} color="#414941" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-semibold text-on-surface">{t.title}</Text>
                    <Text className="text-xs text-on-surface-variant">{t.time}</Text>
                  </View>
                </View>
                <Text className="font-headline text-sm font-bold text-on-surface">
                  {t.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScreenShell>
    </View>
  );
}
