import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { ChartBarPoint } from "@/lib/types/api/reporting";

type Props = {
  data: ChartBarPoint[];
  /**
   * If true, colors the last bar as primary green and the second-to-last as secondary.
   * Matches the React reference where "Today" is highlighted.
   */
  highlightLastTwo?: boolean;
  /**
   * Total chart area height (excluding labels).
   */
  barAreaHeight?: number;
  /**
   * Optional tooltip: tapping a bar sets the selection and renders a small label.
   */
  enableSelection?: boolean;
};

const COLORS = {
  primary: "#1b4332",
  secondary: "#2d6a4f",
  default: "#d8ead3",
  axis: "#8e8e93",
};

export function BarChart({
  data,
  highlightLastTwo = false,
  barAreaHeight = 120,
  enableSelection = true,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    return max;
  }, [data]);

  const bars = useMemo(() => {
    return data.map((d, index) => {
      const h = Math.max(4, (d.value / maxValue) * barAreaHeight);

      let color = COLORS.default;
      if (highlightLastTwo) {
        if (index === data.length - 1) color = COLORS.primary;
        else if (index === data.length - 2) color = COLORS.secondary;
      }

      return { ...d, h, color, index };
    });
  }, [data, highlightLastTwo, barAreaHeight, maxValue]);

  const selected = selectedIndex == null ? null : bars[selectedIndex];

  return (
    <View className="relative">
      {selected && enableSelection ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            transform: [{ translateY: -8 }],
            zIndex: 2,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(27,67,50,0.92)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {selected.label}
            </Text>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
              ₱{selected.value.toLocaleString("en-PH")}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={{ height: barAreaHeight }}
        className="flex-row items-end gap-2 px-1"
      >
        {bars.map((b) => {
          const pressProps = enableSelection
            ? {
                onPress: () => setSelectedIndex(b.index),
              }
            : {};

          return (
            <Pressable
              key={`${b.label}-${b.index}`}
              className="flex-1"
              {...pressProps}
              accessibilityRole="button"
            >
              <View
                style={{
                  height: b.h,
                  backgroundColor: b.color,
                  borderRadius: 8,
                }}
              />
              <Text
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  color: COLORS.axis,
                  fontSize: 10,
                  fontWeight: "500",
                }}
              >
                {b.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
