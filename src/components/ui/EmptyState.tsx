import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme";
import { Button } from "./Button";

type Props = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.wrap, { gap: spacing.sm }]} accessibilityRole="summary">
      <Text style={[typography.subtitle, { color: colors.ink, textAlign: "center" }]}>
        {title}
      </Text>
      {body ? (
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: "center" }]}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
