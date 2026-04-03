import { View, Text } from "react-native";
import { AppIcon } from "../ui/AppIcon";

type Props = {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
  iconColor?: string;
  backgroundColor?: string;
};

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  iconColor = "#204e2b",
  backgroundColor = "bg-surface-container-lowest",
}: Props) {
  return (
    <View
      className={`flex-1 rounded-3xl p-5 min-h-[140px] justify-between ${backgroundColor}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="rounded-xl bg-surface-variant p-2.5">
          <AppIcon name={icon} size={20} color={iconColor} />
        </View>
        <Text className="text-xs font-bold uppercase tracking-wider text-outline">
          {label}
        </Text>
      </View>
      <View>
        <Text className="font-headline text-2xl font-bold text-on-surface">
          {value}
        </Text>
        <Text className="text-xs text-on-surface-variant mt-1">{subtitle}</Text>
      </View>
    </View>
  );
}
