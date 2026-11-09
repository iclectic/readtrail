import React from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../../theme";

type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

export function TextField({ label, error, style, ...rest }: Props) {
  const { colors, radii, typography, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xxs }}>
      <Text style={[typography.label, { color: colors.ink }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkSubtle}
        accessibilityLabel={label}
        style={[
          styles.input,
          typography.body,
          {
            borderColor: error ? colors.danger : colors.line,
            backgroundColor: colors.paperElevated,
            color: colors.ink,
            borderRadius: radii.md,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
