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
      iconClassName: "text-primary",
      iconSurfaceClassName: "bg-primary/14",
    },
    info: {
      iconClassName: "text-accent",
      iconSurfaceClassName: "bg-accent/10",
    },
    warn: {
      iconClassName: "text-warning",
      iconSurfaceClassName: "bg-warning/12",
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
      <Text className="text-sm font-body-semibold text-foreground">
        {title}
      </Text>
      <Text className="mt-1 max-w-[240px] text-center text-[12px] font-body-medium leading-4 text-muted-foreground">
        {body}
      </Text>
    </View>
  );
}
