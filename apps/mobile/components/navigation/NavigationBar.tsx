import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  accent: "#5f7d67",
  fill: "rgba(255, 248, 239, 0.92)",
  border: "rgba(184, 179, 170, 0.75)",
  native: "rgba(255, 248, 239, 1)",
  active: "#31463a",
  inactive: "#7f847d",
  indicator: "rgba(95, 125, 103, 0.22)",
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
    key: "inventory",
    label: "Stock",
    icon: "inventory_2",
    sf: { default: "shippingbox", selected: "shippingbox.fill" },
  },
  {
    key: "sales",
    label: "Sales",
    icon: "point_of_sale",
    sf: { default: "cart", selected: "cart.fill" },
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

function getIOSMajorVersion(version: string | number): number {
  if (typeof version === "number") return version;
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  return Number.isNaN(major) ? 0 : major;
}

function shouldUseIOSNativeTabs(): boolean {
  return (
    Platform.OS === "ios" &&
    (isGlassEffectAPIAvailable() || getIOSMajorVersion(Platform.Version) >= 26)
  );
}

/**
 * Root tabs: iOS Liquid Glass via `NativeTabs`, or Expo Router `Tabs` plus custom `NavigationBar` below.
 */
export function TabsNavigator() {
  if (shouldUseIOSNativeTabs()) {
    return <NativeLiquidGlassTabs />;
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

/**
 * The iOS native liquid glass tabs are the tabs that appear at the bottom of the screen.
 * @returns The native liquid glass tabs.
 */
function NativeLiquidGlassTabs() {
  return (
    <NativeTabs
      tintColor={colors.accent}
      backgroundColor={colors.native}
      // disableTransparentOnScrollEdge
      labelStyle={{ color: colors.accent }}
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

/**
 * The navigation bar is the bottom bar that appears at the bottom of the screen.
 * It contains the tabs for the app.
 * @param state - The state of the navigation.
 * @param navigation - The navigation object.
 * @returns The navigation bar.
 */
export function NavigationBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom);
  const blurViewFallback = Platform.OS === "android";

  const { width: screenWidth } = useWindowDimensions();

  const tabCount = TABS.length;
  const tabWidth = (screenWidth - 60) / tabCount;

  const chipSize = Math.round(Math.max(52, Math.min(72, tabWidth * 0.88)));
  const chipRadius = Math.round(chipSize * 0.45);
  const iconSize = Math.round(Math.max(20, Math.min(30, chipSize * 0.42)));

  const androidNavigationBar = (
    <View style={styles.tabsContainer}>
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
            <View
              style={[
                styles.iconContainer,
                {
                  width: chipSize,
                  height: chipSize,
                  borderRadius: chipRadius,
                  overflow: "hidden",
                },
                // Background applied after geometry so the radius is never lost.
                focused ? styles.iconContainerActive : null,
              ]}
            >
              <AppIcon
                name={meta.icon}
                size={iconSize}
                color={focused ? colors.active : colors.inactive}
                strokeWidth={focused ? 2.5 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? colors.active : colors.inactive },
                ]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
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
          <View style={[styles.pill, styles.pillAndroid]}>
            {androidNavigationBar}
          </View>
        ) : (
          // blur view is used for android hardware renderer
          <BlurView intensity={72} tint="light" style={styles.pill}>
            {androidNavigationBar}
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
    paddingHorizontal: 30,
    paddingTop: 5,
  },
  pillShadow: {
    borderRadius: 22,
    backgroundColor: "transparent",
    width: "100%",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  pill: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    height: "100%", // hugs container height
    width: "100%", // hugs container width
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pillAndroid: {
    backgroundColor: colors.fill,
  },
  tabsContainer: {
    padding: 5,
    flexDirection: "row",
    alignItems: "stretch",
    height: "100%",
    width: "100%",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  tabPressed: {
    opacity: 0.75,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    backgroundColor: colors.indicator,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: "body",
  },
});
