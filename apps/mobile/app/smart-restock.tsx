import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { AppHeader } from "@/components/ui/AppHeader";
import { StackScreenShell } from "@/components/ui/StackScreenShell";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

const ITEMS: {
  id: string;
  title: string;
  detail: string;
  unit: string;
  sub: string;
  icon: AppIconName;
}[] = [
  {
    id: "1",
    title: "Selecta Fortified Milk",
    detail: "Suggest: 12 pcs",
    unit: "Est. ₱24.00/pc",
    sub: "₱288",
    icon: "local_drink",
  },
  {
    id: "2",
    title: "SkyFlakes 10pk",
    detail: "Suggest: 5 units",
    unit: "Est. ₱55.00/unit",
    sub: "₱275",
    icon: "bakery_dining",
  },
  {
    id: "3",
    title: "Farm Fresh Eggs (M)",
    detail: "Suggest: 1 tray",
    unit: "Est. ₱210.00/tray",
    sub: "₱210",
    icon: "egg",
  },
];

export default function SmartRestockScreen() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    "1": true,
    "2": true,
    "3": true,
  });

  return (
    <View className="flex-1 bg-surface">
      <AppHeader onBackPress={() => router.back()} />
      <StackScreenShell>
        <View className="mb-8">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="rounded-full bg-accent px-3 py-1">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">Smart Suggestion</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <AppIcon name="sync" size={14} color="#414941" />
              <Text className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                Updates when online
              </Text>
            </View>
          </View>
          <Text className="mb-1 font-headline text-3xl font-extrabold tracking-tight text-primary">Restock List</Text>
          <Text className="font-body text-sm font-medium text-on-surface-variant">
            Based on your sales from the last 7 days
          </Text>
        </View>

        <View className="mb-8 flex-row gap-4">
          <View className="flex-1 justify-between rounded-xl bg-surface-container-lowest p-5">
            <Text className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Items to Buy</Text>
            <Text className="mt-2 font-headline text-3xl font-extrabold text-primary">12</Text>
          </View>
          <View className="flex-1 justify-between rounded-xl bg-primary p-5">
            <Text className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Est. Total</Text>
            <Text className="mt-2 font-headline text-3xl font-extrabold text-white">₱1,420</Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-center justify-between px-2">
          <Text className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Suggested Items</Text>
          <Pressable className="flex-row items-center gap-1">
            <Text className="text-xs font-bold text-primary">Select All</Text>
            <AppIcon name="checklist" size={16} color="#204e2b" />
          </Pressable>
        </View>

        <View className="gap-4 pb-8">
          {ITEMS.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center gap-4 rounded-xl bg-surface-container-lowest p-4 active:opacity-95"
            >
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface-variant">
                <AppIcon name={item.icon} size={24} color="#386641" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-on-surface">{item.title}</Text>
                <View className="mt-1 flex-row flex-wrap gap-3">
                  <Text className="text-xs font-bold text-primary">{item.detail}</Text>
                  <Text className="text-[10px] font-medium text-on-surface-variant">{item.unit}</Text>
                </View>
              </View>
              <View className="items-end gap-2">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected[item.id] }}
                  onPress={() => setSelected((s) => ({ ...s, [item.id]: !s[item.id] }))}
                  className="h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest"
                >
                  {selected[item.id] ? (
                    <AppIcon name="check" size={22} color="#204e2b" />
                  ) : null}
                </Pressable>
                <Text className="text-xs font-bold text-on-surface">{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="items-center pb-4">
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtCcqLRSUDa95EIm-G0TI0fv2UKHi3M9FL4GQSnK0vmK0Wje0DI1nWrAkn2-K-jLnuut7No8U873SJynwVIaufQB6ZhqcUJfPeAuX8n016oOdvbGP00NnYzNZ_CjksHbzbf_8qFqZX0IACyZggGoWz6jWq9eDMHcdUIqjTLiYVy78JvmoQ95pLUJpbzNX7DmiVApDFkwA9OnTsE-xGUEfLS_dnIfv02W0uh-N3Tz1sU3_8B9mSjrz_n9LdCFKIcpkRXsFu2mhBWgc",
            }}
            style={{ width: 64, height: 64, borderRadius: 32 }}
            contentFit="cover"
            accessibilityLabel="Profile"
          />
        </View>
      </StackScreenShell>
    </View>
  );
}
