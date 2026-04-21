import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppIcon } from "@/components/ui/AppIcon";
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
    return items
      .filter((item) => checked.has(item.id))
      .reduce((sum, item) => sum + item.estimatedLineTotalPhp, 0);
  }, [checked, items]);

  return (
    <View className="flex-1 bg-screen-grouped">
      <AppHeader onBackPress={props.onBackPress} />

      <View className="px-5 pt-2 pb-3">
        <Entrance>
          <View>
            <Text className="text-xs font-label font-bold uppercase tracking-widest text-label-muted">
              Smart Inventory
            </Text>
            <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-forest">
              Restock List
            </Text>
            <Text className="mt-1 text-[13px] font-body-semibold text-label-muted">
              Smart suggestions based on sales velocity.
            </Text>
          </View>
        </Entrance>
      </View>

      <View className="mx-4 mb-5 flex-row gap-3">
        <Entrance delayMs={60}>
          <View className="flex-1 rounded-2xl border border-outline bg-glass-surface p-4">
            <Text className="text-xs font-label font-bold uppercase tracking-[0.2em] text-label-muted">
              Items to Buy
            </Text>
            <Text className="text-[40px] font-black leading-10 tracking-[-0.2px] text-forest">
              {items.length}
            </Text>
            <Text className="text-xs font-body-semibold text-label-muted">
              {checked.size} selected
            </Text>
          </View>
        </Entrance>

        <Entrance delayMs={90}>
          <View className="flex-1 justify-between rounded-2xl border border-accent-info-border bg-accent-info-soft p-4">
            <Text className="text-xs font-label font-bold uppercase tracking-[0.2em] text-label-muted">
              Est. Total
            </Text>
            <View>
              <Text className="text-[28px] font-black leading-[30px] tracking-[-0.2px] text-label-primary">
                ₱
                {selectedTotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text className="mt-0.5 text-xs font-body font-bold text-label-muted">
                for selected
              </Text>
            </View>
          </View>
        </Entrance>
      </View>

      <View className="mb-3 flex-row items-center justify-between px-4">
        <Entrance delayMs={120}>
          <Text className="text-base font-body font-bold tracking-[-0.1px] text-forest">
            Suggested items
          </Text>
        </Entrance>
        <Entrance delayMs={140}>
          <Text className="text-xs font-body font-bold text-label-muted">
            Selected: {checked.size}
          </Text>
        </Entrance>
      </View>

      <View className="px-4 pb-6">
        {items.length === 0 ? (
          <View className="items-center py-10">
            <Text className="px-4 text-center text-sm text-label-muted">
              No restock suggestions yet. Connect sales and inventory data to
              populate this list.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {items.map((item, index) => (
              <Entrance key={item.id} delayMs={150 + index * 60}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${item.name}`}
                  onPress={() => toggle(item.id)}
                  className="overflow-hidden rounded-2xl border border-outline bg-glass-surface"
                  style={{
                    borderBottomWidth: item.critical ? 3 : 0,
                    borderBottomColor: item.critical
                      ? "#6a3342"
                      : "transparent",
                    opacity: checked.has(item.id) ? 1 : 0.72,
                  }}
                >
                  <View className="flex-row items-center gap-3 p-4 active:opacity-80">
                    <View className="w-[34px] items-center">
                      {checked.has(item.id) ? (
                        <AppIcon
                          name="check_circle"
                          size={22}
                          className="text-forest"
                          strokeWidth={2.2}
                        />
                      ) : (
                        <AppIcon
                          name="circle"
                          size={22}
                          className="text-outline-variant"
                          strokeWidth={1.8}
                        />
                      )}
                    </View>

                    <View className="h-14 w-14 overflow-hidden rounded-xl bg-overlay-soft">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>

                    <View className="min-w-0 flex-1">
                      <View className="mb-0.5 flex-row items-center gap-2">
                        <Text
                          numberOfLines={1}
                          className="text-sm font-body font-bold text-label-primary"
                        >
                          {item.name}
                        </Text>
                        {item.critical ? (
                          <View className="items-center justify-center rounded-full bg-critical px-2.5 py-1">
                            <View className="flex-row items-center gap-1">
                              <AppIcon
                                name="warning"
                                size={10}
                                className="text-on-primary"
                                strokeWidth={3}
                              />
                              <Text className="text-[10px] font-label font-bold tracking-[0.1em] text-on-primary">
                                CRITICAL
                              </Text>
                            </View>
                          </View>
                        ) : null}
                      </View>

                      <Text className="text-xs font-body-semibold text-label-muted">
                        {item.detailDisplay}
                      </Text>
                    </View>

                    <View className="rounded-full bg-forest-alpha-10 px-2.5 py-2">
                      <Text className="text-xs font-label font-bold text-forest">
                        Qty: {item.suggestedQty}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Entrance>
            ))}
          </View>
        )}

        {insight ? (
          <Entrance delayMs={420}>
            <View className="mt-[18px] flex-row items-center gap-3 rounded-2xl border border-accent-warn-border bg-accent-warn-soft p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-critical-soft-12">
                <AppIcon
                  name="trending_down"
                  size={16}
                  className="text-accent-warn"
                  strokeWidth={2.2}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-body font-bold text-label-primary">
                  {insight.title}
                </Text>
                <Text className="mt-0.5 text-xs font-body-semibold text-label-muted">
                  {insight.body}
                </Text>
              </View>
            </View>
          </Entrance>
        ) : null}
      </View>

      <Entrance delayMs={520}>
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: TAB_BAR + insets.bottom + 6,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add selected to list"
            onPress={() => {}}
            className="w-full items-center justify-center gap-2 rounded-2xl bg-revenue-hero py-4"
          >
            <View className="flex-row items-center gap-2.5">
              <AppIcon
                name="cart"
                size={18}
                className="text-on-primary"
                strokeWidth={2}
              />
              <Text className="text-sm font-label font-bold uppercase tracking-[0.1em] text-on-primary">
                Add Selected to List
              </Text>
            </View>
            {checked.size > 0 ? (
              <View className="h-5 w-5 self-center items-center justify-center rounded-full bg-hero-cta-ghost">
                <Text className="text-[10px] font-label font-bold text-on-primary">
                  {checked.size}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </Entrance>
    </View>
  );
}

export default SmartRestockScreen;
