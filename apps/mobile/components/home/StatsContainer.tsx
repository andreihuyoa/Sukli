import { Text, View, type ViewStyle } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { Card } from "@/components/home/Card";
import { isPlaceholderValue } from "@/components/home/home.utils";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

const GridItemStyle: ViewStyle = {
  width: "48%",
  maxWidth: "48%",
  minWidth: 0,
  flexGrow: 0,
  flexShrink: 0,
  aspectRatio: 1,
};

const CardStyle: ViewStyle = {
  width: "100%",
  height: "100%",
};

type Props = {
  activeStockDisplay: string;
  activeStockSubtitle: string;
  profitEstDisplay: string;
  profitEstSubtitle: string;
};

type MetricCardProps = {
  iconKey: AppIconName;
  label: string;
  value: string;
  subtitle: string;
  emptyLabel: string;
  delayMs?: number;
  accentIconClassName: string;
  accentSurfaceClassName: string;
};

function MetricCard({
  iconKey,
  label,
  value,
  subtitle,
  emptyLabel,
  delayMs = 0,
  accentIconClassName,
  accentSurfaceClassName,
}: MetricCardProps) {
  const isEmpty = isPlaceholderValue(value);

  return (
    <View style={GridItemStyle}>
      <Entrance delayMs={delayMs}>
        <Card className="min-w-0 p-4" style={CardStyle}>
          <View className="mb-3 flex-row items-start justify-between gap-3">
            <View
              className={`h-8 w-8 items-center justify-center rounded-xl ${accentSurfaceClassName}`}
            >
              <AppIcon
                name={iconKey}
                size={18}
                className={accentIconClassName}
                strokeWidth={2}
              />
            </View>
            <Text
              numberOfLines={2}
              className="flex-1 text-right text-[10px] font-label font-bold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {label}
            </Text>
          </View>

          {isEmpty ? (
            <View className="min-h-[64px] justify-end">
              <Text className="mb-2 text-[15px] font-body-semibold text-foreground">
                {emptyLabel}
              </Text>
              <Text className="text-[11px] font-body-medium leading-4 text-muted-foreground">
                {subtitle}
              </Text>
            </View>
          ) : (
            <>
              <Text
                className="mb-0.5 text-foreground"
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                  lineHeight: 32,
                }}
              >
                {value}
              </Text>
              <Text className="text-[11px] font-body font-medium leading-4 text-muted-foreground">
                {subtitle}
              </Text>
            </>
          )}
        </Card>
      </Entrance>
    </View>
  );
}

export function StatsContainer({
  activeStockDisplay,
  activeStockSubtitle,
  profitEstDisplay,
  profitEstSubtitle,
}: Props) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      <MetricCard
        iconKey="inventory_2"
        label="Active Stock"
        value={activeStockDisplay}
        subtitle={activeStockSubtitle}
        emptyLabel="No catalog connected"
        delayMs={50}
        accentIconClassName="text-primary"
        accentSurfaceClassName="bg-primary/14"
      />

      <MetricCard
        iconKey="payments"
        label="Profit Est."
        value={profitEstDisplay}
        subtitle={profitEstSubtitle}
        emptyLabel="Profit needs sales data"
        delayMs={90}
        accentIconClassName="text-primary-strong"
        accentSurfaceClassName="bg-primary/10"
      />
    </View>
  );
}
