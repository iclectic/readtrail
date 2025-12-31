import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { LibraryStackParamList } from "../../types/navigation";
import { addProgressEntry, getBookById, updateBook } from "../../db";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "UpdateProgress">;

function makeId(): string {
  const rand = Math.random().toString(16).slice(2);
  return `progress_${Date.now()}_${rand}`;
}

export function UpdateProgressScreen({ navigation, route }: Props) {
  const { bookId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState("");
  const [note, setNote] = useState("");

  const pageNumber = useMemo(() => {
    const parsed = Number(page);
    if (!page) return NaN;
    return parsed;
  }, [page]);

  const pageError = useMemo(() => {
    if (!page) return "Page is required.";
    if (!Number.isInteger(pageNumber) || pageNumber < 0) {
      return "Page must be a whole number.";
    }
    return null;
  }, [page, pageNumber]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const book = await getBookById(bookId);
        if (!mounted) return;

        if (!book) {
          Alert.alert("Not found", "That book no longer exists.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }

        if (book.currentPage > 0) {
          setPage(String(book.currentPage));
        }
      } catch (e) {
        logger.error("[progress] failed to load book", e);
        if (mounted) Alert.alert("Error", "Could not load this book.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bookId, navigation]);

  async function onSave() {
    if (pageError) {
      Alert.alert("Invalid page", pageError);
      return;
    }

    const trimmedNote = note.trim();

    setSaving(true);

    try {
      await addProgressEntry({
        id: makeId(),
        bookId,
        page: pageNumber,
        note: trimmedNote || "",
      });

      await updateBook(bookId, {
        currentPage: pageNumber,
      });

      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[progress] save failed", e);
      Alert.alert("Error", "Could not save progress.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Current page</Text>
        <TextInput
          value={page}
          onChangeText={setPage}
          placeholder="e.g. 42"
          style={[styles.input, pageError ? styles.inputError : null]}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        />
        {pageError ? <Text style={styles.errorText}>{pageError}</Text> : null}

        <Text style={styles.label}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What did you read / learn?"
          style={[styles.input, styles.noteInput]}
          multiline
        />

        <Pressable
          style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save progress"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontWeight: "600" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteInput: { minHeight: 100, textAlignVertical: "top" },
  inputError: { borderColor: "#B00020" },
  errorText: { color: "#B00020" },
  saveButton: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
