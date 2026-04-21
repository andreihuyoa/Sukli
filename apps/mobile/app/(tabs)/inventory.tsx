import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { AppIcon } from "@/components/ui/AppIcon";
import { useInventory } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types";

const TAB_BAR = 88;
const TOP_CONTENT_INSET = 16;

export default function InventoryScreen() {
  const { items } = useInventory();
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  const lowStockCount = useMemo(
    () => items.filter((i) => i.status === "low").length,
    [items]
  );
  const totalSkus = items.length;

  return (
    <View className="flex-1 bg-screen-grouped">
      <FlashList
        data={filtered}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_CONTENT_INSET,
          paddingBottom: TAB_BAR + insets.bottom + 24,
        }}
        ListHeaderComponent={
          <View>
            <View className="px-5 pt-2 pb-5">
              <Text
                className="text-[10px] font-label font-bold uppercase tracking-[0.2em]"
                style={{ color: "#8e8e93" }}
              >
                Manage
              </Text>
              <Text
                className="font-headline text-3xl font-extrabold"
                style={{
                  color: "#1b4332",
                  letterSpacing: -0.2,
                  lineHeight: 1.15,
                }}
              >
                Current Stock
              </Text>
            </View>

            <View className="flex-row gap-3 mx-4 mb-5">
              <Entrance delayMs={50}>
                <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-outline bg-glass-surface p-4">
                  <View
                    className="h-10 w-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: "#2d6a4f" }}
                  >
                    <AppIcon
                      name="category"
                      size={18}
                      color="#ffffff"
                      strokeWidth={2.5}
                    />
                  </View>
                  <View>
                    <Text
                      className="text-[10px] font-label font-bold uppercase tracking-[0.2em]"
                      style={{ color: "#8e8e93" }}
                    >
                      Total SKUs
                    </Text>
                    <Text
                      className="font-headline text-[30px] font-extrabold"
                      style={{ color: "#1b4332", lineHeight: 1.1 }}
                    >
                      {totalSkus.toLocaleString("en-PH")}
                    </Text>
                  </View>
                </View>
              </Entrance>

              <Entrance delayMs={100}>
                <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-critical-border bg-glass-surface p-4">
                  <View
                    className="h-10 w-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: "rgba(106,51,66,0.12)" }}
                  >
                    <AppIcon
                      name="warning"
                      size={18}
                      color="#6a3342"
                      strokeWidth={2.5}
                    />
                  </View>
                  <View>
                    <Text
                      className="text-[10px] font-label font-bold uppercase tracking-[0.2em]"
                      style={{ color: "#8e8e93" }}
                    >
                      Low Stock
                    </Text>
                    <Text
                      className="font-headline text-[30px] font-extrabold"
                      style={{ color: "#6a3342", lineHeight: 1.1 }}
                    >
                      {lowStockCount}
                    </Text>
                  </View>
                </View>
              </Entrance>
            </View>

            <View className="mx-4 mb-3">
              <Entrance delayMs={150}>
                <View className="flex-row items-center gap-3 rounded-2xl border border-outline bg-glass-surface px-4 py-3">
                  <AppIcon
                    name="search"
                    size={16}
                    color="#8e8e93"
                    strokeWidth={2}
                  />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search inventory..."
                    placeholderTextColor="#8e8e93"
                    className="flex-1 bg-transparent text-sm font-body"
                    style={{ color: "#1c1c1e", fontWeight: "500" }}
                    accessibilityLabel="Search inventory"
                  />
                </View>
              </Entrance>
            </View>

            <View className="flex-row gap-2 mx-4 mb-5">
              <Entrance delayMs={180}>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-outline bg-glass-surface py-2.5"
                >
                  <AppIcon
                    name="filter_list"
                    size={14}
                    color="#1b4332"
                    strokeWidth={2.5}
                  />
                  <Text
                    className="text-[13px] font-bold"
                    style={{ color: "#1c1c1e" }}
                  >
                    Filters
                  </Text>
                </Pressable>
              </Entrance>

              <Entrance delayMs={220}>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-outline bg-glass-surface py-2.5"
                >
                  <AppIcon
                    name="sort"
                    size={14}
                    color="#1b4332"
                    strokeWidth={2.5}
                  />
                  <Text
                    className="text-[13px] font-bold"
                    style={{ color: "#1c1c1e" }}
                  >
                    Sort
                  </Text>
                </Pressable>
              </Entrance>
            </View>

            <Entrance delayMs={250}>
              <View className="px-4 mb-3">
                <Text
                  className="font-body-medium text-[17px] font-bold"
                  style={{ color: "#1b4332", letterSpacing: -0.1 }}
                >
                  {query ? `Results for \"${query}\"` : "All Items"}
                </Text>
              </View>
            </Entrance>
          </View>
        }
        renderItem={({ item, index }) => (
          <InventoryRow item={item} index={index} />
        )}
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <Text
              className="text-sm font-body text-center"
              style={{ color: "#8e8e93" }}
            >
              No inventory yet. Connect your store data to see SKUs here.
            </Text>
          </View>
        }
        ListFooterComponent={
          <Entrance delayMs={500}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add new product"
              className="mx-4 mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
              style={{
                backgroundColor: "#fffaf2",
                borderStyle: "dashed",
                borderWidth: 1.5,
                borderColor: "#b8b3aa",
              }}
              onPress={() => {
                // Wire to catalog / API create flow.
              }}
            >
              <AppIcon
                name="add_box"
                size={16}
                color="#1b4332"
                strokeWidth={2.5}
              />
              <Text
                className="font-body-medium font-bold"
                style={{ color: "#1b4332", fontSize: 14 }}
              >
                Add New Product
              </Text>
            </Pressable>
          </Entrance>
        }
      />
    </View>
  );
}

