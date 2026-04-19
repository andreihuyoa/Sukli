import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Design tokens — avoid NativeWind `className` here: css-interop can break React Navigation context inside custom tab bars. */
const COL = {
  barFill: "rgba(242, 242, 247, 0.94)",
  barFillAndroid: "#f2f2f7",
  barBorder: "rgba(0, 0, 0, 0.08)",
  activeIcon: "#1b4332",
  inactiveIcon: "#8e8e93",
  indicator: "rgba(27, 67, 50, 0.12)",
};

const TABS: { key: string; label: string; icon: AppIconName }[] = [
  { key: "index", label: "Home", icon: "home_app_logo" },
  { key: "sales", label: "Sales", icon: "point_of_sale" },
  { key: "inventory", label: "Stock", icon: "inventory_2" },
  { key: "vendors", label: "Vendors", icon: "local_shipping" },
  { key: "stats", label: "Stats", icon: "analytics" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const PILL_RADIUS = 34;
const FLOAT_ABOVE_SAFE = 5;

// used when native glass is not available
function PillFill() {
  return (
    <>
      <BlurView
        intensity={Platform.OS === "android" ? 40 : 72}
        tint="light"
        style={[StyleSheet.absoluteFill, { borderRadius: PILL_RADIUS }]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: PILL_RADIUS,
            backgroundColor:
              Platform.OS === "android" ? COL.barFillAndroid : COL.barFill,
          },
        ]}
      />
    </>
  );
}

export function NavigationBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const useNativeGlass = Platform.OS === "ios" && isGlassEffectAPIAvailable();
  const bottomInset = Math.max(insets.bottom, FLOAT_ABOVE_SAFE);

  const tabRow = (
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
              pressed && !focused && styles.tabPressed,
            ]}
          >
            <View style={styles.iconSlot}>
              {focused ? (
                <View style={styles.indicator} pointerEvents="none" />
              ) : null}
              <AppIcon
                name={meta.icon}
                size={22}
                color={focused ? COL.activeIcon : COL.inactiveIcon}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View
      style={[styles.shell, { paddingBottom: bottomInset + FLOAT_ABOVE_SAFE }]}
      pointerEvents="box-none"
    >
      <View style={styles.pillShadow}>
        {useNativeGlass ? (
          <GlassView
            style={styles.pill}
            glassEffectStyle="regular"
            colorScheme="auto"
          >
            {tabRow}
          </GlassView>
        ) : (
          <View style={styles.pill}>
            <PillFill />
            {tabRow}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pillShadow: {
    borderRadius: PILL_RADIUS,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  pill: {
    borderRadius: PILL_RADIUS,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COL.barBorder,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minHeight: 70,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.75,
  },
  iconSlot: {
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    left: 2,
    right: 2,
    top: 4,
    bottom: 4,
    borderRadius: 12,
    backgroundColor: COL.indicator,
  },
});
