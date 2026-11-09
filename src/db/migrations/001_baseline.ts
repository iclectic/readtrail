import type { Migration } from "./types";

/** Baseline schema matching the original ReadTrail tables. */
export const migration001: Migration = {
  version: 1,
  name: "baseline_books_and_progress",
  async up(db) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        totalPages INTEGER NOT NULL,
        status TEXT NOT NULL,
        currentPage INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS progress_entries (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        page INTEGER NOT NULL,
        note TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_progress_entries_bookId ON progress_entries(bookId);

      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);
  },
};
