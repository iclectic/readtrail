import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: Props) {
  const { colors, radii, typography, touchTarget, maxFontSizeMultiplier } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: Math.min(touchTarget, 40),
          borderRadius: radii.pill,
          borderColor: selected ? colors.accent : colors.line,
          backgroundColor: selected ? colors.accentSoft : colors.paperElevated,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[
          typography.caption,
          { color: selected ? colors.accent : colors.ink, fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },
});
