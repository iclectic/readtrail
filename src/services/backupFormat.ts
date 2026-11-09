import type {
  Achievement,
  AppSettings,
  Book,
  Collection,
  Goal,
  Note,
  ProgressEntry,
  ReadingSession,
  Tag,
} from "../domain/types";

export const BACKUP_FORMAT_VERSION = 2;

export type ReadTrailBackup = {
  formatVersion: number;
  exportedAt: string;
  appVersion: string;
  books: Book[];
  progressEntries: ProgressEntry[];
  sessions: ReadingSession[];
  notes: Note[];
  collections: Collection[];
  tags: Tag[];
  bookCollections: { bookId: string; collectionId: string }[];
  bookTags: { bookId: string; tagId: string }[];
  goals: Goal[];
  achievements: Achievement[];
  settings: AppSettings | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseBackupJson(raw: string): ReadTrailBackup {
  const parsed: unknown = JSON.parse(raw);
  if (!isObject(parsed)) throw new Error("Backup file is not a valid object.");
  if (!Array.isArray(parsed.books)) throw new Error("Backup is missing books.");
  if (!Array.isArray(parsed.progressEntries)) {
    throw new Error("Backup is missing progress entries.");
  }

  return {
    formatVersion: Number(parsed.formatVersion ?? 1),
    exportedAt: String(parsed.exportedAt ?? new Date().toISOString()),
    appVersion: String(parsed.appVersion ?? "unknown"),
    books: parsed.books as Book[],
    progressEntries: parsed.progressEntries as ProgressEntry[],
    sessions: Array.isArray(parsed.sessions) ? (parsed.sessions as ReadingSession[]) : [],
    notes: Array.isArray(parsed.notes) ? (parsed.notes as Note[]) : [],
    collections: Array.isArray(parsed.collections)
      ? (parsed.collections as Collection[])
      : [],
    tags: Array.isArray(parsed.tags) ? (parsed.tags as Tag[]) : [],
    bookCollections: Array.isArray(parsed.bookCollections)
      ? (parsed.bookCollections as { bookId: string; collectionId: string }[])
      : [],
    bookTags: Array.isArray(parsed.bookTags)
      ? (parsed.bookTags as { bookId: string; tagId: string }[])
      : [],
    goals: Array.isArray(parsed.goals) ? (parsed.goals as Goal[]) : [],
    achievements: Array.isArray(parsed.achievements)
      ? (parsed.achievements as Achievement[])
      : [],
    settings: (parsed.settings as AppSettings | null) ?? null,
  };
}
