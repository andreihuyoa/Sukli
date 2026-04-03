import { View, Pressable, Text } from "react-native";
import { router } from "expo-router";
import { AppIcon } from "../ui/AppIcon";

type ActionButton = {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

type Props = {
  actions: ActionButton[];
};

export function QuickActionButtons({ actions }: Props) {
  return (
    <View className="flex-row gap-3">
      {actions.map((action, idx) => {
        const isPrimary = action.variant !== "secondary";
        return (
          <Pressable
            key={`action-${idx}`}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className={`flex-1 flex-row items-center justify-center rounded-2xl py-4 shadow-sm active:opacity-80 ${
              isPrimary ? "bg-primary" : "bg-secondary"
            }`}
          >
            <AppIcon
              name={action.icon}
              size={20}
              color="#ffffff"
              strokeWidth={2}
            />
            <Text className="ml-2 font-headline text-sm font-bold text-white">
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
