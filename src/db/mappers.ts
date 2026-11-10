import type {
  Achievement,
  AppSettings,
  Book,
  BookFormat,
  BookStatus,
  Collection,
  Goal,
  GoalType,
  Note,
  NoteKind,
  OwnershipType,
  ProgressEntry,
  ReadingSession,
  Tag,
} from "../domain/types";
import {
  isBookFormat,
  isBookStatus,
  isGoalType,
  isNoteKind,
  isOwnershipType,
} from "../domain/types";

type BookRow = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  status: string;
  currentPage: number;
  isbn: string | null;
  coverUri: string | null;
  subtitle: string | null;
  publisher: string | null;
  publishedYear: number | null;
  genre: string | null;
  format: string | null;
  ownership: string | null;
  rating: number | null;
  description: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapBook(row: BookRow): Book {
  const status: BookStatus = isBookStatus(row.status) ? row.status : "reading";
  const format: BookFormat =
    row.format && isBookFormat(row.format) ? row.format : "physical";
  const ownership: OwnershipType =
    row.ownership && isOwnershipType(row.ownership) ? row.ownership : "owned";

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    totalPages: row.totalPages,
    status,
    currentPage: row.currentPage,
    isbn: row.isbn ?? null,
    coverUri: row.coverUri ?? null,
    subtitle: row.subtitle ?? null,
    publisher: row.publisher ?? null,
    publishedYear: row.publishedYear ?? null,
    genre: row.genre ?? null,
    format,
    ownership,
    rating: row.rating ?? null,
    description: row.description ?? null,
    startedAt: row.startedAt ?? null,
    finishedAt: row.finishedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ProgressRow = {
  id: string;
  bookId: string;
  page: number;
  note: string;
  sessionId?: string | null;
  createdAt: string;
};

export function mapProgressEntry(row: ProgressRow): ProgressEntry {
  return {
    id: row.id,
    bookId: row.bookId,
    page: row.page,
    note: row.note ?? "",
    sessionId: row.sessionId ?? null,
    createdAt: row.createdAt,
  };
}

type SessionRow = {
  id: string;
  bookId: string;
  startedAt: string;
  endedAt: string | null;
  startPage: number | null;
  endPage: number | null;
  durationSeconds: number | null;
  notes: string;
};

export function mapSession(row: SessionRow): ReadingSession {
  return {
    id: row.id,
    bookId: row.bookId,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    startPage: row.startPage,
    endPage: row.endPage,
    durationSeconds: row.durationSeconds,
    notes: row.notes ?? "",
  };
}

type NoteRow = {
  id: string;
  bookId: string;
  sessionId: string | null;
  page: number | null;
  kind: string;
  body: string;
  tags: string;
  isFavourite: number;
  intervalDays?: number | null;
  easeFactor?: number | null;
  repetitions?: number | null;
  nextReviewAt?: string | null;
  lastReviewedAt?: string | null;
  includedInMemory?: number | null;
  createdAt: string;
  updatedAt: string;
};

export function mapNote(row: NoteRow): Note {
  const kind: NoteKind = isNoteKind(row.kind) ? row.kind : "note";
  return {
    id: row.id,
    bookId: row.bookId,
    sessionId: row.sessionId,
    page: row.page,
    kind,
    body: row.body,
    tags: row.tags ?? "",
    isFavourite: Boolean(row.isFavourite),
    intervalDays: row.intervalDays ?? 0,
    easeFactor: row.easeFactor ?? 2.5,
    repetitions: row.repetitions ?? 0,
    nextReviewAt: row.nextReviewAt ?? null,
    lastReviewedAt: row.lastReviewedAt ?? null,
    includedInMemory: Boolean(row.includedInMemory),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const NOTE_COLUMNS = `
  id, bookId, sessionId, page, kind, body, tags, isFavourite,
  intervalDays, easeFactor, repetitions, nextReviewAt, lastReviewedAt, includedInMemory,
  createdAt, updatedAt
`;

export function mapCollection(row: {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapTag(row: { id: string; name: string; createdAt: string }): Tag {
  return { id: row.id, name: row.name, createdAt: row.createdAt };
}

export function mapGoal(row: {
  id: string;
  type: string;
  targetValue: number;
  periodStart: string;
  periodEnd: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}): Goal {
  const type: GoalType = isGoalType(row.type) ? row.type : "yearly_books";
  return {
    id: row.id,
    type,
    targetValue: row.targetValue,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapAchievement(row: {
  id: string;
  key: string;
  title: string;
  description: string;
  unlockedAt: string;
}): Achievement {
  return { ...row };
}

export function mapSettings(row: {
  id: number;
  theme: string;
  dailyReminderEnabled: number;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  streakTrackingEnabled: number;
  onboardingCompleted: number;
  reduceMotion: number;
  lastBackupAt?: string | null;
  updatedAt: string;
}): AppSettings {
  const theme =
    row.theme === "light" || row.theme === "dark" || row.theme === "system"
      ? row.theme
      : "system";
  return {
    id: 1,
    theme,
    dailyReminderEnabled: Boolean(row.dailyReminderEnabled),
    dailyReminderHour: row.dailyReminderHour,
    dailyReminderMinute: row.dailyReminderMinute,
    streakTrackingEnabled: Boolean(row.streakTrackingEnabled),
    onboardingCompleted: Boolean(row.onboardingCompleted),
    reduceMotion: Boolean(row.reduceMotion),
    lastBackupAt: row.lastBackupAt ?? null,
    updatedAt: row.updatedAt,
  };
}

export const BOOK_COLUMNS = `
  id, title, author, totalPages, status, currentPage,
  isbn, coverUri, subtitle, publisher, publishedYear, genre,
  format, ownership, rating, description, startedAt, finishedAt,
  createdAt, updatedAt
`;
