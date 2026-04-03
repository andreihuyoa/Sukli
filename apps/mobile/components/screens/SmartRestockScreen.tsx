import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { useRestockSuggestions } from "@/hooks/useRestockSuggestions";

const TAB_BAR = 88;

export function SmartRestockScreen(props: { onBackPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { items, insight } = useRestockSuggestions();
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTotal = useMemo(() => {
    return items.filter((i) => checked.has(i.id)).reduce((sum, i) => sum + i.estimatedLineTotalPhp, 0);
  }, [checked, items]);

  return (
    <View className="flex-1" style={{ backgroundColor: "#f2f2f7" }}>
      <AppHeader onBackPress={props.onBackPress} />

      <View className="px-5 pt-2 pb-3">
        <Entrance>
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8e8e93", fontWeight: 600 }}>
              Smart Inventory
            </Text>
            <Text style={{ color: "#1b4332", fontSize: 30, fontWeight: "900", letterSpacing: -0.2, lineHeight: 34 }}>Restock List</Text>
            <Text style={{ color: "#6b6b6b", fontWeight: "600", fontSize: 13, marginTop: 4 }}>
              Smart suggestions based on sales velocity.
            </Text>
          </View>
        </Entrance>
      </View>

      <View className="flex-row gap-3 mx-4 mb-5">
        <Entrance delayMs={60}>
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.82)",
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "#8e8e93", fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>Items to Buy</Text>
            <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 40, lineHeight: 40, letterSpacing: -0.2 }}>{items.length}</Text>
            <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}>{checked.size} selected</Text>
          </View>
        </Entrance>

        <Entrance delayMs={90}>
          <View
            className="flex-1 rounded-2xl p-4 justify-between"
            style={{
              backgroundColor: "#2d6a4f",
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.65)", fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>Est. Total</Text>
            <View>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 28, letterSpacing: -0.2, lineHeight: 30 }}>
                ₱{selectedTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.55)", fontWeight: "700", fontSize: 12, marginTop: 2 }}>for selected</Text>
            </View>
          </View>
        </Entrance>
      </View>

      <View className="px-4 mb-3 flex-row items-center justify-between">
        <Entrance delayMs={120}>
          <View>
            <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 16, letterSpacing: -0.1 }}>Suggested items</Text>
          </View>
        </Entrance>
        <Entrance delayMs={140}>
          <Text style={{ color: "#8e8e93", fontWeight: "700", fontSize: 12 }}>Selected: {checked.size}</Text>
        </Entrance>
      </View>

      <View className="px-4 pb-6">
        {items.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-sm text-center px-4" style={{ color: "#8e8e93" }}>
              No restock suggestions yet. Connect sales and inventory data to populate this list.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {items.map((item, i) => (
              <Entrance key={item.id} delayMs={150 + i * 60}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${item.name}`}
                  onPress={() => toggle(item.id)}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.82)",
                    borderRadius: 16,
                    borderBottomWidth: item.critical ? 3 : 0,
                    borderBottomColor: item.critical ? "rgba(106,51,66,0.35)" : "transparent",
                    opacity: checked.has(item.id) ? 1 : 0.72,
                  }}
                >
                  <View className="flex-row items-center gap-3 p-4 active:opacity-80">
                    <View style={{ width: 34, alignItems: "center" }}>
                      {checked.has(item.id) ? (
                        <AppIcon name="check_circle" size={22} color="#1b4332" strokeWidth={2.2} />
                      ) : (
                        <AppIcon name="circle" size={22} color="#c1c9be" strokeWidth={1.8} />
                      )}
                    </View>

                    <View className="h-14 w-14 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                      <ImageWithFallback src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%" }} />
                    </View>

                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text numberOfLines={1} style={{ color: "#1c1c1e", fontWeight: "900", fontSize: 14 }}>
                          {item.name}
                        </Text>
                        {item.critical ? (
                          <View
                            className="rounded-full px-2.5 py-1"
                            style={{ backgroundColor: "#6a3342", alignItems: "center", justifyContent: "center" }}
                          >
                            <View className="flex-row items-center gap-1">
                              <AppIcon name="warning" size={10} color="#fff" strokeWidth={3} />
                              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10, letterSpacing: 1 }}>CRITICAL</Text>
                            </View>
                          </View>
                        ) : null}
                      </View>

                      <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12 }}>{item.detailDisplay}</Text>
                    </View>

                    <View className="px-2.5 py-2 rounded-full" style={{ backgroundColor: "rgba(27,67,50,0.08)" }}>
                      <Text style={{ color: "#1b4332", fontWeight: "900", fontSize: 12 }}>Qty: {item.suggestedQty}</Text>
                    </View>
                  </View>
                </Pressable>
              </Entrance>
            ))}
          </View>
        )}

        {insight ? (
          <Entrance delayMs={420}>
            <View
              className="rounded-2xl p-4 flex-row items-center gap-3"
              style={{
                backgroundColor: "rgba(106,51,66,0.07)",
                borderWidth: 1,
                borderColor: "rgba(106,51,66,0.15)",
                marginTop: 18,
              }}
            >
              <View className="h-10 w-10 rounded-xl items-center justify-center" style={{ backgroundColor: "rgba(106,51,66,0.12)" }}>
                <AppIcon name="trending_down" size={16} color="#6a3342" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#6a3342", fontWeight: "900", fontSize: 14 }}>{insight.title}</Text>
                <Text style={{ color: "#8e8e93", fontWeight: "600", fontSize: 12, marginTop: 2 }}>{insight.body}</Text>
              </View>
            </View>
          </Entrance>
        ) : null}
      </View>

      <Entrance delayMs={520}>
        <View style={{ position: "absolute", left: 16, right: 16, bottom: TAB_BAR + insets.bottom + 6 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add selected to list"
            onPress={() => {}}
            className="w-full items-center justify-center gap-2 py-4 rounded-2xl"
            style={{
              backgroundColor: "#2d6a4f",
              borderRadius: 16,
            }}
          >
            <View className="flex-row items-center gap-2.5">
              <AppIcon name="cart" size={18} color="#fff" strokeWidth={2} />
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                Add Selected to List
              </Text>
            </View>
            {checked.size > 0 ? (
              <View
                className="h-5 w-5 rounded-full items-center justify-center self-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>{checked.size}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </Entrance>
    </View>
  );
}

export default SmartRestockScreen;
