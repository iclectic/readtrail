import { migration001 } from "./001_baseline";
import { migration002 } from "./002_library_expansion";
import { migration003 } from "./003_reading_memory";
import type { Migration, MigrationDatabase } from "./types";
import { logger } from "../../utils/logger";

export const MIGRATIONS: Migration[] = [migration001, migration002, migration003];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.reduce(
  (max, m) => Math.max(max, m.version),
  0
);

async function getUserVersion(db: MigrationDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
  return row?.user_version ?? 0;
}

async function setUserVersion(db: MigrationDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version};`);
}

async function recordMigration(
  db: MigrationDatabase,
  migration: Migration
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);`,
    [migration.version, migration.name, new Date().toISOString()]
  );
}

/**
 * Apply pending migrations in order. Safe to call on every app start.
 * Existing installs that already have books/progress tables but user_version=0
 * are treated as version 1 after ensuring baseline tables exist.
 */
export async function runMigrations(db: MigrationDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");

  let current = await getUserVersion(db);

  // Detect legacy databases created before migrations existed.
  if (current === 0) {
    const books = await db.getFirstAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='books' LIMIT 1;`
    );
    if (books) {
      // Ensure schema_migrations exists, then mark baseline as applied.
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );
      `);
      await setUserVersion(db, 1);
      await recordMigration(db, migration001);
      current = 1;
      logger.log("[db] legacy schema detected; baseline marked as v1");
    }
  }

  const pending = MIGRATIONS.filter((m) => m.version > current).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    logger.log(`[db] applying migration v${migration.version}: ${migration.name}`);
    try {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        // schema_migrations may not exist until migration 001
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL
          );
        `);
        await recordMigration(db, migration);
        await setUserVersion(db, migration.version);
      });
      logger.log(`[db] migration v${migration.version} complete`);
    } catch (error) {
      logger.error(`[db] migration v${migration.version} failed`, error);
      throw error;
    }
  }
}
