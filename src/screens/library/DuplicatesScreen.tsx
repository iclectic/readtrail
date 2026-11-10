import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import { getAllBooks } from "../../db";
import {
  duplicateReasonLabel,
  findDuplicateGroups,
  type DuplicateGroup,
} from "../../domain/duplicates";
import { mergeKeepNewest } from "../../services/libraryBulkService";
import { Button, EmptyState } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic, warningHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "Duplicates">;

export function DuplicatesScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);

  const load = useCallback(async () => {
    try {
      const books = await getAllBooks();
      setGroups(findDuplicateGroups(books));
    } catch (e) {
      logger.error("[duplicates] load failed", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function confirmMerge(group: DuplicateGroup) {
    warningHaptic();
    Alert.alert(
      "Keep newest copy?",
      `This will keep the most recently updated book and delete ${group.books.length - 1} other cop${group.books.length - 1 === 1 ? "y" : "ies"}. Progress on deleted copies is removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Keep newest",
          style: "destructive",
          onPress: async () => {
            try {
              await mergeKeepNewest(group.books);
              successHaptic();
              await load();
            } catch (e) {
              Alert.alert("Error", e instanceof Error ? e.message : "Could not merge.");
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md }]}>
      <Text style={[typography.body, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
        Possible duplicates are matched by ISBN or identical title and author. Review before
        deleting.
      </Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.key}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            title="No duplicates found"
            body="Your library looks tidy. New matches will appear here after imports or catalogue adds."
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                borderColor: colors.line,
                backgroundColor: colors.paperElevated,
                borderRadius: radii.md,
                gap: spacing.xs,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.accent }]}>
              {duplicateReasonLabel(item.reason)} · {item.books.length} copies
            </Text>
            {item.books.map((book) => (
              <Text
                key={book.id}
                style={[typography.body, { color: colors.ink }]}
                onPress={() => navigation.navigate("BookDetails", { bookId: book.id })}
                accessibilityRole="link"
              >
                {book.title} — {book.author || "Unknown author"}
              </Text>
            ))}
            <Button label="Keep newest, delete others" variant="danger" onPress={() => confirmMerge(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
});
