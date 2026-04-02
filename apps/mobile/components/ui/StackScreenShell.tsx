import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER = 56;

type Props = { children: ReactNode };

export function StackScreenShell({ children }: Props) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + HEADER + 8;
  const paddingBottom = insets.bottom + 24;

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
