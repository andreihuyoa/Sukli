import { View, Text } from "react-native";
import { AppIcon } from "../ui/AppIcon";

type Props = {
  label: string;
  amount: string;
  subtitle?: string;
  trend?: {
    percentage: number;
    direction: "up" | "down";
  };
  variant?: "primary" | "secondary" | "tertiary";
};

export function RevenueSummaryCard({
  label,
  amount,
  subtitle,
  trend,
  variant = "primary",
}: Props) {
  const containerColors = {
    primary: "bg-primary-container",
    secondary: "bg-secondary-container",
    tertiary: "bg-tertiary-container",
  };

  const textColor = "text-white";

  return (
    <View
      className={`relative overflow-hidden rounded-3xl p-6 shadow-md ${containerColors[variant]}`}
    >
      <View className="relative z-10">
        <Text className={`font-label text-xs uppercase tracking-wider ${textColor}/70`}>
          {label}
        </Text>
        <View className="mt-3 flex-row items-baseline gap-1">
          <Text className={`font-headline text-3xl font-bold ${textColor}`}>
            {amount}
          </Text>
        </View>

        {(subtitle || trend) && (
          <View className="mt-4 flex-row items-center gap-2">
            {trend && (
              <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-3 py-1">
                <AppIcon
                  name="trending_up"
                  size={14}
                  color="#ffffff"
                />
                <Text className={`text-xs font-bold ${textColor}`}>
                  {trend.direction === "up" ? "+" : "-"}
                  {trend.percentage}% vs yesterday
                </Text>
              </View>
            )}
            {subtitle && !trend && (
              <Text className={`text-xs font-body ${textColor}/70`}>{subtitle}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
