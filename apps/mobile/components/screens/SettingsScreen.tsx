import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

type SettingRow = {
  id: string;
  icon: AppIconName;
  title: string;
  subtitle: string;
  accentClassName: string;
  accentSurfaceClassName: string;
};

const rows: SettingRow[] = [
  {
    id: "sync",
    icon: "cloud_sync",
    title: "Sync and backup",
    subtitle: "Control upload timing, connection status, and device backups.",
    accentClassName: "text-accent-info",
    accentSurfaceClassName: "bg-accent-info-soft",
  },
  {
    id: "notifications",
    icon: "warning",
    title: "Alerts and reminders",
    subtitle: "Restock warnings, sales summaries, and daily prompts.",
    accentClassName: "text-accent-warn",
    accentSurfaceClassName: "bg-accent-warn-soft",
  },
];

export function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-screen-grouped"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="px-5 pt-2 pb-3">
        <Text className="text-xs font-label font-bold uppercase tracking-[0.18em] text-label-muted">
          App controls
        </Text>
        <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-label-primary">
          Settings
        </Text>
        <Text className="mt-1 text-[13px] font-body-semibold text-label-muted">
          Keep Sukli reliable, bright, and stable on every device.
        </Text>
      </View>

      <Entrance delayMs={40}>
        <View className="mx-4 mb-4 rounded-3xl border border-outline bg-glass-surface p-5">
          <View className="mb-3 self-start rounded-full border border-accent-focus-border bg-accent-focus-soft px-3 py-1.5">
            <Text className="text-[10px] font-label font-bold uppercase tracking-[0.18em] text-accent-focus">
              Workspace
            </Text>
          </View>

          <Text className="text-[22px] font-black tracking-[-0.2px] text-label-primary">
            Sukli retail system
          </Text>
          <Text className="mt-1 text-[13px] font-body-medium leading-5 text-label-muted">
            Bright working surfaces, gray structure lines, and calm green
            actions for everyday inventory and sales.
          </Text>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-outline bg-surface-container px-4 py-3">
              <Text className="text-[10px] font-label font-bold uppercase tracking-[0.16em] text-label-muted">
                Theme
              </Text>
              <Text className="mt-1 text-sm font-body-semibold text-label-primary">
                Hybrid glass
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-outline bg-surface-container px-4 py-3">
              <Text className="text-[10px] font-label font-bold uppercase tracking-[0.16em] text-label-muted">
                Sync state
              </Text>
              <Text className="mt-1 text-sm font-body-semibold text-label-primary">
                Cloud ready
              </Text>
            </View>
          </View>
        </View>
      </Entrance>

      <View className="mx-4 gap-3">
        {rows.map((row, index) => (
          <Entrance key={row.id} delayMs={90 + index * 50}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={row.title}
              className="flex-row items-center gap-3 rounded-2xl border border-outline bg-glass-surface px-4 py-4"
            >
              <View
                className={`h-11 w-11 items-center justify-center rounded-2xl ${row.accentSurfaceClassName}`}
              >
                <AppIcon
                  name={row.icon}
                  size={18}
                  className={row.accentClassName}
                  strokeWidth={2.25}
                />
              </View>

              <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-body-semibold text-label-primary">
                  {row.title}
                </Text>
                <Text className="mt-1 text-[12px] font-body-medium leading-4 text-label-muted">
                  {row.subtitle}
                </Text>
              </View>

              <AppIcon
                name="chevron_right"
                size={16}
                className="text-label-muted"
                strokeWidth={2.5}
              />
            </Pressable>
          </Entrance>
        ))}
      </View>
    </View>
  );
}

export default SettingsScreen;
