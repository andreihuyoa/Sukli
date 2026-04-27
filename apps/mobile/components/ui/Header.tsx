import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./AppIcon";

const COL = {
  barFill: "rgba(255, 248, 239, 0.9)",
  barBorder: "rgba(184, 179, 170, 1)",
  title: "#2f332f",
  accent: "#31463a",
  muted: "#747870",
  iconOnLight: "#31463a",
  subtleFill: "rgba(95, 125, 103, 0.1)",
  softOutline: "rgba(215, 210, 200, 0.1)",
};

const HEADER_BOTTOM_RADIUS = 20;
const TOOLBAR_MIN_HEIGHT = 56;

type Props = {
  onBackPress?: () => void;
  right?: ReactNode;
  onRefresh?: () => void;
  syncPill?: boolean;
};

export function Header({ onBackPress, right, onRefresh, syncPill }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const useNativeGlass = Platform.OS === "ios" && isGlassEffectAPIAvailable();

  const toolbar = (
    <View
      style={[
        styles.toolbar,
        {
          paddingTop: insets.top,
          minHeight: TOOLBAR_MIN_HEIGHT + insets.top,
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
              color={COL.iconOnLight}
              strokeWidth={2.25}
            />
          </Pressable>
        ) : null}
        <View style={styles.brandIcon}>
          <AppIcon
            // replace this with product icon later on
            name="inventory_2"
            size={18}
            color={COL.accent}
            strokeWidth={2.5}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Sukli
        </Text>
      </View>

      {right ? (
        right
      ) : syncPill ? (
        <View style={styles.syncPill}>
          <View style={styles.syncDotOuter}>
            <View style={styles.syncDotInner} />
          </View>
          <Text style={styles.syncLabel}>Cloud Synced</Text>
          <AppIcon
            name="cloud_sync"
            size={16}
            color={COL.accent}
            strokeWidth={2}
          />
        </View>
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
              color={COL.iconOnLight}
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
            intensity={Platform.OS === "android" ? 40 : 72}
            tint="light"
            style={styles.barInner}
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
    borderColor: COL.barBorder,
    borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
    borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
  },
  barInner: {
    overflow: "hidden",
    borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
    borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
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
    backgroundColor: COL.subtleFill,
  },
  title: {
    fontFamily: "Vollkorn_700Bold",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: COL.title,
    flexShrink: 1,
  },
  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COL.barBorder,
    backgroundColor: "rgba(255, 250, 242, 0.78)",
  },
  syncDotOuter: {
    position: "relative",
    height: 8,
    width: 8,
  },
  syncDotInner: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COL.accent,
    opacity: 0.85,
  },
  syncLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: COL.accent,
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
    borderColor: COL.softOutline,
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
    borderColor: COL.softOutline,
    backgroundColor: COL.subtleFill,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COL.title,
  },
});
