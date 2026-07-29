import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./AppIcon";

type Props = {
  onBackPress?: () => void;
};

export function Header({ onBackPress }: Props) {
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
              color="#31463a"
              strokeWidth={2.25}
            />
          </Pressable>
        ) : null}
        <View style={styles.brandIcon}>
          <AppIcon
            // replace this with product icon later on
            name="inventory_2"
            size={18}
            color="#5f7d67"
            strokeWidth={2.5}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          Sukli
        </Text>
      </View>

      {!onBackPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={12}
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [
            styles.avatar,
            pressed && styles.avatarPressed,
          ]}
        >
          <Text style={styles.avatarText}>JD</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.shell}>
      <View style={styles.bar}>
        {useNativeGlass ? (
          <GlassView
            style={styles.barInner}
            glassEffectStyle="clear"
            colorScheme="light"
            isInteractive
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
    borderColor: "rgba(184, 179, 170, 0.75)",
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
    backgroundColor: "rgba(95, 125, 103, 0.1)",
  },
  title: {
    fontFamily: "Vollkorn_700Bold",
    fontSize: 30,
    letterSpacing: -0.2,
    color: "#2f332f",
    flexShrink: 1,
  },
  avatar: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(184, 179, 170, 0.1)",
    backgroundColor: "rgba(95, 125, 103, 0.1)",
  },
  avatarPressed: {
    opacity: 0.85,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2f332f",
  },
});
