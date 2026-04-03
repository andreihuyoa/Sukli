import type { ReactNode } from "react";
import { useEffect } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type Props = {
  children: ReactNode;
  /**
   * Matches the React reference's `delay` usage (motion/react).
   * Keep small to avoid janky perceived performance.
   */
  delayMs?: number;
  fromY?: number;
};

/**
 * Lightweight "motion.div" replacement for React Native.
 * We animate opacity + translateY only (fast, layout-safe).
 */
export function Entrance({ children, delayMs = 0, fromY = 12 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const id = setTimeout(() => {
      progress.value = withTiming(1, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      });
    }, delayMs);

    return () => clearTimeout(id);
  }, [delayMs, progress]);

  const style = useAnimatedStyle(() => {
    const opacity = progress.value;
    const translateY = fromY * (1 - progress.value);
    return { opacity, transform: [{ translateY }] };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}

