import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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

const TABS_CONTAINER_PADDING = 5;

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
          <NativeTabs.Trigger.Icon sf={tab.sf} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

type NavigationTabItemProps = {
  meta: (typeof TABS)[number];
  focused: boolean;
  chipSize: number;
  chipRadius: number;
  iconSize: number;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

const NavigationTabItem: React.FC<NavigationTabItemProps> = ({
  meta,
  focused,
  chipSize,
  chipRadius,
  iconSize,
  onPress,
  onLayout,
}) => {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={meta.label}
      onPress={onPress}
      onLayout={onLayout}
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
        ]}
      >
        <View style={styles.iconContent}>
          <AppIcon
            name={meta.icon}
            size={iconSize}
            color={focused ? colors.active : colors.inactive}
            strokeWidth={focused ? 2.5 : 1.8}
          />
          <Animated.Text
            style={[
              styles.tabLabel,
              { color: focused ? colors.active : colors.inactive },
            ]}
            numberOfLines={1}
          >
            {meta.label}
          </Animated.Text>
        </View>
      </View>
    </Pressable>
  );
};

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
  const [tabLayouts, setTabLayouts] = useState<
    ({ x: number; width: number } | null)[]
  >(Array(TABS.length).fill(null));

  const allTabsMeasured = tabLayouts.every((layout) => layout !== null);
  const shellHorizontalPadding = 25;
  const measuredTabWidth = tabLayouts[state.index]?.width ?? 0;

  const chipSize = Math.round(
    Math.max(68, Math.min(72, measuredTabWidth * 0.94))
  ); // tighter space between tabs
  const chipRadius = Math.round(chipSize * 0.45); // rounded pill
  const iconSize = Math.round(Math.max(22, Math.min(34, chipSize * 0.5))); // icon size
  const activeRoute = state.routes[state.index];
  const shouldShowActiveIndicator = Boolean(
    activeRoute && TABS.some((tab) => tab.key === activeRoute.name)
  );

  const getIndicatorTargetX = useCallback(
    (index: number) => {
      const layout = tabLayouts[index];
      if (!layout) return 0;
      return layout.x + (layout.width - chipSize) / 2;
    },
    [chipSize, tabLayouts]
  );
  const indicatorX = useSharedValue(getIndicatorTargetX(state.index));

  useEffect(() => {
    indicatorX.value = withSpring(getIndicatorTargetX(state.index), {
      damping: 16,
      stiffness: 160,
      mass: 0.9,
    });
  }, [getIndicatorTargetX, indicatorX, state.index]);

  const handleTabLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((prev) => {
        const current = prev[index];
        if (current && current.x === x && current.width === width) {
          return prev;
        }
        const next = [...prev];
        next[index] = { x, width };
        return next;
      });
    },
    []
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorX.value },
      { translateY: -chipSize / 2 + 2 },
    ],
    opacity: allTabsMeasured ? 1 : 0,
    width: chipSize,
    height: chipSize,
    borderRadius: chipRadius,
  }));

  const androidNavigationBar = (
    <View style={styles.tabsContainer}>
      {shouldShowActiveIndicator ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.activeIndicator, indicatorStyle]}
        />
      ) : null}
      {state.routes.map((route, index) => {
        const meta = TABS.find((t) => t.key === route.name);
        if (!meta) return null;
        const focused = state.index === index;
        return (
          <NavigationTabItem
            key={route.key}
            meta={meta}
            focused={focused}
            chipSize={chipSize}
            chipRadius={chipRadius}
            iconSize={iconSize}
            onPress={() => navigation.navigate(route.name)}
            onLayout={handleTabLayout(index)}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.shell,
        {
          paddingBottom: bottomInset,
          paddingHorizontal: shellHorizontalPadding,
        },
      ]}
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
    position: "relative",
    padding: TABS_CONTAINER_PADDING,
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
    zIndex: 1,
  },
  iconContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  activeIndicator: {
    position: "absolute",
    top: "55%",
    backgroundColor: colors.indicator,
    zIndex: 0,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "NotoSans_700Bold",
  },
});
