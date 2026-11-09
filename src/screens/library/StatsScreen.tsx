import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Book, ProgressEntry, ReadingSession } from "../../domain/types";
import type { RootTabParamList } from "../../types/navigation";
import { getAllBooks, getAllProgressEntries, getAllSessions, getSettings } from "../../db";
import { computeReadingAnalytics, formatDuration } from "../../domain/analytics";
import { buildMonthlySeries } from "../../domain/charts";
import { evaluateAchievements } from "../../services/achievementsService";
import { BarChart, Button } from "../../components";
import { useTheme } from "../../theme";
import { logger } from "../../utils/logger";

export function StatsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { colors, typography, spacing } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const [booksData, entriesData, sessionsData, settings] = await Promise.all([
        getAllBooks(),
        getAllProgressEntries(),
        getAllSessions(),
        getSettings(),
      ]);
      setBooks(booksData);
      setEntries(entriesData);
      setSessions(sessionsData);
      setStreakEnabled(settings.streakTrackingEnabled);
      const unlocked = await evaluateAchievements({
        books: booksData,
        entries: entriesData,
        sessions: sessionsData,
      });
      setAchievements(unlocked.newlyUnlocked);
    } catch (e) {
      logger.error("[stats] failed to load data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const stats = useMemo(
    () => computeReadingAnalytics(books, entries, sessions),
    [books, entries, sessions]
  );

  const monthly = useMemo(
    () => buildMonthlySeries(entries, sessions, books, 6),
    [entries, sessions, books]
  );

  if (loading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={{ color: colors.inkMuted }}>Loading insights…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
      }
    >
      <Text style={[typography.title, { color: colors.ink }]}>Reading insights</Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Figures are calculated from your local reading history.
      </Text>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Button
          label="Reading memory"
          variant="secondary"
          onPress={() =>
            navigation.navigate("LibraryTab", { screen: "ReadingMemory" })
          }
        />
        <Button
          label="Annual report"
          variant="secondary"
          onPress={() =>
            navigation.navigate("LibraryTab", { screen: "AnnualReport" })
          }
        />
      </View>

      <StatCard title="Library">
        <StatGrid
          items={[
            { label: "Total books", value: String(stats.totalBooks) },
            { label: "Finished", value: String(stats.booksFinished) },
            { label: "Reading", value: String(stats.booksReading) },
            { label: "Want to read", value: String(stats.booksWantToRead) },
          ]}
        />
      </StatCard>

      <StatCard title="Progress">
        <StatGrid
          items={[
            {
              label: "Pages advanced",
              value: stats.pagesReadFromHistory.toLocaleString("en-GB"),
            },
            {
              label: "Current page sum",
              value: stats.currentPagesSum.toLocaleString("en-GB"),
            },
            {
              label: "Time reading",
              value: formatDuration(stats.totalReadingSeconds),
            },
            {
              label: "Avg session",
              value: formatDuration(stats.averageSessionSeconds),
            },
          ]}
        />
      </StatCard>

      <StatCard title="Last six months">
        <BarChart
          title="Pages advanced"
          items={monthly.map((m) => ({
            label: m.label.split(" ")[0] ?? m.label,
            value: m.pages,
          }))}
          valueSuffix=" pages"
        />
      </StatCard>

      <StatCard title="Activity">
        <StatGrid
          items={[
            {
              label: streakEnabled ? "Day streak" : "Streak (off)",
              value: streakEnabled ? String(stats.streakCurrent) : "—",
            },
            { label: "Longest streak", value: String(stats.streakLongest) },
            { label: "Updates this week", value: String(stats.updatesThisWeek) },
            { label: "Updates this month", value: String(stats.updatesThisMonth) },
          ]}
        />
      </StatCard>

      {stats.averageRating != null ? (
        <StatCard title="Ratings">
          <Text style={[typography.display, { color: colors.ink }]}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <Text style={[typography.caption, { color: colors.inkMuted }]}>
            Average rating across rated books
          </Text>
        </StatCard>
      ) : null}

      {Object.keys(stats.formatDistribution).length > 0 ? (
        <StatCard title="Formats">
          {Object.entries(stats.formatDistribution).map(([format, count]) => (
            <Text key={format} style={[typography.body, { color: colors.ink }]}>
              {format}: {count}
            </Text>
          ))}
        </StatCard>
      ) : null}

      {stats.authorCounts.length > 0 ? (
        <StatCard title="Top authors">
          {stats.authorCounts.slice(0, 5).map((row) => (
            <Text key={row.author} style={[typography.body, { color: colors.ink }]}>
              {row.author} · {row.count}
            </Text>
          ))}
        </StatCard>
      ) : null}

      {achievements.length > 0 ? (
        <Text style={[typography.caption, { color: colors.success }]}>
          New milestone unlocked: {achievements.join(", ")}
        </Text>
      ) : null}

      {stats.totalBooks === 0 ? (
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: "center" }]}>
          Add books and log progress to unlock richer insights.
        </Text>
      ) : null}
    </ScrollView>
  );
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography, radii, spacing } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.line,
          backgroundColor: colors.paperElevated,
          borderRadius: radii.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.subtitle, { color: colors.ink }]}>{title}</Text>
      {children}
    </View>
  );
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.statItem}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
        >
          <Text style={[typography.title, { color: colors.ink }]}>{item.value}</Text>
          <Text style={[typography.caption, { color: colors.inkMuted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  card: { borderWidth: StyleSheet.hairlineWidth },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  statItem: { width: "50%", paddingVertical: 8 },
});
