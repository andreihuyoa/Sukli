import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_BODY = 56;
const TAB_BAR = 88;

type Props = {
  children: ReactNode;
  /** Extra bottom space beyond tab bar */
  bottomExtra?: number;
  /** When false, renders a plain container instead of ScrollView */
  scrollable?: boolean;
  /** Adds space for top app header area */
  withHeaderOffset?: boolean;
  /** Horizontal padding for shell content */
  horizontalPadding?: number;
};

export function ScreenShell({
  children,
  bottomExtra = 0,
  scrollable = true,
  withHeaderOffset = true,
  horizontalPadding = 24,
}: Props) {
  const insets = useSafeAreaInsets();
  // Non-header screens still need safe-area breathing room to avoid status bar overlap.
  const paddingTop = withHeaderOffset
    ? insets.top + HEADER_BODY + 8
    : insets.top + 4;
  const paddingBottom = TAB_BAR + insets.bottom + bottomExtra;

  if (!scrollable) {
    return (
      <View
        className="flex-1 bg-background"
        style={{
          paddingTop,
          paddingBottom,
          paddingHorizontal: horizontalPadding,
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop, paddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: horizontalPadding }}>{children}</View>
      </ScrollView>
    </View>
  );
}
