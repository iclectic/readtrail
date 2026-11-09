import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { useTheme } from "../../theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...rest
}: Props) {
  const { colors, radii, typography, touchTarget } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? colors.dangerSoft
        : variant === "secondary"
          ? colors.paperElevated
          : "transparent";

  const textColor =
    variant === "primary"
      ? colors.accentInk
      : variant === "danger"
        ? colors.danger
        : colors.ink;

  const borderColor =
    variant === "secondary" || variant === "ghost" ? colors.line : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        {
          minHeight: touchTarget,
          backgroundColor,
          borderColor,
          borderRadius: radii.md,
          opacity: isDisabled ? 0.55 : state.pressed ? 0.88 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.bodyStrong, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
