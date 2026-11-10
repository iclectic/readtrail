import type { Migration } from "./types";

/** Tracks when the user last exported a backup for soft reminders. */
export const migration004: Migration = {
  version: 4,
  name: "backup_reminder",
  async up(db) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      ALTER TABLE app_settings ADD COLUMN lastBackupAt TEXT;
    `);
  },
};
