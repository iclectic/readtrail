import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { ReviewQuality } from "../../domain/memory";
import {
  loadMemoryQueue,
  reviewMemoryNote,
  type MemoryCard,
} from "../../services/memoryService";
import { Button, EmptyState } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "ReadingMemory">;

const QUALITIES: { label: string; value: ReviewQuality; hint: string }[] = [
  { label: "Forgot", value: 1, hint: "Could not recall" },
  { label: "Hard", value: 3, hint: "Recalled with effort" },
  { label: "Good", value: 4, hint: "Recalled comfortably" },
  { label: "Easy", value: 5, hint: "Knew it immediately" },
];

export function ReadingMemoryScreen({}: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const [due, setDue] = useState<MemoryCard[]>([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const queue = await loadMemoryQueue();
      setDue(queue.due);
      setUpcomingCount(queue.upcoming.length);
      setRevealed(false);
    } catch (e) {
      logger.error("[memory] load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const current = due[0] ?? null;

  async function onReview(quality: ReviewQuality) {
    if (!current) return;
    setBusy(true);
    try {
      await reviewMemoryNote(current.note.id, quality);
      successHaptic();
      await load();
    } catch (e) {
      Alert.alert("Error", "Could not save this review.");
      logger.error("[memory] review failed", e);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.paper }]}>
        <Text style={{ color: colors.inkMuted }}>Preparing your reading memory…</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md }]}>
        <EmptyState
          title="Nothing due today"
          body={
            upcomingCount > 0
              ? `You have ${upcomingCount} idea${upcomingCount === 1 ? "" : "s"} scheduled for later. Favourite quotations and reflections appear here using gentle spaced repetition.`
              : "Favourite a quotation or reflection from a finished book to revisit meaningful ideas over time. ReadTrail never invents quotations."
          }
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.paper, padding: spacing.md, gap: spacing.md },
      ]}
    >
      <Text
        accessibilityRole="summary"
        accessibilityLabel={`${due.length} due, ${upcomingCount} upcoming`}
        style={[typography.caption, { color: colors.inkMuted }]}
      >
        {due.length} due · {upcomingCount} upcoming
      </Text>
      <Text style={[typography.title, { color: colors.ink }]} accessibilityRole="header">
        {current.book?.title ?? "Your note"}
      </Text>
      <Text style={[typography.caption, { color: colors.accent }]}>
        {current.note.kind}
        {current.note.page != null ? ` · p.${current.note.page}` : ""}
        {current.book?.author ? ` · ${current.book.author}` : ""}
      </Text>

      <View
        style={[
          styles.card,
          {
            borderColor: colors.line,
            backgroundColor: colors.paperElevated,
            borderRadius: radii.lg,
            padding: spacing.md,
          },
        ]}
      >
        {revealed ? (
          <Text style={[typography.body, { color: colors.ink, lineHeight: 24 }]}>
            {current.note.body}
          </Text>
        ) : (
          <Text style={[typography.body, { color: colors.inkMuted }]}>
            Try to recall this idea from your notes, then reveal it.
          </Text>
        )}
      </View>

      {!revealed ? (
        <Button label="Reveal note" onPress={() => setRevealed(true)} />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: colors.ink }]}>How well did you recall it?</Text>
          {QUALITIES.map((q) => (
            <Button
              key={q.value}
              label={`${q.label} — ${q.hint}`}
              variant={q.value >= 4 ? "primary" : "secondary"}
              loading={busy}
              onPress={() => void onReview(q.value)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderWidth: StyleSheet.hairlineWidth, minHeight: 140, justifyContent: "center" },
});
