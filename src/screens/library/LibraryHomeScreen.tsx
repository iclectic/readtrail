import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { getAllBooks } from "../../db";
import { BookListItem, Chip, EmptyState } from "../../components";
import { useTheme } from "../../theme";
import { t } from "../../i18n";
import { logger } from "../../utils/logger";
import { statusLabel } from "../../domain/progress";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;
type StatusFilter = "all" | BookStatus;
type SortOption = "recent" | "title" | "author" | "progress";

export function LibraryHomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const copy = t();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
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
  }, [books, statusFilter, searchQuery, sortBy]);

  const loadBooks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const rows = await getAllBooks();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBooks(rows);
    } catch (e) {
      setError("Could not load your library.");
      logger.error("[library] failed to load books", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

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

      <Pressable
        onPress={() => navigation.navigate("Collections")}
        accessibilityRole="button"
        accessibilityLabel="Manage collections"
        style={{ marginBottom: spacing.sm }}
      >
        <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
          Manage collections
        </Text>
      </Pressable>

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
              actionLabel={statusFilter === "all" && !searchQuery.trim() ? copy.library.addBook : undefined}
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
              onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
              onQuickUpdate={() =>
                navigation.navigate("UpdateProgress", { bookId: item.id })
              }
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyContainer: { flexGrow: 1 },
});
