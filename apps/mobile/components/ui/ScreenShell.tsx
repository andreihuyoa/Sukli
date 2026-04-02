import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_BODY = 56;
const TAB_BAR = 88;

type Props = {
  children: ReactNode;
  /** Extra bottom space beyond tab bar */
  bottomExtra?: number;
};

export function ScreenShell({ children, bottomExtra = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + HEADER_BODY + 8;
  const paddingBottom = TAB_BAR + insets.bottom + bottomExtra;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop, paddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">{children}</View>
      </ScrollView>
    </View>
  );
}
