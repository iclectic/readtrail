import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import {
  getAllBooks,
  getAllProgressEntries,
  getAllSessions,
} from "../../db";
import { calculateStreak } from "../../domain/streaks";
import {
  buildAnnualReport,
  formatAnnualReportText,
} from "../../domain/charts";
import { BarChart, Button } from "../../components";
import { useTheme } from "../../theme";
import { formatDuration } from "../../domain/analytics";
import { logger } from "../../utils/logger";
import { successHaptic } from "../../utils/haptics";

export function AnnualReportScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radii } = useTheme();
  const year = new Date().getFullYear();
  const cardRef = useRef<View>(null);
  const [report, setReport] = useState<ReturnType<typeof buildAnnualReport> | null>(
    null
  );
  const [sharingImage, setSharingImage] = useState(false);

  const load = useCallback(async () => {
    try {
      const [books, entries, sessions] = await Promise.all([
        getAllBooks(),
        getAllProgressEntries(),
        getAllSessions(),
      ]);
      const streak = calculateStreak([
        ...entries.map((e) => e.createdAt),
        ...sessions.map((s) => s.startedAt),
      ]);
      setReport(buildAnnualReport(year, books, entries, sessions, streak.longest));
    } catch (e) {
      logger.error("[annual-report] load failed", e);
    }
  }, [year]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const chartItems = useMemo(
    () =>
      (report?.monthly ?? []).map((m) => ({
        label: m.label.split(" ")[0] ?? m.label,
        value: m.pages,
      })),
    [report]
  );

  async function onShareText() {
    if (!report) return;
    try {
      await Share.share({
        message: formatAnnualReportText(report),
        title: `ReadTrail ${report.year}`,
      });
      successHaptic();
    } catch {
      Alert.alert("Share failed", "Could not open the share sheet.");
    }
  }

  async function onShareImage() {
    if (!report || !cardRef.current) return;
    setSharingImage(true);
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing unavailable", "Could not share the image on this device.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `ReadTrail ${report.year}`,
      });
      successHaptic();
    } catch (e) {
      logger.error("[annual-report] image share failed", e);
      Alert.alert(
        "Could not create image",
        "Try sharing the text summary instead."
      );
    } finally {
      setSharingImage(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
      }}
    >
      <Text style={[typography.title, { color: colors.ink }]} accessibilityRole="header">
        {year} reading year
      </Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        A private summary calculated from your local reading history. Share only if you choose
        to.
      </Text>

      {report ? (
        <>
          <View
            ref={cardRef}
            collapsable={false}
            style={[
              styles.shareCard,
              {
                backgroundColor: colors.paperElevated,
                borderColor: colors.line,
                borderRadius: radii.lg,
                padding: spacing.lg,
                gap: spacing.md,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.accent, fontWeight: "700" }]}>
              ReadTrail
            </Text>
            <Text style={[typography.title, { color: colors.ink }]}>
              {report.year} in books
            </Text>
            <View style={styles.statRow}>
              <ShareStat label="Finished" value={String(report.booksFinished)} />
              <ShareStat label="Pages" value={String(report.pagesAdvanced)} />
            </View>
            <View style={styles.statRow}>
              <ShareStat
                label="Time"
                value={formatDuration(report.readingMinutes * 60)}
              />
              <ShareStat label="Streak" value={`${report.longestStreak}d`} />
            </View>
            {report.topAuthors[0] ? (
              <Text style={[typography.body, { color: colors.inkMuted }]}>
                Top author: {report.topAuthors[0].author}
              </Text>
            ) : null}
          </View>

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
            <BarChart
              title="Pages by month"
              items={chartItems}
              valueSuffix=" pages"
            />
          </View>

          {report.topAuthors.length > 0 ? (
            <View
              style={[
                styles.card,
                {
                  borderColor: colors.line,
                  backgroundColor: colors.paperElevated,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  gap: 6,
                },
              ]}
            >
              <Text style={[typography.subtitle, { color: colors.ink }]}>Top authors</Text>
              {report.topAuthors.map((row) => (
                <Text key={row.author} style={[typography.body, { color: colors.inkMuted }]}>
                  {row.author} · {row.count}
                </Text>
              ))}
            </View>
          ) : null}

          <Button label="Share image" loading={sharingImage} onPress={onShareImage} />
          <Button label="Share text summary" variant="secondary" onPress={onShareText} />
        </>
      ) : (
        <Text style={{ color: colors.inkMuted }}>Loading your year…</Text>
      )}
    </ScrollView>
  );
}

function ShareStat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flex: 1 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[typography.title, { color: colors.ink }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  shareCard: { borderWidth: StyleSheet.hairlineWidth },
  statRow: { flexDirection: "row", gap: 12 },
});
