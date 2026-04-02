import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AppIcon } from "@/components/ui/AppIcon";

const PRODUCTS = [
  {
    id: "1",
    name: "Coke Mismo 290ml",
    price: "₱18.00",
    stock: "24 pcs",
    qty: 0,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOGWkw5BvxX9YF9I2zzL7UmxbH3aZXssuxvac6eTUfZLmMsZJCgDr8ZaMIgyHCxpZvvhdFdbV4UIE8yB1PjZWpQb_PAjeDRvQjGO8upUAt1_Tr6YWydV-UMjIWhkNlFRX-6v_JvVqhOLltXe_3Llf7a1-ZSJa-4W5CIbx2LZZq2goygHNmf12Ws0EWFbmT0-Zydo-SmDMKIQFi1Te4rQ7579oT0OHKSauxDiSbxsqqTEeE8RbRMH70muW9SuLg0W3bLiZEwmYNIsQ",
  },
  {
    id: "2",
    name: "Nescafe 3-in-1 Stick",
    price: "₱12.00",
    stock: "156 pcs",
    qty: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXAChjQI9ym0isTaM_8xyyhxyHa8kSskVG21yrpw_KLLUbM30gZmlUGeEurXKuVlLSpXSYelxlDM9fsZaDefKwEPnEcVhv_JRBzwagSC3SEwuwXqWLl8W_f1eVgdGVOGf6IPyg3n7WGB4_6WC7W4s04z7W2B8XDcERMTRZj71vGrsVJmD3JMJb3K_didjFxviEcsEm3qyGe8rAoU9grIm2tWvY44YZmqnF-QxBR81MjBqij4PTjSZ0kG4cFLElFH1p_Xb_0HyF0Eo",
  },
];

export default function SalesScreen() {
  const [query, setQuery] = useState("");

  return (
    <View className="flex-1 bg-background">
      <AppHeader />
      <ScreenShell>
        <View className="mb-6 flex-row gap-4">
          <View className="min-h-[140px] flex-[2] justify-between rounded-xl bg-surface-container-lowest p-6">
            <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Today&apos;s Total Sales
            </Text>
            <View className="mt-2 flex-row items-baseline gap-2">
              <Text className="font-headline text-4xl font-extrabold text-primary">₱12,450.00</Text>
              <Text className="text-sm font-bold text-tertiary">↑ 12% vs yesterday</Text>
            </View>
          </View>
          <View className="min-h-[140px] flex-1 items-center justify-center rounded-xl bg-surface-container-high p-6">
            <AppIcon name="receipt_long" size={32} color="#204e2b" />
            <Text className="mt-1 font-headline text-xl font-bold text-on-background">42</Text>
            <Text className="text-center text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              Transactions Today
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="relative">
            <View className="pointer-events-none absolute inset-y-0 left-0 z-10 justify-center pl-4">
              <AppIcon name="search" size={22} color="#727970" />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search product or scan barcode..."
              placeholderTextColor="#72797099"
              className="rounded-xl bg-surface-container-high py-4 pl-12 pr-14 font-body text-on-surface"
              accessibilityLabel="Search products"
            />
            <View className="absolute inset-y-0 right-4 justify-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scan barcode"
                className="min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-primary/10"
              >
                <AppIcon name="barcode_scanner" size={22} color="#204e2b" />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mb-2 flex-row items-center justify-between px-2">
          <Text className="font-headline font-bold text-on-surface">Common Items</Text>
          <Pressable>
            <Text className="text-sm font-bold text-primary">Show all categories</Text>
          </Pressable>
        </View>

        <View className="gap-4">
          {PRODUCTS.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </View>
      </ScreenShell>
    </View>
  );
}

function ProductRow({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: string;
    stock: string;
    qty: number;
    image: string;
  };
}) {
  const [qty, setQty] = useState(product.qty);

  return (
    <View className="flex-row items-center gap-4 rounded-xl bg-surface-container-lowest p-4">
      <View className="h-20 w-20 overflow-hidden rounded-lg bg-surface-variant">
        <Image
          source={{ uri: product.image }}
          style={{ width: 80, height: 80 }}
          contentFit="cover"
          accessibilityLabel={product.name}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-headline font-bold leading-tight text-on-surface">{product.name}</Text>
        <Text className="mt-1 font-headline text-lg font-bold text-primary">{product.price}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant" numberOfLines={1}>
          Stock: {product.stock}
        </Text>
      </View>
      <View className="items-center gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          onPress={() => setQty((q) => q + 1)}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80"
        >
          <AppIcon name="add" size={22} color="#ffffff" />
        </Pressable>
        <Text className="font-headline font-bold text-on-surface">{qty}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease quantity"
          onPress={() => setQty((q) => Math.max(0, q - 1))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high active:opacity-80"
        >
          <AppIcon name="remove" size={22} color="#727970" />
        </Pressable>
      </View>
    </View>
  );
}
