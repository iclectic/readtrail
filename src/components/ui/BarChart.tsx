import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme";

export type BarChartItem = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  items: BarChartItem[];
  /** Accessible summary of the chart data */
  summary?: string;
  valueSuffix?: string;
};

/**
 * Simple accessible bar chart — no third-party chart dependency.
 * Exposes an accessibility summary for screen readers.
 */
export function BarChart({ title, items, summary, valueSuffix = "" }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const max = useMemo(
    () => Math.max(1, ...items.map((item) => item.value)),
    [items]
  );

  const computedSummary =
    summary ??
    items.map((item) => `${item.label}: ${item.value}${valueSuffix}`).join("; ");

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${computedSummary}`}
      style={{ gap: spacing.sm }}
    >
      <Text style={[typography.subtitle, { color: colors.ink }]}>{title}</Text>
      <View style={{ gap: spacing.xs }}>
        {items.map((item) => {
          const widthPct = Math.max(4, Math.round((item.value / max) * 100));
          return (
            <View key={item.label} style={{ gap: 4 }}>
              <View style={styles.row}>
                <Text style={[typography.caption, { color: colors.inkMuted, width: 52 }]}>
                  {item.label}
                </Text>
                <Text style={[typography.caption, { color: colors.ink }]}>
                  {item.value}
                  {valueSuffix}
                </Text>
              </View>
              <View
                style={[
                  styles.track,
                  { backgroundColor: colors.line, borderRadius: radii.pill },
                ]}
              >
                <View
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    backgroundColor: colors.accent,
                    borderRadius: radii.pill,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text
        style={[typography.caption, { color: colors.inkSubtle }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        Chart values are also available to screen readers via the summary above.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: { height: 10, width: "100%", overflow: "hidden" },
});
