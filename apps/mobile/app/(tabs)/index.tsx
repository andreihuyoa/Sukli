import { View, Text, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon } from "@/components/ui/AppIcon";

const TRANSACTIONS = [
  { id: "1", title: "3-in-1 Coffee Packs", time: "10:42 AM • 5 units", amount: "₱75.00", icon: "coffee" as const },
  { id: "2", title: "Laundry Detergent", time: "09:15 AM • 2 units", amount: "₱110.00", icon: "reusable_bag" as const },
  { id: "3", title: "Mineral Water 500ml", time: "08:30 AM • 1 unit", amount: "₱15.00", icon: "water_bottle" as const },
];

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader syncPill />
      <ScreenShell bottomExtra={8}>
        <Link href="/smart-restock" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open smart restock suggestions"
            className="mb-4 rounded-2xl bg-surface-container-low p-4 active:opacity-90"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold uppercase tracking-widest text-primary">Smart Restock</Text>
                <Text className="mt-1 font-body text-sm text-on-surface-variant">
                  Review suggested orders from last week&apos;s sales
                </Text>
              </View>
              <AppIcon name="inventory_2" size={28} color="#386641" />
            </View>
          </Pressable>
        </Link>

        <View className="relative mb-6 overflow-hidden rounded-[2rem] bg-primary-container p-8 shadow-xl">
          <View className="relative z-10">
            <Text className="mb-2 font-label text-xs uppercase tracking-[0.2em] text-white/80">Today&apos;s Revenue</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="font-headline text-2xl font-bold text-white/60">₱</Text>
              <Text className="font-headline text-5xl font-extrabold tracking-tighter text-white">14,280.50</Text>
            </View>
            <View className="mt-6 flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-3 py-1">
                <AppIcon name="trending_up" size={16} color="#ffffff" />
                <Text className="text-xs font-bold text-white">+12% from yesterday</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-6 flex-row gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open sales terminal"
            onPress={() => router.push("/sales")}
            className="min-h-[56px] flex-1 flex-row items-center justify-center gap-3 rounded-2xl bg-primary py-5 shadow-lg active:opacity-90"
          >
            <AppIcon name="point_of_sale" size={24} color="#ffffff" />
            <Text className="font-headline text-lg font-bold text-white">Add Sale</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add product"
            className="min-h-[56px] flex-1 flex-row items-center justify-center gap-3 rounded-2xl bg-secondary py-5 shadow-lg active:opacity-90"
          >
            <AppIcon name="add_box" size={24} color="#ffffff" />
            <Text className="font-headline text-lg font-bold text-white">Add Product</Text>
          </Pressable>
        </View>

        <View className="mb-6 flex-col gap-4">
          <View className="h-40 justify-between rounded-[1.5rem] bg-surface-container-lowest p-6">
            <View className="flex-row items-start justify-between">
              <View className="rounded-xl bg-surface-variant p-3">
                <AppIcon name="inventory_2" size={24} color="#204e2b" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-outline">Stock</Text>
            </View>
            <View>
              <Text className="font-headline text-3xl font-bold text-on-surface">1,248</Text>
              <Text className="text-xs text-outline">Total Items in Store</Text>
            </View>
          </View>
          <View className="h-40 justify-between rounded-[1.5rem] bg-surface-container-lowest p-6">
            <View className="flex-row items-start justify-between">
              <View className="rounded-xl bg-tertiary-fixed p-3">
                <AppIcon name="payments" size={24} color="#151f00" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-outline">Profit</Text>
            </View>
            <View>
              <Text className="font-headline text-3xl font-bold text-on-surface">₱3,410</Text>
              <Text className="text-xs text-outline">Estimated Monthly Gain</Text>
            </View>
          </View>
          <View className="h-40 justify-between rounded-[1.5rem] bg-error-container p-6">
            <View className="flex-row items-start justify-between">
              <View className="rounded-xl bg-error p-3">
                <AppIcon name="warning" size={24} color="#ffffff" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-on-error-container">Alerts</Text>
            </View>
            <View>
              <Text className="font-headline text-3xl font-bold text-on-error-container">8 Items</Text>
              <Text className="text-xs text-on-error-container opacity-70">Running out of stock</Text>
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-[2rem] bg-surface-container-low p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-headline text-lg font-bold text-on-surface">Weekly Sales Trend</Text>
            <Text className="text-xs font-bold text-primary">Last 7 Days</Text>
          </View>
          <View className="h-32 flex-row items-end justify-between gap-2 px-2">
            {[
              { h: 64, key: "sat0" },
              { h: 84, key: "sat1" },
              { h: 42, key: "sat2" },
              { h: 102, key: "sat3" },
              { h: 64, key: "sat4" },
              { h: 128, key: "sat5", primary: true },
              { h: 96, key: "sat6" },
            ].map(({ h, key, primary }) => (
              <View key={key} className="h-full flex-1 justify-end">
                <View
                  className={`w-full rounded-t-lg ${primary ? "bg-primary-container" : "bg-primary-fixed"}`}
                  style={{ height: h }}
                />
              </View>
            ))}
          </View>
          <View className="mt-4 flex-row justify-between px-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <Text key={d} className="text-[10px] font-bold uppercase tracking-tighter text-outline">
                {d}
              </Text>
            ))}
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-headline text-lg font-extrabold text-on-surface">Recent Transactions</Text>
            <Pressable accessibilityRole="button">
              <Text className="text-sm font-bold text-primary">View All</Text>
            </Pressable>
          </View>
          <View className="gap-3">
            {TRANSACTIONS.map((t) => (
              <View
                key={t.id}
                className="flex-row items-center justify-between rounded-2xl bg-surface-container-lowest p-4"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-variant">
                    <AppIcon name={t.icon} size={24} color="#414941" />
                  </View>
                  <View>
                    <Text className="font-body-semibold text-on-surface">{t.title}</Text>
                    <Text className="text-xs text-outline">{t.time}</Text>
                  </View>
                </View>
                <Text className="font-headline font-extrabold text-on-surface">{t.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScreenShell>
    </View>
  );
}
