/** Shared domain types for ReadTrail. British English product copy lives in i18n. */

export const BOOK_STATUSES = [
  "want_to_read",
  "reading",
  "paused",
  "finished",
  "did_not_finish",
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_FORMATS = ["physical", "ebook", "audiobook"] as const;
export type BookFormat = (typeof BOOK_FORMATS)[number];

export const OWNERSHIP_TYPES = ["owned", "borrowed", "library", "wishlist"] as const;
export type OwnershipType = (typeof OWNERSHIP_TYPES)[number];

export const GOAL_TYPES = [
  "daily_pages",
  "daily_minutes",
  "weekly_pages",
  "weekly_minutes",
  "monthly_books",
  "yearly_books",
] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const NOTE_KINDS = ["note", "quote", "reflection"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  status: BookStatus;
  currentPage: number;
  isbn: string | null;
  coverUri: string | null;
  subtitle: string | null;
  publisher: string | null;
  publishedYear: number | null;
  genre: string | null;
  format: BookFormat;
  ownership: OwnershipType;
  rating: number | null;
  description: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressEntry {
  id: string;
  bookId: string;
  page: number;
  note: string;
  sessionId: string | null;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startedAt: string;
  endedAt: string | null;
  startPage: number | null;
  endPage: number | null;
  durationSeconds: number | null;
  notes: string;
}

export interface Note {
  id: string;
  bookId: string;
  sessionId: string | null;
  page: number | null;
  kind: NoteKind;
  body: string;
  tags: string;
  isFavourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  targetValue: number;
  periodStart: string;
  periodEnd: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface AppSettings {
  id: number;
  theme: "system" | "light" | "dark";
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  streakTrackingEnabled: boolean;
  onboardingCompleted: boolean;
  reduceMotion: boolean;
  updatedAt: string;
}

export function isBookStatus(value: string): value is BookStatus {
  return (BOOK_STATUSES as readonly string[]).includes(value);
}

export function isBookFormat(value: string): value is BookFormat {
  return (BOOK_FORMATS as readonly string[]).includes(value);
}

export function isOwnershipType(value: string): value is OwnershipType {
  return (OWNERSHIP_TYPES as readonly string[]).includes(value);
}

export function isGoalType(value: string): value is GoalType {
  return (GOAL_TYPES as readonly string[]).includes(value);
}

export function isNoteKind(value: string): value is NoteKind {
  return (NOTE_KINDS as readonly string[]).includes(value);
}
