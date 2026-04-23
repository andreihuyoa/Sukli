import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, className, style }: Props) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border border-outline bg-glass-surface ${
        className ?? ""
      }`.trim()}
      style={style}
    >
      {children}
    </View>
  );
}
