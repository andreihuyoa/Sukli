import { Text, View, type ViewStyle } from "react-native";

import { Entrance } from "@/components/animation/Entrance";
import { Card } from "@/components/home/Card";
import {
  formatPesoDisplay,
  isPlaceholderValue,
} from "@/components/home/home.utils";
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
  gcashAmountDisplay: string;
  gcashChangeLabel: string;
  cashSalesAmountDisplay: string;
  cashSalesShareLabel: string;
  isEmpty: boolean;
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
              className="flex-1 text-right text-[10px] font-label font-bold uppercase tracking-[0.16em] text-label-muted"
            >
              {label}
            </Text>
          </View>

          {isEmpty ? (
            <View className="min-h-[64px] justify-end">
              <Text className="mb-2 text-[15px] font-body-semibold text-label-primary">
                {emptyLabel}
              </Text>
              <Text className="text-[11px] font-body-medium leading-4 text-label-muted">
                {subtitle}
              </Text>
            </View>
          ) : (
            <>
              <Text
                className="mb-0.5 text-label-primary"
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                  lineHeight: 32,
                }}
              >
                {value}
              </Text>
              <Text className="text-[11px] font-body font-medium leading-4 text-label-muted">
                {subtitle}
              </Text>
            </>
          )}
        </Card>
      </Entrance>
    </View>
  );
}

function GCashCard(props: {
  amountDisplay: string;
  changeLabel: string;
  isEmpty: boolean;
}) {
  const { amountDisplay, changeLabel, isEmpty } = props;

  return (
    <View style={GridItemStyle}>
      <Entrance delayMs={80}>
        <Card
          className="min-w-0 border-accent-info-border bg-accent-info-soft px-4 py-4"
          style={CardStyle}
        >
          <View className="mb-3 flex-row items-start justify-between gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-gcash-icon-tile">
              <AppIcon
                name="smartphone"
                size={16}
                className="text-accent-info"
                strokeWidth={2}
              />
            </View>
            <Text
              numberOfLines={2}
              className="flex-1 text-right text-[10px] font-label font-bold uppercase tracking-[0.16em] text-label-muted"
            >
              GCash
            </Text>
          </View>

          {isEmpty ? (
            <View className="flex-1 justify-end">
              <Text className="text-[15px] font-body-semibold text-label-primary">
                No GCash sales yet
              </Text>
              <Text className="mt-1 text-[11px] font-body-medium leading-4 text-label-muted">
                Digital payments will appear here once recorded.
              </Text>
            </View>
          ) : (
            <>
              <Text
                className="text-label-primary"
                style={{
                  fontSize: 26,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                  lineHeight: 30,
                }}
              >
                {formatPesoDisplay(amountDisplay)}
              </Text>
              <View className="mt-2 flex-row items-center gap-1">
                <AppIcon
                  name="trending_up"
                  size={12}
                  className="text-accent-info"
                  strokeWidth={2.5}
                />
                <Text className="text-[11px] font-body font-bold text-label-primary">
                  {changeLabel}
                </Text>
              </View>
            </>
          )}
        </Card>
      </Entrance>
    </View>
  );
}

function CashSalesCard(props: { amountDisplay: string; shareLabel: string }) {
  const isEmpty = isPlaceholderValue(props.amountDisplay);

  return (
    <View style={GridItemStyle}>
      <Entrance delayMs={100}>
        <Card className="min-w-0 p-4" style={CardStyle}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-warn-soft">
              <View className="h-3 w-3 rounded-full border-2 border-forest" />
            </View>
            <Text
              numberOfLines={2}
              className="flex-1 text-right text-[10px] font-label font-bold uppercase tracking-[0.18em] text-label-muted"
            >
              Cash Sales
            </Text>
          </View>

          <View className="mt-4 flex-1 justify-end">
            {isEmpty ? (
              <>
                <Text className="text-[15px] font-body-semibold text-label-primary">
                  Waiting for cash sales
                </Text>
                <Text className="mt-1 text-[11px] font-body-medium leading-4 text-label-muted">
                  Cash totals update as soon as checkout activity begins.
                </Text>
              </>
            ) : (
              <>
                <Text
                  className="text-label-primary"
                  style={{
                    fontSize: 26,
                    fontWeight: "800",
                    letterSpacing: -0.3,
                    lineHeight: 30,
                  }}
                >
                  {formatPesoDisplay(props.amountDisplay)}
                </Text>
                <Text className="text-xs font-body font-medium text-label-muted">
                  {props.shareLabel}
                </Text>
              </>
            )}
          </View>
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
  gcashAmountDisplay,
  gcashChangeLabel,
  cashSalesAmountDisplay,
  cashSalesShareLabel,
  isEmpty,
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
        accentIconClassName="text-forest"
        accentSurfaceClassName="bg-forest-alpha-14"
      />

      <MetricCard
        iconKey="payments"
        label="Profit Est."
        value={profitEstDisplay}
        subtitle={profitEstSubtitle}
        emptyLabel="Profit needs sales data"
        delayMs={90}
        accentIconClassName="text-revenue-hero"
        accentSurfaceClassName="bg-forest-alpha-10"
      />

      <GCashCard
        amountDisplay={gcashAmountDisplay}
        changeLabel={gcashChangeLabel}
        isEmpty={isEmpty}
      />

      <CashSalesCard
        amountDisplay={cashSalesAmountDisplay}
        shareLabel={cashSalesShareLabel}
      />
    </View>
  );
}
