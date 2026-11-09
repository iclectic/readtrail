import type { Book, ProgressEntry, ReadingSession } from "./types";
import { pagesReadDelta } from "./progress";
import { calculateStreak } from "./streaks";

export interface ReadingAnalytics {
  totalBooks: number;
  booksWantToRead: number;
  booksReading: number;
  booksPaused: number;
  booksFinished: number;
  booksDidNotFinish: number;
  /** Sum of current pages across books (position marker). */
  currentPagesSum: number;
  /** Estimated pages advanced from progress history. */
  pagesReadFromHistory: number;
  totalReadingSeconds: number;
  averageSessionSeconds: number;
  sessionsCount: number;
  streakCurrent: number;
  streakLongest: number;
  updatesThisWeek: number;
  updatesThisMonth: number;
  averageRating: number | null;
  formatDistribution: Record<string, number>;
  genreDistribution: Record<string, number>;
  authorCounts: { author: string; count: number }[];
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function computeReadingAnalytics(
  books: Book[],
  entries: ProgressEntry[],
  sessions: ReadingSession[],
  now: Date = new Date()
): ReadingAnalytics {
  const weekStart = startOfWeek(now).getTime();
  const monthStart = startOfMonth(now).getTime();

  const formatDistribution: Record<string, number> = {};
  const genreDistribution: Record<string, number> = {};
  const authorMap = new Map<string, number>();

  let ratingSum = 0;
  let ratingCount = 0;

  for (const book of books) {
    formatDistribution[book.format] = (formatDistribution[book.format] ?? 0) + 1;
    if (book.genre) {
      genreDistribution[book.genre] = (genreDistribution[book.genre] ?? 0) + 1;
    }
    if (book.author.trim()) {
      authorMap.set(book.author, (authorMap.get(book.author) ?? 0) + 1);
    }
    if (book.rating != null && book.rating > 0) {
      ratingSum += book.rating;
      ratingCount += 1;
    }
  }

  const completedSessions = sessions.filter(
    (s) => s.durationSeconds != null && s.durationSeconds > 0
  );
  const totalReadingSeconds = completedSessions.reduce(
    (sum, s) => sum + (s.durationSeconds ?? 0),
    0
  );

  const activityTimestamps = [
    ...entries.map((e) => e.createdAt),
    ...sessions.map((s) => s.startedAt),
  ];
  const streak = calculateStreak(activityTimestamps, now);

  const authorCounts = [...authorMap.entries()]
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count || a.author.localeCompare(b.author));

  return {
    totalBooks: books.length,
    booksWantToRead: books.filter((b) => b.status === "want_to_read").length,
    booksReading: books.filter((b) => b.status === "reading").length,
    booksPaused: books.filter((b) => b.status === "paused").length,
    booksFinished: books.filter((b) => b.status === "finished").length,
    booksDidNotFinish: books.filter((b) => b.status === "did_not_finish").length,
    currentPagesSum: books.reduce((sum, b) => sum + b.currentPage, 0),
    pagesReadFromHistory: pagesReadDelta(entries),
    totalReadingSeconds,
    averageSessionSeconds:
      completedSessions.length > 0
        ? Math.round(totalReadingSeconds / completedSessions.length)
        : 0,
    sessionsCount: sessions.length,
    streakCurrent: streak.current,
    streakLongest: streak.longest,
    updatesThisWeek: entries.filter((e) => new Date(e.createdAt).getTime() >= weekStart)
      .length,
    updatesThisMonth: entries.filter(
      (e) => new Date(e.createdAt).getTime() >= monthStart
    ).length,
    averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    formatDistribution,
    genreDistribution,
    authorCounts,
  };
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds}s`;
}
