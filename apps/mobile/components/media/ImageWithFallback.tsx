import type { ImageStyle, StyleProp } from "react-native";
import { useState } from "react";
import { Image as RNImage } from "react-native";
import { Image } from "expo-image";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

type Props = {
  src: string;
  alt?: string;
  style?: StyleProp<ImageStyle>;
  /**
   * expo-image uses `contentFit` (not RN's `resizeMode`).
   * Keep it optional so we can default to `cover` where needed.
   */
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

export function ImageWithFallback({ src, alt, style, contentFit = "cover" }: Props) {
  const [didError, setDidError] = useState(false);

  if (didError) {
    return (
      <RNImage
        accessibilityLabel={alt}
        source={{ uri: ERROR_IMG_SRC }}
        style={style}
      />
    );
  }

  return (
    <Image
      accessibilityLabel={alt}
      source={{ uri: src }}
      style={style}
      contentFit={contentFit}
      onError={() => setDidError(true)}
    />
  );
}

