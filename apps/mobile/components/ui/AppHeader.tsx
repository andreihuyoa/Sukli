import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./AppIcon";

const TINT = "rgba(56, 102, 65, 0.82)";

type Props = {
  onBackPress?: () => void;
  right?: ReactNode;
  onRefresh?: () => void;
  syncPill?: boolean;
};

export function AppHeader({ onBackPress, right, onRefresh, syncPill }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 top-0 z-50 overflow-hidden rounded-b-3xl"
      style={{ paddingTop: insets.top, minHeight: 56 + insets.top }}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: TINT }]} />
      )}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === "ios" ? "rgba(56, 102, 65, 0.35)" : undefined }]}
        pointerEvents="none"
      />
      <View className="flex-1 flex-row items-center justify-between px-6 pb-2">
        <View className="flex-row items-center gap-3">
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={onBackPress}
              className="min-h-[48px] min-w-[48px] items-center justify-center"
            >
              <AppIcon name="arrow_back" size={24} color="#ffffff" strokeWidth={2.25} />
            </Pressable>
          ) : null}
          <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#2d6a4f" }}>
            <AppIcon name="storefront" size={18} color="#ffffff" strokeWidth={2.25} />
          </View>
          <Text
            className="font-headline text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: "Vollkorn_700Bold", letterSpacing: -0.2 }}
          >
            Tindahan
          </Text>
        </View>
        {right ? right : syncPill ? (
          <View className="flex-row items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 backdrop-blur-md">
            <View className="relative h-2 w-2">
              <View className="absolute inline-flex h-full w-full rounded-full bg-on-tertiary-container opacity-75" />
              <View className="relative h-2 w-2 rounded-full bg-on-tertiary-container" />
            </View>
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-on-tertiary-container">
              Cloud Synced
            </Text>
            <AppIcon name="cloud_sync" size={16} color="#bfe36d" strokeWidth={2} />
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh"
              hitSlop={12}
              onPress={onRefresh}
              className="min-h-[48px] min-w-[48px] items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <AppIcon name="sync" size={18} color="#ffffff" strokeWidth={2.25} />
            </Pressable>
            <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/25" style={{ backgroundColor: "rgba(27,67,50,0.35)" }}>
              <Text className="font-body text-xs font-bold text-white">JD</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
