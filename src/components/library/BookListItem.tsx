import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "../../domain/types";
import { progressPercent, statusLabel } from "../../domain/progress";
import { useTheme } from "../../theme";
import { ProgressBar } from "../ui/ProgressBar";

type Props = {
  book: Book;
  onPress: () => void;
  onQuickUpdate?: () => void;
};

export function BookListItem({ book, onPress, onQuickUpdate }: Props) {
  const { colors, radii, typography, spacing } = useTheme();
  const percent = progressPercent(book.currentPage, book.totalPages);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          borderColor: colors.line,
          backgroundColor: colors.paperElevated,
          borderRadius: radii.md,
          opacity: pressed ? 0.92 : 1,
          gap: spacing.xs,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[typography.bodyStrong, { color: colors.ink }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[typography.caption, { color: colors.inkMuted }]} numberOfLines={1}>
            {book.author || "Unknown author"}
          </Text>
          <Text style={[typography.caption, { color: colors.inkSubtle }]}>
            {statusLabel(book.status)}
            {book.totalPages > 0
              ? ` · ${book.currentPage}/${book.totalPages}`
              : ` · page ${book.currentPage}`}
          </Text>
        </View>
        {onQuickUpdate ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Update progress for ${book.title}`}
            onPress={onQuickUpdate}
            hitSlop={8}
            style={styles.quick}
          >
            <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
              Update
            </Text>
          </Pressable>
        ) : null}
      </View>
      {percent != null ? (
        <ProgressBar percent={percent} accessibilityLabel={`${book.title} ${percent}% complete`} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  quick: { paddingVertical: 8, paddingHorizontal: 4 },
});
