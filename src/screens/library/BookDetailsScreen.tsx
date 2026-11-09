import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Book, ProgressEntry } from "../../domain/types";
import type { LibraryStackParamList } from "../../types/navigation";
import type { Tag } from "../../domain/types";
import { deleteBook, getBookById, getProgressEntriesByBookId, getTagsForBook } from "../../db";
import { removeProgressEntry } from "../../services/progressService";
import { progressPercent, statusLabel } from "../../domain/progress";
import { Button, Chip, ProgressBar } from "../../components";
import { BookCover } from "../../components/library/BookCover";
import { useTheme } from "../../theme";
import { formatDate } from "../../utils/formatDate";
import { warningHaptic, successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<LibraryStackParamList, "BookDetails">;

export function BookDetailsScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { colors, typography, spacing, radii } = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const percent = useMemo(
    () => (book ? progressPercent(book.currentPage, book.totalPages) : null),
    [book]
  );

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
      const [history, bookTags] = await Promise.all([
        getProgressEntriesByBookId(bookId),
        getTagsForBook(bookId),
      ]);
      setBook(b);
      setEntries(history);
      setTags(bookTags);
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
    if (!book) return;
    warningHaptic();
    Alert.alert(
      "Delete book",
      `Are you sure you want to delete “${book.title}”? Progress, notes and sessions for this book will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeleteBook },
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
    Alert.alert("Delete progress entry", `Delete the progress entry for page ${entry.page}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteEntry(entry.id),
      },
    ]);
  }

  async function handleDeleteEntry(entryId: string) {
    try {
      const updated = await removeProgressEntry(entryId, bookId);
      successHaptic();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (updated) setBook(updated);
    } catch (e) {
      logger.error("[book-details] failed to delete entry", e);
      Alert.alert("Error", "Could not delete this progress entry.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{error ?? "Book not found."}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md }]}>
      <View
        style={[
          styles.headerCard,
          {
            borderColor: colors.line,
            backgroundColor: colors.paperElevated,
            borderRadius: radii.lg,
            gap: spacing.xs,
          },
        ]}
      >
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <BookCover uri={book.coverUri} title={book.title} size="md" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[typography.title, { color: colors.ink }]} accessibilityRole="header">
              {book.title}
            </Text>
            <Text style={[typography.body, { color: colors.inkMuted }]}>
              {book.author || "Unknown author"}
            </Text>
            <Text style={[typography.caption, { color: colors.inkSubtle }]}>
              {statusLabel(book.status)}
              {book.format ? ` · ${book.format}` : ""}
              {book.genre ? ` · ${book.genre}` : ""}
            </Text>
          </View>
        </View>
        {tags.length > 0 ? (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
            accessibilityLabel={`Tags: ${tags.map((t) => t.name).join(", ")}`}
          >
            {tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} selected />
            ))}
          </View>
        ) : null}
        <Text style={[typography.caption, { color: colors.inkMuted }]}>
          Page {book.currentPage}
          {book.totalPages > 0 ? ` of ${book.totalPages}` : ""}
          {percent != null ? ` · ${percent}%` : ""}
        </Text>
        {percent != null ? <ProgressBar percent={percent} /> : null}

        <Button
          label="Update progress"
          onPress={() => navigation.navigate("UpdateProgress", { bookId: book.id })}
        />
        <Button
          label="Start reading session"
          variant="secondary"
          onPress={() => navigation.navigate("ReadingSession", { bookId: book.id })}
        />
        <Button
          label="Notes & quotations"
          variant="secondary"
          onPress={() => navigation.navigate("NotesList", { bookId: book.id })}
        />
        <Button
          label={deleting ? "Deleting…" : "Delete book"}
          variant="danger"
          loading={deleting}
          onPress={confirmDeleteBook}
        />
      </View>

      <Text style={[typography.subtitle, { color: colors.ink, marginVertical: spacing.sm }]}>
        Progress history
      </Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: colors.inkMuted }}>
            Add your first progress update to start tracking.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.entry,
              {
                borderColor: colors.line,
                backgroundColor: colors.paperElevated,
                borderRadius: radii.md,
              },
            ]}
          >
            <View style={styles.entryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyStrong, { color: colors.ink }]}>
                  Page {item.page}
                </Text>
                <Text style={[typography.caption, { color: colors.inkSubtle }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Button
                label="Delete"
                variant="ghost"
                onPress={() => confirmDeleteEntry(item)}
              />
            </View>
            {item.note ? (
              <Text style={[typography.body, { color: colors.inkMuted }]}>{item.note}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  headerCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  entry: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  entryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
});
