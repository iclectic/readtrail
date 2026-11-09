import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../theme";

type Props = {
  percent: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ percent, accessibilityLabel }: Props) {
  const { colors, radii } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `Progress ${clamped} percent`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[styles.track, { backgroundColor: colors.line, borderRadius: radii.pill }]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: colors.accent,
            borderRadius: radii.pill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
});
