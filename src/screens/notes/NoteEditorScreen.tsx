import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { NoteKind } from "../../domain/types";
import { NOTE_KINDS } from "../../domain/types";
import { createId } from "../../domain";
import { createNote, deleteNote, getNoteById, updateNote } from "../../db";
import { enrolNoteInMemory, removeNoteFromMemory } from "../../services/memoryService";
import { Button, Chip, TextField } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic, warningHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "NoteEditor">;

export function NoteEditorScreen({ navigation, route }: Props) {
  const { bookId, noteId } = route.params;
  const isEdit = Boolean(noteId);
  const { colors, typography, spacing } = useTheme();
  const [body, setBody] = useState("");
  const [page, setPage] = useState("");
  const [tags, setTags] = useState("");
  const [kind, setKind] = useState<NoteKind>("note");
  const [isFavourite, setIsFavourite] = useState(false);
  const [includedInMemory, setIncludedInMemory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit note" : "Add note" });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (!noteId) return;
    (async () => {
      try {
        const note = await getNoteById(noteId);
        if (!note) {
          Alert.alert("Not found", "That note no longer exists.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setBody(note.body);
        setPage(note.page != null ? String(note.page) : "");
        setTags(note.tags);
        setKind(note.kind);
        setIsFavourite(note.isFavourite);
        setIncludedInMemory(note.includedInMemory);
      } catch (e) {
        logger.error("[note] load failed", e);
      }
    })();
  }, [noteId, navigation]);

  async function onSave() {
    if (!body.trim()) {
      Alert.alert("Missing note", "Please write something before saving.");
      return;
    }
    const pageValue = page.trim() ? Number(page) : null;
    if (pageValue != null && (!Number.isInteger(pageValue) || pageValue < 0)) {
      Alert.alert("Invalid page", "Page must be a whole number.");
      return;
    }
    setSaving(true);
    try {
      const enrol =
        includedInMemory || isFavourite || kind === "quote" || kind === "reflection";

      if (isEdit && noteId) {
        await updateNote(noteId, {
          body: body.trim(),
          page: pageValue,
          tags: tags.trim(),
          kind,
          isFavourite,
        });
        if (enrol) await enrolNoteInMemory(noteId);
        else await removeNoteFromMemory(noteId);
      } else {
        const created = await createNote({
          id: createId("note"),
          bookId,
          body: body.trim(),
          page: pageValue,
          tags: tags.trim(),
          kind,
          isFavourite,
          includedInMemory: enrol,
        });
        if (enrol) await enrolNoteInMemory(created.id);
      }
      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[note] save failed", e);
      Alert.alert("Error", "Could not save this note.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!noteId) return;
    warningHaptic();
    Alert.alert("Delete note", "Delete this note permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(noteId);
          successHaptic();
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[typography.title, { color: colors.ink }]} accessibilityRole="header">
        {isEdit ? "Edit note" : "Add note"}
      </Text>
      <Text style={[typography.label, { color: colors.ink }]} accessibilityRole="header">
        Type
      </Text>
      <View
        style={styles.row}
        accessibilityRole="radiogroup"
        accessibilityLabel={`Note type, ${kind} selected`}
      >
        {NOTE_KINDS.map((k) => (
          <Chip
            key={k}
            label={k[0]!.toUpperCase() + k.slice(1)}
            selected={kind === k}
            onPress={() => setKind(k)}
          />
        ))}
      </View>
      <TextField
        label="Note"
        value={body}
        onChangeText={setBody}
        multiline
        style={{ minHeight: 140, textAlignVertical: "top" }}
      />
      <TextField label="Page (optional)" value={page} onChangeText={setPage} keyboardType="number-pad" />
      <TextField
        label="Tags (comma separated)"
        value={tags}
        onChangeText={setTags}
        autoCapitalize="none"
      />
      <Chip
        label={isFavourite ? "Favourite" : "Mark as favourite"}
        selected={isFavourite}
        onPress={() => setIsFavourite((v) => !v)}
        accessibilityHint={
          isFavourite ? "Double tap to remove favourite" : "Double tap to mark as favourite"
        }
      />
      <Chip
        label={includedInMemory ? "In Reading Memory" : "Add to Reading Memory"}
        selected={includedInMemory}
        onPress={() => setIncludedInMemory((v) => !v)}
        accessibilityHint={
          includedInMemory
            ? "Double tap to remove from Reading Memory"
            : "Double tap to include in Reading Memory"
        }
      />
      <Text
        style={[typography.caption, { color: colors.inkSubtle }]}
        accessibilityRole="summary"
      >
        Reading Memory only revisits notes you saved. It never invents quotations from books.
      </Text>
      <Button label={saving ? "Saving…" : "Save note"} loading={saving} onPress={onSave} />
      {isEdit ? <Button label="Delete note" variant="danger" onPress={confirmDelete} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
