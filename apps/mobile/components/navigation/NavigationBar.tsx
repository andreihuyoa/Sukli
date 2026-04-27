import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Design tokens — avoid NativeWind `className` here: css-interop can break React Navigation context inside custom tab bars. */
const COL = {
  appAccent: "#5f7d67",
  barFill: "rgba(255, 248, 239, 0.92)",
  barBorder: "rgba(184, 179, 170, 0.75)",
  activeIcon: "#31463a",
  inactiveIcon: "#7f847d",
  indicator: "rgba(95, 125, 103, 0.12)",
  shadow: "#9a8f7a",
};

const TABS: readonly {
  key: string;
  label: string;
  icon: AppIconName;
  sf: any;
}[] = [
  {
    key: "index",
    label: "Home",
    icon: "home_app_logo",
    sf: { default: "house", selected: "house.fill" },
  },
  {
    key: "sales",
    label: "Sales",
    icon: "point_of_sale",
    sf: { default: "cart", selected: "cart.fill" },
  },
  {
    key: "inventory",
    label: "Stock",
    icon: "inventory_2",
    sf: { default: "shippingbox", selected: "shippingbox.fill" },
  },
  {
    key: "vendors",
    label: "Vendors",
    icon: "local_shipping",
    sf: { default: "truck.box", selected: "truck.box.fill" },
  },
  {
    key: "stats",
    label: "Stats",
    icon: "analytics",
    sf: { default: "chart.bar", selected: "chart.bar.fill" },
  },
];

const PILL_RADIUS = 50;

function getIOSMajorVersion(version: string | number): number {
  if (typeof version === "number") return version;
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  return Number.isNaN(major) ? 0 : major;
}

export function TabsNavigator() {
  // expo-glass-effect may report false on some builds even when Liquid Glass works.
  const hasLiquidGlass =
    Platform.OS === "ios" &&
    (isGlassEffectAPIAvailable() || getIOSMajorVersion(Platform.Version) >= 26);
  const useNativeTabs = hasLiquidGlass;

  if (useNativeTabs) {
    return (
      <NativeTabs
        tintColor={COL.appAccent}
        labelStyle={{ color: COL.appAccent }}
      >
        {TABS.map((tab) => (
          <NativeTabs.Trigger key={tab.key} name={tab.key}>
            <Icon sf={tab.sf} />
            <Label>{tab.label}</Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <NavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.key}
          name={tab.key}
          options={{ title: tab.label }}
        />
      ))}
    </Tabs>
  );
}

export function NavigationBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom);
  const blurViewFallback = Platform.OS === "android";

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
      style={[styles.shell, { paddingBottom: bottomInset }]}
      pointerEvents="box-none"
    >
      <View style={styles.pillShadow}>
        {blurViewFallback ? (
          // blur view fallback is used for android software renderer
          <View style={[styles.pill, styles.pillAndroid]}>{tabRow}</View>
        ) : (
          // blur view is used for android hardware renderer
          <BlurView intensity={72} tint="light" style={styles.pill}>
            {tabRow}
          </BlurView>
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
    shadowColor: COL.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
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
  pillAndroid: {
    backgroundColor: COL.barFill,
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
