import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./AppIcon";

const COL = {
  barFill: "rgba(242, 242, 247, 0.94)",
  barFillAndroid: "#f2f2f7",
  barBorder: "rgba(0, 0, 0, 0.08)",
  title: "#1c1c1e",
  accent: "#1b4332",
  muted: "#8e8e93",
  iconOnLight: "#1b4332",
  subtleFill: "rgba(27, 67, 50, 0.1)",
};

const HEADER_BOTTOM_RADIUS = 20;
const TOOLBAR_MIN_HEIGHT = 56;

function HeaderFallbackFill() {
  return (
    <>
      <BlurView
        intensity={Platform.OS === "android" ? 40 : 72}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          {
            borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
            borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
            borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
            backgroundColor:
              Platform.OS === "android" ? COL.barFillAndroid : COL.barFill,
          },
        ]}
      />
    </>
  );
}

type Props = {
  onBackPress?: () => void;
  right?: ReactNode;
  onRefresh?: () => void;
  syncPill?: boolean;
};

export function AppHeader({ onBackPress, right, onRefresh, syncPill }: Props) {
  const insets = useSafeAreaInsets();
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
            name="storefront"
            size={18}
            color={COL.accent}
            strokeWidth={2.5}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Tindahan
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.shell} pointerEvents="box-none">
      {useNativeGlass ? (
        <GlassView
          style={styles.bar}
          glassEffectStyle="regular"
          colorScheme="light"
        >
          {toolbar}
        </GlassView>
      ) : (
        <View style={styles.bar}>
          <HeaderFallbackFill />
          {toolbar}
        </View>
      )}
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
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COL.barBorder,
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
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COL.subtleFill,
  },
  title: {
    fontFamily: "Vollkorn_700Bold",
    fontSize: 22,
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
    backgroundColor: "rgba(255, 255, 255, 0.55)",
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
    backgroundColor: "rgba(27, 67, 50, 0.08)",
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
    borderColor: COL.barBorder,
    backgroundColor: COL.subtleFill,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COL.accent,
  },
});
