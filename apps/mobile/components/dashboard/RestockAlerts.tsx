import { View, Text, Pressable, FlatList } from "react-native";
import { AppIcon } from "../ui/AppIcon";

export type RestockItem = {
  id: string;
  name: string;
  unitsLeft: number;
  icon?: string;
};

type Props = {
  items: RestockItem[];
  onQuickReorder?: (itemId: string) => void;
};

export function RestockAlerts({ items, onQuickReorder }: Props) {
  return (
    <View className="rounded-3xl bg-surface-container-lowest p-6">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="font-headline text-lg font-bold text-on-surface">
          Restock Required
        </Text>
        <View className="rounded-full bg-error-container/20 px-3 py-1">
          <Text className="text-xs font-bold text-error">{items.length} Alerts</Text>
        </View>
      </View>

      <View className="gap-3">
        {items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between rounded-2xl bg-surface-container-low p-4"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-variant">
                <AppIcon
                  name={item.icon || "inventory_2"}
                  size={20}
                  color="#414941"
                />
              </View>
              <View className="flex-1">
                <Text className="font-body-semibold text-sm text-on-surface">
                  {item.name}
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  {item.unitsLeft} units left
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => onQuickReorder?.(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Quick reorder ${item.name}`}
              className="active:opacity-70"
            >
              <Text className="text-xs font-bold text-primary">Reorder</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
