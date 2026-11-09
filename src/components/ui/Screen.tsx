import React from "react";
import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";

type Props = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  children: React.ReactNode;
};

export function Screen({ scroll = false, padded = true, style, children, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const contentStyle = [
    {
      paddingTop: spacing.md,
      paddingBottom: insets.bottom + spacing.md,
      paddingHorizontal: padded ? spacing.md : 0,
      backgroundColor: colors.paper,
      flexGrow: 1,
    },
    style,
  ];

  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.paper }}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.paper }, contentStyle]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
