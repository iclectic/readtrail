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
  TextInput,
  UIManager,
  View,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { Book, BookStatus } from "../../domain/types";
import { BOOK_STATUSES } from "../../domain/types";
import type { Tag } from "../../domain/types";
import { getAllBooks, getAllCollections, getAllTags, getBookIdsByTagId } from "../../db";
import { findDuplicateGroups } from "../../domain/duplicates";
import {
  bulkAddToCollection,
  bulkDeleteBooks,
  bulkUpdateStatus,
} from "../../services/libraryBulkService";
import { BookListItem, Button, Chip, EmptyState } from "../../components";
import { useTheme } from "../../theme";
import { t } from "../../i18n";
import { logger } from "../../utils/logger";
import { statusLabel } from "../../domain/progress";
import { successHaptic, warningHaptic } from "../../utils/haptics";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;
type StatusFilter = "all" | BookStatus;
type SortOption = "recent" | "title" | "author" | "progress";

export function LibraryHomeScreen({ navigation }: Props) {
  const { colors, typography, spacing, reduceMotion } = useTheme();
  const copy = t();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [tagBookIds, setTagBookIds] = useState<Set<string> | null>(null);

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (tagFilter && tagBookIds) {
      result = result.filter((b) => tagBookIds.has(b.id));
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          (b.isbn ?? "").toLowerCase().includes(query) ||
          (b.genre ?? "").toLowerCase().includes(query)
      );
    }
    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "progress":
        result.sort((a, b) => {
          const progressA = a.totalPages > 0 ? a.currentPage / a.totalPages : 0;
          const progressB = b.totalPages > 0 ? b.currentPage / b.totalPages : 0;
          return progressB - progressA;
        });
        break;
      default:
        result.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
    return result;
  }, [books, statusFilter, searchQuery, sortBy, tagFilter, tagBookIds]);

  const loadBooks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const rows = await getAllBooks();
      if (!reduceMotion) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setBooks(rows);
      setDuplicateCount(findDuplicateGroups(rows).length);
      setTags(await getAllTags());
    } catch (e) {
      setError("Could not load your library.");
      logger.error("[library] failed to load books", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reduceMotion]);

  const onSelectTag = useCallback(async (tagId: string | null) => {
    setTagFilter(tagId);
    if (!tagId) {
      setTagBookIds(null);
      return;
    }
    const ids = await getBookIdsByTagId(tagId);
    setTagBookIds(new Set(ids));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  function toggleSelect(id: string) {
    setSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }

  async function onBulkStatus(status: BookStatus) {
    const ids = [...selectedIds];
    if (!ids.length) return;
    await bulkUpdateStatus(ids, status);
    successHaptic();
    clearSelection();
    await loadBooks();
  }

  function onBulkDelete() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    warningHaptic();
    Alert.alert(
      "Delete selected books",
      `Delete ${ids.length} book${ids.length === 1 ? "" : "s"} and their progress?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await bulkDeleteBooks(ids);
            successHaptic();
            clearSelection();
            await loadBooks();
          },
        },
      ]
    );
  }

  async function onBulkCollection() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const collections = await getAllCollections();
    if (!collections.length) {
      Alert.alert("No collections", "Create a collection first, then try again.", [
        { text: "OK" },
        { text: "Create", onPress: () => navigation.navigate("Collections") },
      ]);
      return;
    }
    Alert.alert(
      "Add to collection",
      "Choose a collection for the selected books.",
      [
        ...collections.slice(0, 5).map((c) => ({
          text: c.name,
          onPress: async () => {
            await bulkAddToCollection(ids, c.id);
            successHaptic();
            clearSelection();
          },
        })),
        { text: "Cancel", style: "cancel" as const },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md }]}>
      <Text style={[typography.title, { color: colors.ink, marginBottom: spacing.sm }]}>
        {copy.library.title}
      </Text>

      <TextInput
        style={[
          styles.searchInput,
          {
            borderColor: colors.line,
            backgroundColor: colors.paperElevated,
            color: colors.ink,
          },
        ]}
        placeholder={copy.library.searchPlaceholder}
        placeholderTextColor={colors.inkSubtle}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={copy.library.searchPlaceholder}
      />

      <View style={styles.filterRow}>
        <Chip
          label={copy.status.all}
          selected={statusFilter === "all"}
          onPress={() => setStatusFilter("all")}
        />
        {BOOK_STATUSES.map((status) => (
          <Chip
            key={status}
            label={statusLabel(status)}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status)}
          />
        ))}
      </View>

      <View style={styles.sortRow}>
        <Text style={[typography.caption, { color: colors.inkMuted }]}>Sort</Text>
        {(["recent", "title", "author", "progress"] as SortOption[]).map((option) => (
          <Chip
            key={option}
            label={option[0]!.toUpperCase() + option.slice(1)}
            selected={sortBy === option}
            onPress={() => setSortBy(option)}
          />
        ))}
      </View>

      {tags.length > 0 ? (
        <View style={styles.filterRow}>
          <Text style={[typography.caption, { color: colors.inkMuted }]}>Tags</Text>
          <Chip
            label="Any tag"
            selected={tagFilter == null}
            onPress={() => void onSelectTag(null)}
          />
          {tags.slice(0, 12).map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              selected={tagFilter === tag.id}
              onPress={() => void onSelectTag(tag.id)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.links}>
        <Pressable onPress={() => navigation.navigate("Collections")} accessibilityRole="button">
          <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
            Collections
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Duplicates")}
          accessibilityRole="button"
          accessibilityLabel={`Possible duplicates, ${duplicateCount} groups`}
        >
          <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
            Duplicates{duplicateCount > 0 ? ` (${duplicateCount})` : ""}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            selectionMode ? clearSelection() : setSelectionMode(true)
          }
          accessibilityRole="button"
        >
          <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
            {selectionMode ? "Cancel select" : "Select"}
          </Text>
        </Pressable>
      </View>

      {selectionMode && selectedIds.size > 0 ? (
        <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.inkMuted }]}>
            {selectedIds.size} selected
          </Text>
          <View style={styles.bulkRow}>
            <Button label="Reading" variant="secondary" onPress={() => void onBulkStatus("reading")} />
            <Button label="Finished" variant="secondary" onPress={() => void onBulkStatus("finished")} />
          </View>
          <View style={styles.bulkRow}>
            <Button label="Add to collection" variant="secondary" onPress={() => void onBulkCollection()} />
            <Button label="Delete" variant="danger" onPress={onBulkDelete} />
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.inkMuted }}>{copy.common.loading}</Text>
        </View>
      ) : error ? (
        <EmptyState title={error} actionLabel={copy.common.retry} onAction={() => loadBooks()} />
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={11}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={filteredBooks.length === 0 ? styles.emptyContainer : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadBooks(true)} />
          }
          ListEmptyComponent={
            <EmptyState
              title={
                searchQuery.trim()
                  ? copy.library.noMatchTitle
                  : statusFilter === "all"
                    ? copy.library.emptyTitle
                    : "No books in this status"
              }
              body={
                searchQuery.trim()
                  ? copy.library.noMatchBody
                  : statusFilter === "all"
                    ? copy.library.emptyBody
                    : "Try selecting a different filter."
              }
              actionLabel={
                statusFilter === "all" && !searchQuery.trim() ? copy.library.addBook : undefined
              }
              onAction={
                statusFilter === "all" && !searchQuery.trim()
                  ? () => navigation.navigate("AddEditBook")
                  : undefined
              }
            />
          }
          renderItem={({ item }) => (
            <BookListItem
              book={item}
              selectionMode={selectionMode}
              selected={selectedIds.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
              onQuickUpdate={() => navigation.navigate("UpdateProgress", { bookId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  bulkRow: { flexDirection: "row", gap: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyContainer: { flexGrow: 1 },
});
