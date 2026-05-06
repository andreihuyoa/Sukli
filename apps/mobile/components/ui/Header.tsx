import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./AppIcon";

const colors = {
  accent: "#5f7d67",
  fill: "rgba(255, 248, 239, 0.92)",
  border: "rgba(184, 179, 170, 0.75)",
  native: "rgba(255, 248, 239, 1)",
  active: "#31463a",
  inactive: "#7f847d",
  indicator: "rgba(95, 125, 103, 0.22)",
  shadow: "#9a8f7a",
  title: "#2f332f",
  muted: "#747870",
  iconOnLight: "#31463a",
  subtleFill: "rgba(95, 125, 103, 0.1)",
  softOutline: "rgba(215, 210, 200, 0.1)",
};

type Props = {
  onBackPress?: () => void;
  right?: ReactNode;
  onRefresh?: () => void;
};

export function Header({ onBackPress, right, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const useNativeGlass = Platform.OS === "ios" && isGlassEffectAPIAvailable();

  const toolbar = (
    <View
      style={[
        styles.toolbar,
        {
          paddingTop: insets.top,
          minHeight: 56 + insets.top,
        },
      ]}
    >
      <View style={styles.left}>
        {onBackPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <AppIcon
              name="arrow_back"
              size={24}
              color={colors.iconOnLight}
              strokeWidth={2.25}
            />
          </Pressable>
        ) : null}
        <View style={styles.brandIcon}>
          <AppIcon
            // replace this with product icon later on
            name="inventory_2"
            size={18}
            color={colors.accent}
            strokeWidth={2.5}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Sukli
        </Text>
      </View>

      {right ? (
        right
      ) : (
        <View style={styles.rightActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh"
            hitSlop={12}
            onPress={() => onRefresh?.()}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.refreshPressed,
            ]}
          >
            <AppIcon
              name="sync"
              size={18}
              color={colors.iconOnLight}
              strokeWidth={2.25}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={12}
            onPress={() => router.push("/(tabs)/settings")}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>JD</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <View style={styles.bar}>
        {useNativeGlass ? (
          <GlassView
            style={styles.barInner}
            glassEffectStyle="clear"
            colorScheme="light"
          >
            {toolbar}
          </GlassView>
        ) : (
          <BlurView
            intensity={72}
            tint="light"
            style={styles.barInner}
            experimentalBlurMethod={
              Platform.OS === "android" ? "dimezisBlurView" : undefined
            }
          >
            {toolbar}
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
    top: 0,
    zIndex: 50,
  },
  bar: {
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  barInner: {
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconButton: {
    minHeight: 48,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  brandIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.subtleFill,
  },
  title: {
    fontFamily: "Vollkorn_700Bold",
    fontSize: 30,
    letterSpacing: -0.2,
    color: colors.title,
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  refreshButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(95, 125, 103, 0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.softOutline,
  },
  refreshPressed: {
    opacity: 0.75,
  },
  avatar: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.softOutline,
    backgroundColor: colors.subtleFill,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.title,
  },
});
