import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Goal, GoalType, ProgressEntry, ReadingSession, Book } from "../../domain/types";
import { GOAL_TYPES } from "../../domain/types";
import {
  createId,
  defaultTargetForType,
  goalProgress,
  goalTypeLabel,
  periodBoundsForType,
  pagesReadDelta,
} from "../../domain";
import {
  createGoal,
  deleteGoal,
  getActiveGoals,
  getAllBooks,
  getAllProgressEntries,
  getAllSessions,
  updateGoal,
} from "../../db";
import { Button, Chip, EmptyState, ProgressBar, TextField } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic, warningHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

export function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radii } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [type, setType] = useState<GoalType>("yearly_books");
  const [target, setTarget] = useState(String(defaultTargetForType("yearly_books")));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, b, e, s] = await Promise.all([
        getActiveGoals(),
        getAllBooks(),
        getAllProgressEntries(),
        getAllSessions(),
      ]);
      setGoals(g);
      setBooks(b);
      setEntries(e);
      setSessions(s);
    } catch (err) {
      logger.error("[goals] load failed", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const metrics = useMemo(() => {
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(dayStart);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day));
    const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);
    const yearStart = new Date(dayStart.getFullYear(), 0, 1);

    const entriesIn = (from: Date) =>
      entries.filter((e) => new Date(e.createdAt).getTime() >= from.getTime());
    const sessionsIn = (from: Date) =>
      sessions.filter((s) => new Date(s.startedAt).getTime() >= from.getTime());
    const minutes = (list: ReadingSession[]) =>
      Math.round(
        list.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) / 60
      );
    const finishedSince = (from: Date) =>
      books.filter(
        (b) =>
          b.status === "finished" &&
          b.finishedAt &&
          new Date(b.finishedAt).getTime() >= from.getTime()
      ).length;

    return {
      daily_pages: pagesReadDelta(entriesIn(dayStart)),
      weekly_pages: pagesReadDelta(entriesIn(weekStart)),
      daily_minutes: minutes(sessionsIn(dayStart)),
      weekly_minutes: minutes(sessionsIn(weekStart)),
      monthly_books: finishedSince(monthStart),
      yearly_books: finishedSince(yearStart),
      now,
    };
  }, [books, entries, sessions]);

  async function onCreate() {
    const value = Number(target);
    if (!Number.isInteger(value) || value <= 0) {
      Alert.alert("Invalid target", "Enter a whole number greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const bounds = periodBoundsForType(type);
      await createGoal({
        id: createId("goal"),
        type,
        targetValue: value,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
      });
      successHaptic();
      await load();
    } catch {
      Alert.alert("Error", "Could not create goal.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(goal: Goal) {
    warningHaptic();
    Alert.alert("Remove goal", `Stop tracking “${goalTypeLabel(goal.type)}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await updateGoal(goal.id, { isActive: false });
          await deleteGoal(goal.id);
          successHaptic();
          await load();
        },
      },
    ]);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.paper,
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.title, { color: colors.ink }]} accessibilityRole="header">
        Reading goals
      </Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Gentle targets you control. Streaks and reminders can be disabled in Settings.
      </Text>

      <View style={styles.row}>
        {GOAL_TYPES.map((goalType) => (
          <Chip
            key={goalType}
            label={goalTypeLabel(goalType)}
            selected={type === goalType}
            onPress={() => {
              setType(goalType);
              setTarget(String(defaultTargetForType(goalType)));
            }}
          />
        ))}
      </View>
      <TextField label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" />
      <Button label="Create goal" loading={saving} onPress={onCreate} />

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            title="No active goals"
            body="Set a target for pages, time or books finished."
          />
        }
        renderItem={({ item }) => {
          const current =
            item.type === "daily_pages"
              ? metrics.daily_pages
              : item.type === "weekly_pages"
                ? metrics.weekly_pages
                : item.type === "daily_minutes"
                  ? metrics.daily_minutes
                  : item.type === "weekly_minutes"
                    ? metrics.weekly_minutes
                    : item.type === "monthly_books"
                      ? metrics.monthly_books
                      : metrics.yearly_books;
          const progress = goalProgress(item, {
            pagesRead: current,
            minutesRead: current,
            booksFinished: current,
          });
          const statusLabel = `${goalTypeLabel(item.type)}: ${progress.current} of ${progress.target}${
            progress.complete ? ", complete" : ""
          }`;
          return (
            <View
              accessible
              accessibilityRole="summary"
              accessibilityLabel={statusLabel}
              style={[
                styles.card,
                {
                  borderColor: colors.line,
                  backgroundColor: colors.paperElevated,
                  borderRadius: radii.md,
                  gap: spacing.xs,
                },
              ]}
            >
              <Text style={[typography.bodyStrong, { color: colors.ink }]} accessible={false}>
                {goalTypeLabel(item.type)}
              </Text>
              <Text
                style={[typography.caption, { color: colors.inkMuted }]}
                accessible={false}
              >
                {progress.current} / {progress.target}
                {progress.complete ? " · complete" : ""}
              </Text>
              <ProgressBar percent={progress.percent} />
              <Button
                label={`Remove ${goalTypeLabel(item.type)} goal`}
                variant="ghost"
                onPress={() => confirmDelete(item)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 10,
  },
});