function InventoryRow(props: { item: InventoryItem; index: number }) {
  const { item, index } = props;
  const isLow = item.status === "low";
  return (
    <Entrance delayMs={100 + index * 60}>
      <View
        className="overflow-hidden rounded-2xl border border-outline"
        style={{
          backgroundColor: "#fffaf2",
          borderBottomWidth: isLow ? 3 : 0,
          borderBottomColor: isLow ? "rgba(106,51,66,0.3)" : "transparent",
        }}
      >
        <View className="flex-row items-center gap-3 p-4">
          <View
            className="h-16 w-16 rounded-xl overflow-hidden shrink-0"
            style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 64, height: 64 }}
              contentFit="cover"
            />
          </View>

          <View className="flex-1 min-w-0">
            <Text
              className="font-body-medium mb-1"
              numberOfLines={1}
              style={{ color: "#1c1c1e", fontWeight: "700", fontSize: 14 }}
            >
              {item.name}
            </Text>
            <Text
              className="text-xs mb-2"
              numberOfLines={1}
              style={{ color: "#8e8e93", fontWeight: "500" }}
            >
              {item.category}
            </Text>

            <View className="flex-row items-center gap-2">
              <Text
                className="font-headline font-bold"
                style={{ color: "#1b4332", fontSize: 15 }}
              >
                {item.priceDisplay}
              </Text>
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isLow ? "#6a3342" : "#8e8e93",
                  fontWeight: "600",
                }}
              >
                · {item.available} {item.unit}
              </Text>
            </View>
          </View>

          <View className="flex-col items-end gap-2 shrink-0">
            <View
              className="px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: isLow
                  ? "rgba(106,51,66,0.1)"
                  : "rgba(27,67,50,0.1)",
              }}
            >
              <Text
                className="text-[10px] font-label font-bold uppercase"
                style={{
                  color: isLow ? "#6a3342" : "#1b4332",
                  fontWeight: "800",
                }}
              >
                {isLow ? "Low Stock" : "Optimal"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              className="h-7 w-7 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            >
              <AppIcon
                name="more_vert"
                size={14}
                color="#8e8e93"
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Entrance>
  );
}
