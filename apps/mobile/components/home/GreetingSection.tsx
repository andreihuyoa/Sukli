import { Pressable, Text, View } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { Card } from "@/components/home/Card";
import { formatPesoDisplay } from "@/components/home/home.utils";
import { AppIcon } from "@/components/ui/AppIcon";

type Props = {
  displayName: string;
  dateLabel: string;
  greetingLine: string;
  amountDisplay: string;
  percentChange: number;
  isEmpty: boolean;
  onAddSale?: () => void;
  onAddProduct?: () => void;
};

export function GreetingSection({
  dateLabel,
  greetingLine,
  displayName,
  amountDisplay,
  percentChange,
  isEmpty,
  onAddSale,
  onAddProduct,
}: Props) {
  return (
    <View className="gap-4">
      <View className="pb-1">
        <Text className="text-xs font-body font-medium tracking-[0.08em] text-label-muted">
          {dateLabel}
        </Text>
        <Text
          className="mt-1 text-label-primary"
          style={{ fontSize: 20, fontWeight: "800", letterSpacing: -0.3 }}
        >
          {greetingLine} {displayName}
        </Text>
      </View>

      <Entrance>
        <Card className="rounded-3xl px-6 pb-5 pt-6">
          <View className="mb-3 self-start rounded-full border border-accent-focus-border bg-accent-focus-soft px-3 py-1.5">
            <Text className="text-[10px] font-label font-bold uppercase tracking-[0.18em] text-accent-focus">
              Focus panel
            </Text>
          </View>
          <Text className="mb-3 text-[10px] font-label font-bold uppercase tracking-[0.18em] text-label-muted">
            Today&apos;s revenue
          </Text>

          {isEmpty ? (
            <View className="min-h-[84px] justify-end">
              <Text className="text-[22px] font-black tracking-[-0.3px] text-label-primary">
                No sales recorded yet
              </Text>
              <Text className="mt-2 max-w-[260px] text-[12px] font-body-medium leading-5 text-label-muted">
                Start your day by recording a sale or adding products to your
                catalog.
              </Text>
            </View>
          ) : (
            <Text
              className="text-label-primary"
              style={{
                fontSize: 42,
                fontWeight: "900",
                letterSpacing: -0.6,
                lineHeight: 44,
              }}
            >
              {formatPesoDisplay(amountDisplay)}
            </Text>
          )}

          <View className="mt-4 max-w-full self-start rounded-full border border-outline bg-surface-container px-3 py-1.5">
            <View className="flex-row items-center gap-1.5">
              <AppIcon
                name={isEmpty ? "checklist" : "trending_up"}
                size={14}
                className="text-accent-focus"
                strokeWidth={2.5}
              />
              <Text className="flex-shrink text-[11px] font-body font-bold text-label-primary">
                {isEmpty
                  ? "Waiting for today’s first transaction"
                  : percentChange === 0
                    ? "No comparison data"
                    : `+${percentChange}% from yesterday`}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={onAddSale}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-revenue-hero py-3"
              style={{ minWidth: 132 }}
            >
              <AppIcon
                name="add"
                size={16}
                className="text-on-primary"
                strokeWidth={2.5}
              />
              <Text className="text-[13px] font-body font-bold text-on-primary">
                Add Sale
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onAddProduct}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-outline bg-surface-container py-3"
              style={{ minWidth: 132 }}
            >
              <AppIcon
                name="add_box"
                size={16}
                className="text-forest"
                strokeWidth={2}
              />
              <Text className="text-[13px] font-body font-bold text-label-primary">
                Add Product
              </Text>
            </Pressable>
          </View>
        </Card>
      </Entrance>
    </View>
  );
}
