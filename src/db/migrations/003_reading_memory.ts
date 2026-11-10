import type { Migration } from "./types";

/** Adds spaced-repetition fields for Reading Memory and a monthly stats helper index. */
export const migration003: Migration = {
  version: 3,
  name: "reading_memory_and_indexes",
  async up(db) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      ALTER TABLE notes ADD COLUMN intervalDays INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE notes ADD COLUMN easeFactor REAL NOT NULL DEFAULT 2.5;
      ALTER TABLE notes ADD COLUMN repetitions INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE notes ADD COLUMN nextReviewAt TEXT;
      ALTER TABLE notes ADD COLUMN lastReviewedAt TEXT;
      ALTER TABLE notes ADD COLUMN includedInMemory INTEGER NOT NULL DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_notes_nextReviewAt ON notes(nextReviewAt);
      CREATE INDEX IF NOT EXISTS idx_notes_includedInMemory ON notes(includedInMemory);
      CREATE INDEX IF NOT EXISTS idx_progress_entries_createdAt ON progress_entries(createdAt);
      CREATE INDEX IF NOT EXISTS idx_books_title_author ON books(title, author);
    `);

    // Favourites and quotations are enrolled in Reading Memory by default.
    await db.runAsync(
      `UPDATE notes
       SET includedInMemory = 1,
           nextReviewAt = COALESCE(nextReviewAt, createdAt)
       WHERE isFavourite = 1 OR kind = 'quote';`
    );
  },
};
