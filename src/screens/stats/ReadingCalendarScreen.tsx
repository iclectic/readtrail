import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllProgressEntries, getAllSessions } from "../../db";
import { readingCalendar } from "../../domain/streaks";
import { Button } from "../../components";
import { useTheme } from "../../theme";
import { logger } from "../../utils/logger";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function mondayBasedWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function ReadingCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radii } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    try {
      const [entries, sessions] = await Promise.all([
        getAllProgressEntries(),
        getAllSessions(),
      ]);
      const stamps = [
        ...entries.map((e) => e.createdAt),
        ...sessions.map((s) => s.startedAt),
      ];
      setCounts(readingCalendar(stamps, year, month));
    } catch (e) {
      logger.error("[calendar] load failed", e);
    }
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const cells = useMemo(() => {
    const total = daysInMonth(year, month);
    const first = new Date(year, month - 1, 1);
    const offset = mondayBasedWeekday(first);
    const items: { key: string; label: string; count: number; empty?: boolean }[] = [];
    for (let i = 0; i < offset; i++) {
      items.push({ key: `e-${i}`, label: "", count: 0, empty: true });
    }
    for (let day = 1; day <= total; day++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      items.push({ key, label: String(day), count: counts[key] ?? 0 });
    }
    return items;
  }, [year, month, counts]);

  const title = new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  const activeDays = Object.values(counts).filter((n) => n > 0).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.paper,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          paddingHorizontal: spacing.md,
          gap: spacing.md,
        },
      ]}
    >
      <Text style={[typography.title, { color: colors.ink }]}>Reading calendar</Text>
      <Text style={[typography.body, { color: colors.inkMuted }]}>
        Days with progress updates or reading sessions. {activeDays} active day
        {activeDays === 1 ? "" : "s"} this month.
      </Text>

      <View style={styles.nav}>
        <Button label="Previous" variant="ghost" onPress={() => shiftMonth(-1)} />
        <Text style={[typography.subtitle, { color: colors.ink }]}>{title}</Text>
        <Button label="Next" variant="ghost" onPress={() => shiftMonth(1)} />
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={[typography.caption, styles.weekLabel, { color: colors.inkSubtle }]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.cell} />;
          }
          const intensity = Math.min(1, cell.count / 3);
          const backgroundColor =
            cell.count === 0
              ? colors.line
              : `rgba(15, 92, 76, ${0.25 + intensity * 0.75})`;
          return (
            <Pressable
              key={cell.key}
              accessibilityRole="summary"
              accessibilityLabel={`${cell.label} ${title}: ${cell.count} reading activit${cell.count === 1 ? "y" : "ies"}`}
              style={[
                styles.cell,
                {
                  backgroundColor,
                  borderRadius: radii.sm,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: cell.count > 1 ? "#fff" : colors.ink,
                    fontWeight: "700",
                  },
                ]}
              >
                {cell.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekLabel: { width: `${100 / 7}%`, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
});
