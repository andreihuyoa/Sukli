import { View, Text, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

const ITEMS = [
  {
    id: "1",
    title: "Soda Cola 500ml",
    meta: "Beverages • SKU-9041",
    price: "₱18.00",
    stock: "4 pcs",
    stockCritical: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsHq9KWvMcyEaFzRS5r5fjLcC5u2-gdg07TprBWlJYame9E9l_mrDQIM6Hqt1fUPGThaSYSfQAY9ms-ySkBfdPi5AYKierXavjeC5KRe_91fnWk6n5d_fZ4MaTdABbQr6veNQ2hme0WbjVMe_GconBWfgVoTpGcrawqmCL0E9rJ07P__drtIYeMAOVEYqAusAQi1Alb32DVTuzOotPTEh1XR4cle_mCA6b3uJbJrdjlmllLTyR9bdpNvdl6E5bumxbVCnZI4m2UuU",
  },
  {
    id: "2",
    title: "Instant Coffee 3-in-1",
    meta: "Canned & Dried • SKU-2204",
    price: "₱12.00",
    stock: "48 pcs",
    stockCritical: false,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvJKKKXzKgmq2mIFmKFCz3d6bo50wVj4ebAKDwYzh6kwbnkQscoQNFhujG_ZCW6z_nV95z_d-zAxmN0rCapJt_1QSuI6UOT5XC4hSk-uGcaeC5645CzkpjVpywhhqUTjhwnTWHJMtLTqTauKXR6Hbe8VeULwSUPmmjPf690_1e7-iGhkr6MSefsA4IlBrA2FOkhk7s0l_fpDerV1GFeGwxMr2_eKB_cKeu4g5VeSOxmXarSJ-x9i6PkUZ98Hmlr8GqqSPwYDCr4wA",
  },
];

export default function InventoryScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader
        right={
          <View className="flex-row items-center gap-3">
            <Pressable className="min-h-[48px] min-w-[48px] items-center justify-center rounded-full active:opacity-80">
              <AppIcon name="cloud_sync" size={24} color="#ffffff" />
            </Pressable>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-fixed">
              <Text className="text-xs font-bold text-on-primary-fixed">JD</Text>
            </View>
          </View>
        }
      />
      <ScreenShell>
        <View className="mb-8">
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-container-high p-2">
            <AppIcon name="search" size={22} color="#727970" />
            <TextInput
              placeholder="Search products, categories, or barcodes..."
              placeholderTextColor="#727970"
              className="min-h-[48px] flex-1 font-body text-on-surface"
              accessibilityLabel="Search inventory"
            />
            <Pressable className="mr-1 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-primary active:opacity-90">
              <AppIcon name="qr_code_scanner" size={22} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <View className="mb-8 flex-row flex-wrap gap-4">
          <StatMini icon="inventory_2" value="142" label="Total SKUs" tone="default" />
          <StatMini icon="warning" value="12" label="Low Stock" tone="error" />
          <StatMini icon="category" value="8" label="Categories" tone="default" />
          <StatMini icon="trending_up" value="94%" label="Health Rate" tone="secondary" />
        </View>

        <View className="mb-4 flex-row items-center justify-between px-2">
          <Text className="font-headline text-lg font-bold text-on-surface">Product Inventory</Text>
          <View className="flex-row gap-2">
            <Pressable className="flex-row items-center gap-2 rounded-lg bg-surface-container p-2">
              <AppIcon name="filter_list" size={18} color="#414941" />
              <Text className="text-xs font-semibold text-on-surface-variant">Filter</Text>
            </Pressable>
            <Pressable className="flex-row items-center gap-2 rounded-lg bg-surface-container p-2">
              <AppIcon name="sort" size={18} color="#414941" />
              <Text className="text-xs font-semibold text-on-surface-variant">Sort</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          {ITEMS.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between rounded-xl bg-surface-container-lowest p-4"
            >
              <View className="flex-row items-center gap-4">
                <View className="h-14 w-14 overflow-hidden rounded-lg bg-surface-variant">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 56, height: 56 }}
                    contentFit="cover"
                    accessibilityLabel={item.title}
                  />
                </View>
                <View className="max-w-[42%]">
                  <Text className="font-body-medium text-on-surface" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-xs font-medium text-outline" numberOfLines={1}>
                    {item.meta}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-6">
                <View className="items-end">
                  <Text className="text-xs font-bold uppercase tracking-wider text-outline">Price</Text>
                  <Text className="font-headline font-bold text-on-surface">{item.price}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-bold uppercase tracking-wider text-outline">Stock</Text>
                  <View className="flex-row items-center gap-1">
                    {item.stockCritical ? (
                      <View className="h-2 w-2 rounded-full bg-error" />
                    ) : null}
                    <Text
                      className={`font-headline font-bold ${item.stockCritical ? "text-error" : "text-on-surface"}`}
                    >
                      {item.stock}
                    </Text>
                  </View>
                </View>
                <Pressable accessibilityRole="button" hitSlop={8} className="min-h-[48px] min-w-[48px] items-center justify-center">
                  <AppIcon name="more_vert" size={22} color="#727970" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScreenShell>
    </View>
  );
}

function StatMini({
  icon,
  value,
  label,
  tone,
}: {
  icon: AppIconName;
  value: string;
  label: string;
  tone: "default" | "error" | "secondary";
}) {
  const color =
    tone === "error" ? "#ba1a1a" : tone === "secondary" ? "#3d6924" : "#204e2b";
  return (
    <View className="h-32 min-w-[46%] flex-1 justify-between rounded-xl bg-surface-container-lowest p-5">
      <AppIcon name={icon} size={28} color={color} />
      <View>
        <Text
          className={`font-headline text-[2rem] font-bold leading-none tracking-tight ${
            tone === "error" ? "text-error" : tone === "secondary" ? "text-secondary" : "text-on-surface"
          }`}
        >
          {value}
        </Text>
        <Text className="mt-1 text-[10px] font-label font-semibold uppercase tracking-wider text-outline">
          {label}
        </Text>
      </View>
    </View>
  );
}
