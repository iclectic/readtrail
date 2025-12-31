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
import { createBook, getBookById, updateBook } from "../../db";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "AddEditBook">;

type BookStatus = "reading" | "paused" | "finished";

function makeId(): string {
  const rand = Math.random().toString(16).slice(2);
  return `book_${Date.now()}_${rand}`;
}

export function AddEditBookScreen({ navigation, route }: Props) {
  const bookId = route.params?.bookId;
  const isEdit = Boolean(bookId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [status, setStatus] = useState<BookStatus>("reading");

  const titleError = useMemo(() => {
    if (title.trim().length === 0) return "Title is required.";
    return null;
  }, [title]);

  const totalPagesNumber = useMemo(() => {
    const parsed = Number(totalPages);
    if (!totalPages) return 0;
    if (!Number.isFinite(parsed)) return NaN;
    return parsed;
  }, [totalPages]);

  const totalPagesError = useMemo(() => {
    if (!totalPages) return null;
    if (!Number.isInteger(totalPagesNumber) || totalPagesNumber < 0) {
      return "Total pages must be a whole number.";
    }
    return null;
  }, [totalPages, totalPagesNumber]);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Book" : "Add Book" });
  }, [isEdit, navigation]);

  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const book = await getBookById(bookId!);
        if (!mounted) return;

        if (!book) {
          Alert.alert("Not found", "That book no longer exists.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }

        setTitle(book.title);
        setAuthor(book.author);
        setTotalPages(String(book.totalPages));
        setStatus((book.status as BookStatus) ?? "reading");
      } catch (e) {
        logger.error("[book] failed to load for edit", e);
        if (mounted) {
          Alert.alert("Error", "Could not load this book.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bookId, isEdit, navigation]);

  async function onSave() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      Alert.alert("Missing title", "Please enter a title.");
      return;
    }

    if (totalPagesError) {
      Alert.alert("Invalid total pages", totalPagesError);
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        const result = await updateBook(bookId!, {
          title: trimmedTitle,
          author: author.trim(),
          totalPages: totalPages ? totalPagesNumber : 0,
          status,
        });

        if (!result) {
          Alert.alert("Not found", "That book no longer exists.");
          return;
        }
      } else {
        await createBook({
          id: makeId(),
          title: trimmedTitle,
          author: author.trim(),
          totalPages: totalPages ? totalPagesNumber : 0,
          status,
          currentPage: 0,
        });
      }

      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[book] save failed", e);
      Alert.alert("Error", "Could not save the book.");
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
        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Atomic Habits"
          style={[styles.input, titleError ? styles.inputError : null]}
          autoCapitalize="sentences"
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

        <Text style={styles.label}>Author</Text>
        <TextInput
          value={author}
          onChangeText={setAuthor}
          placeholder="e.g. James Clear"
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Total pages</Text>
        <TextInput
          value={totalPages}
          onChangeText={setTotalPages}
          placeholder="e.g. 320"
          style={[styles.input, totalPagesError ? styles.inputError : null]}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        />
        {totalPagesError ? <Text style={styles.errorText}>{totalPagesError}</Text> : null}

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          <Pressable
            style={[styles.statusChip, status === "reading" ? styles.statusChipActive : null]}
            onPress={() => setStatus("reading")}
          >
            <Text style={styles.statusChipText}>Reading</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, status === "paused" ? styles.statusChipActive : null]}
            onPress={() => setStatus("paused")}
          >
            <Text style={styles.statusChipText}>Paused</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, status === "finished" ? styles.statusChipActive : null]}
            onPress={() => setStatus("finished")}
          >
            <Text style={styles.statusChipText}>Finished</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save"}</Text>
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
  inputError: { borderColor: "#B00020" },
  errorText: { color: "#B00020" },
  statusRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  statusChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bbb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusChipActive: {
    borderColor: "#333",
    backgroundColor: "#eee",
  },
  statusChipText: { fontWeight: "600" },
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
