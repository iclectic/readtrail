import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Book } from "../../models/Book";
import type { ProgressEntry } from "../../models/ProgressEntry";
import { getAllBooks, getAllProgressEntries } from "../../db";
import { logger } from "../../utils/logger";

export function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [booksData, entriesData] = await Promise.all([
        getAllBooks(),
        getAllProgressEntries(),
      ]);
      setBooks(booksData);
      setEntries(entriesData);
    } catch (e) {
      logger.error("[stats] failed to load data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const booksReading = books.filter((b) => b.status === "reading").length;
    const booksPaused = books.filter((b) => b.status === "paused").length;
    const booksFinished = books.filter((b) => b.status === "finished").length;

    const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);
    const totalPagesInLibrary = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);

    // Calculate pages read this week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const entriesThisWeek = entries.filter((e) => new Date(e.createdAt) >= weekAgo);

    // Get unique pages per book this week (latest entry per book)
    const pagesThisWeek = entriesThisWeek.length > 0
      ? entriesThisWeek.reduce((max, e) => Math.max(max, e.page), 0)
      : 0;

    // Calculate pages read this month
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const entriesThisMonth = entries.filter((e) => new Date(e.createdAt) >= monthAgo);

    // Reading streak (consecutive days with progress entries)
    const uniqueDays = new Set(
      entries.map((e) => new Date(e.createdAt).toDateString())
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      if (uniqueDays.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Average progress percentage
    const booksWithTotal = books.filter((b) => b.totalPages > 0);
    const avgProgress = booksWithTotal.length > 0
      ? Math.round(
          booksWithTotal.reduce(
            (sum, b) => sum + (b.currentPage / b.totalPages) * 100,
            0
          ) / booksWithTotal.length
        )
      : 0;

    return {
      totalBooks,
      booksReading,
      booksPaused,
      booksFinished,
      totalPagesRead,
      totalPagesInLibrary,
      entriesThisWeek: entriesThisWeek.length,
      entriesThisMonth: entriesThisMonth.length,
      streak,
      avgProgress,
    };
  }, [books, entries]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading stats…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Reading Stats</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Library Overview</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalBooks}</Text>
            <Text style={styles.statLabel}>Total Books</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.booksFinished}</Text>
            <Text style={styles.statLabel}>Finished</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.booksReading}</Text>
            <Text style={styles.statLabel}>Reading</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.booksPaused}</Text>
            <Text style={styles.statLabel}>Paused</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📖 Pages</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPagesRead.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pages Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgProgress}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Activity</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.entriesThisWeek}</Text>
            <Text style={styles.statLabel}>Updates This Week</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.entriesThisMonth}</Text>
            <Text style={styles.statLabel}>Updates This Month</Text>
          </View>
        </View>
      </View>

      {stats.totalBooks === 0 && (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintText}>
            Add some books to start tracking your reading stats!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  loadingText: { opacity: 0.7 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyHint: {
    padding: 16,
    alignItems: "center",
  },
  emptyHintText: {
    opacity: 0.7,
    textAlign: "center",
  },
});
