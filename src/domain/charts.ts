import type { ProgressEntry, ReadingSession, Book } from "./types";
import { pagesReadDelta } from "./progress";

export type MonthBucket = {
  key: string; // YYYY-MM
  label: string;
  pages: number;
  sessionsMinutes: number;
  booksFinished: number;
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y!, m! - 1, 1);
  return date.toLocaleString("en-GB", { month: "short", year: "2-digit" });
}

export function buildMonthlySeries(
  entries: ProgressEntry[],
  sessions: ReadingSession[],
  books: Book[],
  monthsBack = 12,
  now: Date = new Date()
): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.push({
      key,
      label: monthLabel(key),
      pages: 0,
      sessionsMinutes: 0,
      booksFinished: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));

  // Approximate pages per month from chronological deltas per book
  const byBook = new Map<string, ProgressEntry[]>();
  for (const entry of entries) {
    const list = byBook.get(entry.bookId) ?? [];
    list.push(entry);
    byBook.set(entry.bookId, list);
  }
  for (const list of byBook.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let previous = 0;
    for (const entry of sorted) {
      const delta = Math.max(0, entry.page - previous);
      previous = entry.page;
      const key = monthKey(new Date(entry.createdAt));
      const idx = index.get(key);
      if (idx != null) buckets[idx]!.pages += delta;
    }
  }

  for (const session of sessions) {
    const key = monthKey(new Date(session.startedAt));
    const idx = index.get(key);
    if (idx != null) {
      buckets[idx]!.sessionsMinutes += Math.round((session.durationSeconds ?? 0) / 60);
    }
  }

  for (const book of books) {
    if (book.status !== "finished" || !book.finishedAt) continue;
    const key = monthKey(new Date(book.finishedAt));
    const idx = index.get(key);
    if (idx != null) buckets[idx]!.booksFinished += 1;
  }

  return buckets;
}

export type AnnualReport = {
  year: number;
  booksFinished: number;
  pagesAdvanced: number;
  readingMinutes: number;
  longestStreak: number;
  topAuthors: { author: string; count: number }[];
  topGenres: { genre: string; count: number }[];
  monthly: MonthBucket[];
};

export function buildAnnualReport(
  year: number,
  books: Book[],
  entries: ProgressEntry[],
  sessions: ReadingSession[],
  longestStreak: number
): AnnualReport {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const finished = books.filter(
    (b) =>
      b.status === "finished" &&
      b.finishedAt &&
      new Date(b.finishedAt) >= yearStart &&
      new Date(b.finishedAt) < yearEnd
  );

  const yearEntries = entries.filter((e) => {
    const t = new Date(e.createdAt);
    return t >= yearStart && t < yearEnd;
  });
  const yearSessions = sessions.filter((s) => {
    const t = new Date(s.startedAt);
    return t >= yearStart && t < yearEnd;
  });

  const authorMap = new Map<string, number>();
  const genreMap = new Map<string, number>();
  for (const book of finished) {
    if (book.author.trim()) {
      authorMap.set(book.author, (authorMap.get(book.author) ?? 0) + 1);
    }
    if (book.genre?.trim()) {
      genreMap.set(book.genre, (genreMap.get(book.genre) ?? 0) + 1);
    }
  }

  const monthly = buildMonthlySeries(yearEntries, yearSessions, finished, 12, yearEnd);
  // Keep only months of the target year
  const yearMonths = monthly.filter((m) => m.key.startsWith(`${year}-`));

  return {
    year,
    booksFinished: finished.length,
    pagesAdvanced: pagesReadDelta(yearEntries),
    readingMinutes: Math.round(
      yearSessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) / 60
    ),
    longestStreak,
    topAuthors: [...authorMap.entries()]
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topGenres: [...genreMap.entries()]
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    monthly: yearMonths.length ? yearMonths : monthly,
  };
}

export function formatAnnualReportText(report: AnnualReport): string {
  const lines = [
    `ReadTrail · ${report.year} reading year`,
    "",
    `Books finished: ${report.booksFinished}`,
    `Pages advanced: ${report.pagesAdvanced}`,
    `Time reading: ${report.readingMinutes} minutes`,
    `Longest streak: ${report.longestStreak} days`,
  ];
  if (report.topAuthors[0]) {
    lines.push(`Top author: ${report.topAuthors[0].author}`);
  }
  if (report.topGenres[0]) {
    lines.push(`Top genre: ${report.topGenres[0].genre}`);
  }
  lines.push("", "Shared from ReadTrail");
  return lines.join("\n");
}
