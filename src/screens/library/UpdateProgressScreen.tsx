import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../types/navigation";
import { getBookById } from "../../db";
import { recordProgress } from "../../services/progressService";
import { Button, TextField } from "../../components";
import { useTheme } from "../../theme";
import { successHaptic } from "../../utils/haptics";
import { logger } from "../../utils/logger";

type Props = NativeStackScreenProps<LibraryStackParamList, "UpdateProgress">;

export function UpdateProgressScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { colors, typography, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState("");
  const [note, setNote] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const pageNumber = useMemo(() => {
    if (!page) return NaN;
    return Number(page);
  }, [page]);

  const pageError = useMemo(() => {
    if (!page) return "Page is required.";
    if (!Number.isInteger(pageNumber) || pageNumber < 0) {
      return "Page must be a whole number.";
    }
    if (totalPages > 0 && pageNumber > totalPages) {
      return `Page cannot exceed the total of ${totalPages} pages.`;
    }
    return null;
  }, [page, pageNumber, totalPages]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const book = await getBookById(bookId);
        if (!mounted) return;
        if (!book) {
          Alert.alert("Not found", "That book no longer exists.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setTotalPages(book.totalPages);
        if (book.currentPage > 0) setPage(String(book.currentPage));
      } catch (e) {
        logger.error("[progress] failed to load book", e);
        if (mounted) Alert.alert("Error", "Could not load this book.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookId, navigation]);

  async function onSave() {
    if (pageError) {
      Alert.alert("Invalid page", pageError);
      return;
    }
    setSaving(true);
    try {
      await recordProgress({
        bookId,
        page: pageNumber,
        note: note.trim(),
      });
      successHaptic();
      navigation.goBack();
    } catch (e) {
      logger.error("[progress] save failed", e);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not save progress."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View
        style={styles.loading}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading progress form"
      >
        <Text style={{ color: colors.inkMuted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.paper }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        keyboardShouldPersistTaps="handled"
      >
        {totalPages > 0 ? (
          <Text style={[typography.caption, { color: colors.inkMuted }]}>
            Total pages: {totalPages}
          </Text>
        ) : null}
        <TextField
          label="Current page"
          value={page}
          onChangeText={setPage}
          error={pageError}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What stood out?"
          multiline
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
        <Button
          label={saving ? "Saving…" : "Save progress"}
          loading={saving}
          onPress={onSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
