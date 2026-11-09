import type { Migration } from "./types";

/**
 * Expands the library schema for production features while preserving existing rows.
 * New columns use camelCase on legacy tables for consistency with the original schema.
 */
export const migration002: Migration = {
  version: 2,
  name: "library_expansion",
  async up(db) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      -- Expand books
      ALTER TABLE books ADD COLUMN isbn TEXT;
      ALTER TABLE books ADD COLUMN coverUri TEXT;
      ALTER TABLE books ADD COLUMN subtitle TEXT;
      ALTER TABLE books ADD COLUMN publisher TEXT;
      ALTER TABLE books ADD COLUMN publishedYear INTEGER;
      ALTER TABLE books ADD COLUMN genre TEXT;
      ALTER TABLE books ADD COLUMN format TEXT NOT NULL DEFAULT 'physical';
      ALTER TABLE books ADD COLUMN ownership TEXT NOT NULL DEFAULT 'owned';
      ALTER TABLE books ADD COLUMN rating REAL;
      ALTER TABLE books ADD COLUMN description TEXT;
      ALTER TABLE books ADD COLUMN startedAt TEXT;
      ALTER TABLE books ADD COLUMN finishedAt TEXT;

      -- Progress entries may link to a session
      ALTER TABLE progress_entries ADD COLUMN sessionId TEXT;

      CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
      CREATE INDEX IF NOT EXISTS idx_books_updatedAt ON books(updatedAt);
      CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
      CREATE INDEX IF NOT EXISTS idx_progress_entries_bookId_createdAt
        ON progress_entries(bookId, createdAt DESC);

      CREATE TABLE IF NOT EXISTS reading_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        startedAt TEXT NOT NULL,
        endedAt TEXT,
        startPage INTEGER,
        endPage INTEGER,
        durationSeconds INTEGER,
        notes TEXT NOT NULL DEFAULT '',
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_reading_sessions_bookId ON reading_sessions(bookId);
      CREATE INDEX IF NOT EXISTS idx_reading_sessions_startedAt ON reading_sessions(startedAt);

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        sessionId TEXT,
        page INTEGER,
        kind TEXT NOT NULL DEFAULT 'note',
        body TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '',
        isFavourite INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (sessionId) REFERENCES reading_sessions(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notes_bookId ON notes(bookId);
      CREATE INDEX IF NOT EXISTS idx_notes_kind ON notes(kind);

      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS book_collections (
        bookId TEXT NOT NULL,
        collectionId TEXT NOT NULL,
        PRIMARY KEY (bookId, collectionId),
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL COLLATE NOCASE UNIQUE,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS book_tags (
        bookId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY (bookId, tagId),
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        targetValue INTEGER NOT NULL,
        periodStart TEXT NOT NULL,
        periodEnd TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(isActive);

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        unlockedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        theme TEXT NOT NULL DEFAULT 'system',
        dailyReminderEnabled INTEGER NOT NULL DEFAULT 0,
        dailyReminderHour INTEGER NOT NULL DEFAULT 20,
        dailyReminderMinute INTEGER NOT NULL DEFAULT 0,
        streakTrackingEnabled INTEGER NOT NULL DEFAULT 1,
        onboardingCompleted INTEGER NOT NULL DEFAULT 0,
        reduceMotion INTEGER NOT NULL DEFAULT 0,
        updatedAt TEXT NOT NULL
      );

      INSERT OR IGNORE INTO app_settings (
        id, theme, dailyReminderEnabled, dailyReminderHour, dailyReminderMinute,
        streakTrackingEnabled, onboardingCompleted, reduceMotion, updatedAt
      ) VALUES (
        1, 'system', 0, 20, 0, 1, 0, 0, datetime('now')
      );
    `);

    // Normalise legacy statuses that are already valid; leave others as-is for app mapping.
    await db.runAsync(
      `UPDATE books SET status = 'reading' WHERE status IS NULL OR status = '';`
    );
  },
};
