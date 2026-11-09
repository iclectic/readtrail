import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";

type Props = {
  uri?: string | null;
  title: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { width: 40, height: 60 },
  md: { width: 56, height: 84 },
  lg: { width: 96, height: 144 },
};

export function BookCover({ uri, title, size = "md" }: Props) {
  const { colors, radii, typography } = useTheme();
  const dim = SIZES[size];
  const initial = title.trim().charAt(0).toUpperCase() || "R";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          dim,
          { borderRadius: radii.sm, backgroundColor: colors.line },
        ]}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`Cover of ${title}`}
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View
      accessibilityLabel={`No cover for ${title}`}
      style={[
        dim,
        styles.placeholder,
        {
          borderRadius: radii.sm,
          backgroundColor: colors.accentSoft,
          borderColor: colors.line,
        },
      ]}
    >
      <Text style={[typography.subtitle, { color: colors.accent }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
