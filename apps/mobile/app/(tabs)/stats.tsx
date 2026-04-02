import { View, Text, Pressable } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon } from "@/components/ui/AppIcon";

const RANGE = ["Daily", "Weekly", "Monthly"] as const;

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <ScreenShell>
        <View className="mb-6 flex-row flex-wrap gap-3">
          <View className="min-w-[60%] flex-[2] justify-between rounded-xl bg-surface-container-low p-6">
            <View>
              <Text className="mb-1 font-headline text-2xl font-bold tracking-tight text-primary">
                Performance Ledger
              </Text>
              <Text className="font-body text-sm font-medium text-on-surface-variant">
                Analyze your store&apos;s financial growth
              </Text>
            </View>
            <View className="mt-6 flex-row gap-2">
              {RANGE.map((r, i) => (
                <Pressable
                  key={r}
                  className={`rounded-full px-5 py-2 ${i === 0 ? "bg-primary" : "bg-surface-container-high"}`}
                >
                  <Text
                    className={`font-label text-xs font-bold uppercase tracking-widest ${
                      i === 0 ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="min-w-[36%] flex-1 justify-center overflow-hidden rounded-xl bg-primary-container p-6">
            <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-white/80">Net Profit</Text>
            <Text className="my-1 font-headline text-3xl font-extrabold text-white">₱12,450.00</Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View className="rounded-full bg-tertiary-fixed px-2 py-0.5">
                <Text className="text-[10px] font-bold text-on-tertiary-fixed">+12%</Text>
              </View>
              <Text className="text-[10px] text-white/70">vs last period</Text>
            </View>
          </View>
        </View>

        <View className="mb-6 flex-col gap-6">
          <View className="flex-[3] rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <View className="mb-8 flex-row items-center justify-between">
              <Text className="font-headline text-lg font-bold text-on-surface">Sales Trends</Text>
              <View className="flex-row items-center gap-2">
                <AppIcon name="calendar_today" size={16} color="#414941" />
                <Text className="font-label text-xs font-semibold uppercase">Oct 1 - Oct 7</Text>
              </View>
            </View>
            <View className="h-48 flex-row items-end justify-between gap-2 px-2">
              {[
                { h: 40, label: "MON" },
                { h: 65, label: "TUE" },
                { h: 55, label: "WED" },
                { h: 90, label: "THU", highlight: true },
                { h: 75, label: "FRI" },
                { h: 85, label: "SAT" },
                { h: 45, label: "SUN" },
              ].map((d) => (
                <View key={d.label} className="flex-1 items-center">
                  <View
                    className={`w-full rounded-t-lg ${d.highlight ? "bg-primary-container shadow-lg shadow-primary/10" : "bg-surface-container-high"}`}
                    style={{ height: (d.h / 100) * 160 }}
                  />
                  <Text
                    className={`mt-3 text-[10px] font-bold ${d.highlight ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-[2] rounded-xl bg-surface-container-low p-6">
            <Text className="mb-6 font-headline text-lg font-bold text-on-surface">Expense Ledger</Text>
            <View className="gap-4">
              <View className="flex-row items-center justify-between rounded-xl bg-surface-container-lowest p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-error-container">
                    <AppIcon name="inventory_2" size={22} color="#93000a" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold">Stock Restock</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Inventory
                    </Text>
                  </View>
                </View>
                <Text className="font-headline font-bold text-error">₱8,240</Text>
              </View>
              <View className="flex-row items-center justify-between rounded-xl bg-surface-container-lowest p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary-container">
                    <AppIcon name="bolt" size={22} color="#416d28" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold">Electricity</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Utilities
                    </Text>
                  </View>
                </View>
                <Text className="font-headline font-bold text-error">₱1,500</Text>
              </View>
            </View>
            <View className="mt-6 flex-row items-center justify-between border-t border-outline-variant/20 pt-6">
              <Text className="font-label text-xs font-bold uppercase text-on-surface-variant">Total Expenses</Text>
              <Text className="font-headline text-xl font-extrabold">₱9,740</Text>
            </View>
          </View>
        </View>
      </ScreenShell>
    </View>
  );
}
