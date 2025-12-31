import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, TextInput, RefreshControl, LayoutAnimation, UIManager, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { Book } from "../../models/Book";
import { getAllBooks } from "../../db";
import { logger } from "../../utils/logger";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;

type StatusFilter = "all" | "reading" | "paused" | "finished";
type SortOption = "recent" | "title" | "author" | "progress";

export function LibraryHomeScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Apply search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
      );
    }

    // Apply sorting
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
      case "recent":
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [books, statusFilter, searchQuery, sortBy]);

  const loadBooks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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

  const onRefresh = useCallback(() => {
    loadBooks(true);
  }, [loadBooks]);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Library</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by title or author…"
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, statusFilter === "all" ? styles.filterChipActive : null]}
          onPress={() => setStatusFilter("all")}
        >
          <Text style={styles.filterChipText}>All</Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            statusFilter === "reading" ? styles.filterChipActive : null,
          ]}
          onPress={() => setStatusFilter("reading")}
        >
          <Text style={styles.filterChipText}>Reading</Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            statusFilter === "paused" ? styles.filterChipActive : null,
          ]}
          onPress={() => setStatusFilter("paused")}
        >
          <Text style={styles.filterChipText}>Paused</Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            statusFilter === "finished" ? styles.filterChipActive : null,
          ]}
          onPress={() => setStatusFilter("finished")}
        >
          <Text style={styles.filterChipText}>Finished</Text>
        </Pressable>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        <Pressable
          style={[styles.sortChip, sortBy === "recent" ? styles.sortChipActive : null]}
          onPress={() => setSortBy("recent")}
        >
          <Text style={styles.sortChipText}>Recent</Text>
        </Pressable>
        <Pressable
          style={[styles.sortChip, sortBy === "title" ? styles.sortChipActive : null]}
          onPress={() => setSortBy("title")}
        >
          <Text style={styles.sortChipText}>Title</Text>
        </Pressable>
        <Pressable
          style={[styles.sortChip, sortBy === "author" ? styles.sortChipActive : null]}
          onPress={() => setSortBy("author")}
        >
          <Text style={styles.sortChipText}>Author</Text>
        </Pressable>
        <Pressable
          style={[styles.sortChip, sortBy === "progress" ? styles.sortChipActive : null]}
          onPress={() => setSortBy("progress")}
        >
          <Text style={styles.sortChipText}>Progress</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.helperText}>Loading books…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredBooks.length === 0 ? styles.emptyContainer : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                {searchQuery.trim()
                  ? "No matching books"
                  : statusFilter === "all"
                  ? "No books yet"
                  : "No books in this status"}
              </Text>
              <Text style={styles.helperText}>
                {searchQuery.trim()
                  ? "Try a different search term."
                  : statusFilter === "all"
                  ? "When you add books, they'll show up here."
                  : "Try selecting a different filter."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Pressable
                style={styles.itemMain}
                onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>{item.author}</Text>
                <Text style={styles.itemMeta}>Current page: {item.currentPage}</Text>
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("UpdateProgress", { bookId: item.id })}
              >
                <Text style={styles.quickActionText}>Quick update</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bbb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: { borderColor: "#333", backgroundColor: "#eee" },
  filterChipText: { fontWeight: "600" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  sortLabel: { fontWeight: "600", opacity: 0.7 },
  sortChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bbb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortChipActive: { borderColor: "#333", backgroundColor: "#eee" },
  sortChipText: { fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyContainer: { flexGrow: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  helperText: { opacity: 0.7, textAlign: "center" },
  errorText: { color: "#B00020", textAlign: "center" },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
  },
  itemMain: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { marginTop: 4, opacity: 0.8 },
  quickAction: { marginTop: 10, alignSelf: "flex-start" },
  quickActionText: { fontWeight: "700" },
});