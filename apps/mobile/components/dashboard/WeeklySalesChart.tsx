import { View, Text } from "react-native";

type WeeklyData = {
  day: string;
  value: number;
  isToday?: boolean;
};

type Props = {
  data: WeeklyData[];
  maxValue?: number;
};

const DEFAULT_DATA: WeeklyData[] = [
  { day: "Mon", value: 8400 },
  { day: "Tue", value: 6210 },
  { day: "Wed", value: 7290 },
  { day: "Thu", value: 9200 },
  { day: "Fri", value: 7240 },
  { day: "Sat", value: 12900, isToday: true },
  { day: "Sun", value: 8940 },
];

export function WeeklySalesChart({ data = DEFAULT_DATA, maxValue = 13000 }: Props) {
  return (
    <View className="rounded-3xl bg-surface-container-lowest p-6">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="font-headline text-lg font-bold text-on-surface">
          Weekly Sales Trend
        </Text>
        <Text className="text-xs font-semibold text-primary">Last 7 Days</Text>
      </View>

      {/* Chart */}
      <View className="mb-6 h-32 flex-row items-end justify-between gap-2 px-2">
        {data.map((item, idx) => {
          const height = (item.value / maxValue) * 100;
          return (
            <View key={`${item.day}-${idx}`} className="flex-1 justify-end">
              <View
                className={`w-full rounded-t-lg ${
                  item.isToday ? "bg-primary-container" : "bg-primary-fixed"
                }`}
                style={{ height: `${height}%` }}
              />
            </View>
          );
        })}
      </View>

      {/* Labels */}
      <View className="flex-row justify-between px-1">
        {data.map((item, idx) => (
          <Text
            key={`label-${item.day}-${idx}`}
            className="text-[10px] font-bold uppercase tracking-tighter text-outline"
          >
            {item.day}
          </Text>
        ))}
      </View>

      {/* Total for week */}
      <View className="mt-5 border-t border-outline-variant pt-4">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Weekly Total
          </Text>
          <Text className="font-headline text-lg font-bold text-primary">
            ₱{data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
