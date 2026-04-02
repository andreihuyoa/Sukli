import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Design tokens (match tailwind.config.js) — avoid NativeWind `className` here: css-interop can break React Navigation context inside custom tab bars. */
const COL = {
  background: "#faf9f9",
  primaryContainer: "#386641",
  outline: "#727970",
  onSurfaceVariant: "#414941",
};

const TABS: { key: string; label: string; icon: AppIconName }[] = [
  { key: "index", label: "Home", icon: "home_app_logo" },
  { key: "sales", label: "Sales", icon: "point_of_sale" },
  { key: "inventory", label: "Stock", icon: "inventory_2" },
  { key: "vendors", label: "Vendors", icon: "local_shipping" },
  { key: "stats", label: "Stats", icon: "analytics" },
];

export function TindahanTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16);

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: bottomPad,
        },
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(250, 249, 249, 0.96)" }]} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.glassTint]} pointerEvents="none" />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const meta = TABS.find((t) => t.key === route.name);
          if (!meta) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => navigation.navigate(route.name)}
              style={({ pressed }) => [
                styles.tab,
                focused && styles.tabFocused,
                pressed && !focused && styles.tabPressed,
              ]}
            >
              <AppIcon
                name={meta.icon}
                size={22}
                color={focused ? "#ffffff" : COL.outline}
                strokeWidth={focused ? 2.25 : 2}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: "#1b1c1c",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  glassTint: {
    backgroundColor: Platform.OS === "ios" ? "rgba(250, 249, 249, 0.45)" : undefined,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(27, 28, 28, 0.08)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    minHeight: 48,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabFocused: {
    backgroundColor: COL.primaryContainer,
    transform: [{ translateY: -4 }, { scale: 1.1 }],
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COL.onSurfaceVariant,
  },
  tabLabelFocused: {
    color: "#ffffff",
  },
});
