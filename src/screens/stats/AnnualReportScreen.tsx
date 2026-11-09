import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [report, setReport] = useState<ReturnType<typeof buildAnnualReport> | null>(
    null
  );

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

  async function onShare() {
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
      <Text style={[typography.title, { color: colors.ink }]}>{year} reading year</Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        A private summary calculated from your local reading history. Share only if you choose
        to.
      </Text>

      {report ? (
        <>
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
            <Stat label="Books finished" value={String(report.booksFinished)} />
            <Stat label="Pages advanced" value={String(report.pagesAdvanced)} />
            <Stat
              label="Time reading"
              value={formatDuration(report.readingMinutes * 60)}
            />
            <Stat label="Longest streak" value={`${report.longestStreak} days`} />
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

          <Button label="Share summary" onPress={onShare} />
        </>
      ) : (
        <Text style={{ color: colors.inkMuted }}>Loading your year…</Text>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[typography.title, { color: colors.ink }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
});
