import { Text, View } from "react-native";

import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

type Props = {
  iconKey: AppIconName;
  title: string;
  body: string;
  tone?: "forest" | "info" | "warn";
  compact?: boolean;
};

export function SectionEmptyState({
  iconKey,
  title,
  body,
  tone = "forest",
  compact = false,
}: Props) {
  const toneMap = {
    forest: {
      iconClassName: "text-forest",
      iconSurfaceClassName: "bg-forest-alpha-14",
    },
    info: {
      iconClassName: "text-accent-info",
      iconSurfaceClassName: "bg-accent-info-soft",
    },
    warn: {
      iconClassName: "text-accent-warn",
      iconSurfaceClassName: "bg-accent-warn-soft",
    },
  } as const;

  const palette = toneMap[tone];

  return (
    <View
      className={`items-center justify-center px-4 ${compact ? "py-5" : "py-8"}`}
    >
      <View
        className={`mb-3 h-11 w-11 items-center justify-center rounded-2xl ${palette.iconSurfaceClassName}`}
      >
        <AppIcon
          name={iconKey}
          size={18}
          className={palette.iconClassName}
          strokeWidth={2.25}
        />
      </View>
      <Text className="text-sm font-body-semibold text-label-primary">
        {title}
      </Text>
      <Text className="mt-1 max-w-[240px] text-center text-[12px] font-body-medium leading-4 text-label-muted">
        {body}
      </Text>
    </View>
  );
}
