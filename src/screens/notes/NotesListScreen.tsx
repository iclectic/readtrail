import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { Note } from "../../domain/types";
import { getNotesByBookId } from "../../db";
import { Button, EmptyState } from "../../components";
import { useTheme } from "../../theme";
import { formatDate } from "../../utils/formatDate";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "NotesList">;

export function NotesListScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { colors, typography, spacing, radii } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);

  const load = useCallback(async () => {
    try {
      setNotes(await getNotesByBookId(bookId));
    } catch (e) {
      logger.error("[notes] load failed", e);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md }]}>
      <Button
        label="Add note"
        onPress={() => navigation.navigate("NoteEditor", { bookId })}
      />
      <FlatList
        style={{ marginTop: spacing.md }}
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title="No notes yet"
            body="Capture quotations, reflections and reminders as you read."
            actionLabel="Add note"
            onAction={() => navigation.navigate("NoteEditor", { bookId })}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("NoteEditor", { bookId, noteId: item.id })
            }
            style={[
              styles.card,
              {
                borderColor: colors.line,
                backgroundColor: colors.paperElevated,
                borderRadius: radii.md,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.accent }]}>
              {item.kind}
              {item.page != null ? ` · p.${item.page}` : ""}
              {item.isFavourite ? " · favourite" : ""}
            </Text>
            <Text style={[typography.body, { color: colors.ink }]} numberOfLines={4}>
              {item.body}
            </Text>
            <Text style={[typography.caption, { color: colors.inkSubtle }]}>
              {formatDate(item.updatedAt)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
});
