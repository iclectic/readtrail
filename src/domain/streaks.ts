/**
 * Reading streak helpers.
 * A day counts when at least one progress entry, session, or note exists.
 * Streak allows "today not yet" without breaking yesterday's streak.
 */

function toDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  date.setDate(date.getDate() + delta);
  return toDayKey(date);
}

export function uniqueReadingDays(timestamps: string[]): Set<string> {
  const days = new Set<string>();
  for (const ts of timestamps) {
    if (!ts) continue;
    const parsed = new Date(ts);
    if (Number.isNaN(parsed.getTime())) continue;
    days.add(toDayKey(parsed));
  }
  return days;
}

export function calculateStreak(
  timestamps: string[],
  now: Date = new Date(),
  options: { allowMissedDays?: number } = {}
): { current: number; longest: number } {
  const allowMissedDays = options.allowMissedDays ?? 0;
  const days = uniqueReadingDays(timestamps);
  if (days.size === 0) return { current: 0, longest: 0 };

  const today = toDayKey(now);
  let current = 0;
  let cursor = today;
  let missedBudget = allowMissedDays;

  // If today has no activity, start from yesterday without counting a break.
  if (!days.has(today)) {
    cursor = addDays(today, -1);
  }

  while (true) {
    if (days.has(cursor)) {
      current += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    if (missedBudget > 0 && current > 0) {
      missedBudget -= 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }

  // Longest streak in chronological order
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    if (previous && addDays(previous, 1) === day) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest: Math.max(longest, current) };
}

export function readingCalendar(
  timestamps: string[],
  year: number,
  month: number // 1-12
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ts of timestamps) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
    const key = toDayKey(d);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
