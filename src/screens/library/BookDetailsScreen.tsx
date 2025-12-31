import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { Book } from "../../models/Book";
import type { ProgressEntry } from "../../models/ProgressEntry";
import type { LibraryStackParamList } from "../../types/navigation";
import { deleteBook, deleteProgressEntry, getBookById, getProgressEntriesByBookId } from "../../db";
import { formatDate } from "../../utils/formatDate";
import { warningHaptic, successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<LibraryStackParamList, "BookDetails">;

export function BookDetailsScreen({ navigation, route }: Props) {
  const { bookId } = route.params;

  const [book, setBook] = useState<Book | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const progressPercent = useMemo(() => {
    if (!book) return null;
    if (!book.totalPages || book.totalPages <= 0) return null;
    const raw = (book.currentPage / book.totalPages) * 100;
    const clamped = Math.max(0, Math.min(100, raw));
    return Math.round(clamped);
  }, [book]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const b = await getBookById(bookId);
      if (!b) {
        setBook(null);
        setEntries([]);
        setError("This book no longer exists.");
        return;
      }
      const history = await getProgressEntriesByBookId(bookId);
      setBook(b);
      setEntries(history);
    } catch (e) {
      logger.error("[book-details] failed to load", e);
      setError("Could not load this book.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDeleteBook() {
    warningHaptic();
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book?.title}"? This will also delete all progress history for this book.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteBook,
        },
      ]
    );
  }

  async function handleDeleteBook() {
    if (!book) return;
    try {
      setDeleting(true);
      await deleteBook(book.id);
      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[book-details] failed to delete book", e);
      Alert.alert("Error", "Could not delete this book.");
    } finally {
      setDeleting(false);
    }
  }

  function confirmDeleteEntry(entry: ProgressEntry) {
    warningHaptic();
    Alert.alert(
      "Delete Progress Entry",
      `Delete the progress entry for page ${entry.page}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteEntry(entry.id),
        },
      ]
    );
  }

  async function handleDeleteEntry(entryId: string) {
    try {
      await deleteProgressEntry(entryId);
      successHaptic();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (e) {
      logger.error("[book-details] failed to delete entry", e);
      Alert.alert("Error", "Could not delete this progress entry.");
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.helperText}>Loading…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !book ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Book not found.</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.meta}>{book.author}</Text>

            <View style={styles.row}>
              <Text style={styles.meta}>Current page: {book.currentPage}</Text>
              {progressPercent !== null ? (
                <Text style={styles.meta}>{progressPercent}%</Text>
              ) : null}
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate("UpdateProgress", { bookId: book.id })}
            >
              <Text style={styles.primaryButtonText}>Update Progress</Text>
            </Pressable>

            <Pressable
              style={[styles.deleteButton, deleting ? styles.deleteButtonDisabled : null]}
              onPress={confirmDeleteBook}
              disabled={deleting}
            >
              <Text style={styles.deleteButtonText}>
                {deleting ? "Deleting…" : "Delete Book"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Progress history</Text>

          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={entries.length === 0 ? styles.emptyContainer : undefined}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyTitle}>No progress yet</Text>
                <Text style={styles.helperText}>
                  Add your first progress update to start tracking.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.entryItem}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryTitle}>Page {item.page}</Text>
                    <Text style={styles.entryMeta}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Pressable
                    style={styles.entryDeleteButton}
                    onPress={() => confirmDeleteEntry(item)}
                  >
                    <Text style={styles.entryDeleteText}>Delete</Text>
                  </Pressable>
                </View>
                {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  helperText: { opacity: 0.7, textAlign: "center" },
  errorText: { color: "#B00020", textAlign: "center" },
  headerCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700" },
  meta: { marginTop: 6, opacity: 0.8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#B00020",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonDisabled: { opacity: 0.6 },
  deleteButtonText: { color: "#B00020", fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  emptyContainer: { flexGrow: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  entryItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryInfo: { flex: 1 },
  entryTitle: { fontWeight: "700" },
  entryMeta: { marginTop: 4, opacity: 0.7 },
  entryDeleteButton: { paddingLeft: 12 },
  entryDeleteText: { color: "#B00020", fontWeight: "600" },
  entryNote: { marginTop: 8 },
});