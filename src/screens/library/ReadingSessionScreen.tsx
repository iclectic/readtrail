import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import type { Book, ReadingSession } from "../../domain/types";
import { getActiveSessionForBook, getBookById } from "../../db";
import {
  completeReadingSession,
  startReadingSession,
} from "../../services/sessionService";
import { formatDuration } from "../../domain/analytics";
import { Button, TextField } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "ReadingSession">;

export function ReadingSessionScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { colors, typography, spacing } = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [endPage, setEndPage] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const b = await getBookById(bookId);
    setBook(b);
    if (b) setEndPage(String(b.currentPage));
    const active = await getActiveSessionForBook(bookId);
    setSession(active);
  }, [bookId]);

  useEffect(() => {
    void load().catch((e) => logger.error("[session] load failed", e));
  }, [load]);

  useEffect(() => {
    if (!session || session.endedAt) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
      );
      setElapsed(seconds);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  async function onStart() {
    setBusy(true);
    try {
      const started = await startReadingSession(bookId);
      setSession(started);
      successHaptic();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not start session.");
    } finally {
      setBusy(false);
    }
  }

  async function onEnd() {
    if (!session) return;
    setBusy(true);
    try {
      const pageValue = endPage.trim() ? Number(endPage) : undefined;
      if (pageValue != null && (!Number.isInteger(pageValue) || pageValue < 0)) {
        Alert.alert("Invalid page", "End page must be a whole number.");
        return;
      }
      await completeReadingSession({
        sessionId: session.id,
        endPage: pageValue,
        notes: notes.trim(),
      });
      successHaptic();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not end session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper, padding: spacing.md, gap: spacing.md }]}>
      <Text style={[typography.title, { color: colors.ink }]}>
        {book?.title ?? "Reading session"}
      </Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Start a timed session, then record the page you reached when you finish.
      </Text>

      {session && !session.endedAt ? (
        <>
          <Text style={[typography.display, { color: colors.accent }]}>
            {formatDuration(elapsed)}
          </Text>
          <Text style={[typography.caption, { color: colors.inkSubtle }]}>
            Started {new Date(session.startedAt).toLocaleString("en-GB")}
          </Text>
          <TextField
            label="Page reached"
            value={endPage}
            onChangeText={setEndPage}
            keyboardType="number-pad"
          />
          <TextField
            label="Session notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
          <Button label="End session" loading={busy} onPress={onEnd} />
        </>
      ) : (
        <Button label="Start session" loading={busy} onPress={onStart} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
