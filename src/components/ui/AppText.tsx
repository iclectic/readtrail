import React from "react";
import { Text, type TextProps } from "react-native";
import { useTheme } from "../../theme";

/** Text that respects the theme Dynamic Type cap. */
export function AppText({
  maxFontSizeMultiplier,
  ...rest
}: TextProps) {
  const { maxFontSizeMultiplier: themeMax } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? themeMax}
      {...rest}
    />
  );
}
