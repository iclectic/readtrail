import BetterSqlite3 from "better-sqlite3";
import type { MigrationDatabase } from "../../../src/db/migrations/types";

/**
 * In-memory SQLite adapter that mirrors the expo-sqlite async surface
 * used by `runMigrations` and raw integrity checks in Node/Jest.
 */
export function createNodeSqlite(): MigrationDatabase & {
  close: () => void;
  raw: BetterSqlite3.Database;
} {
  const raw = new BetterSqlite3(":memory:");
  raw.pragma("foreign_keys = ON");

  return {
    raw,
    close: () => raw.close(),
    async execAsync(source: string) {
      raw.exec(source);
    },
    async runAsync(source: string, params: unknown[] = []) {
      return raw.prepare(source).run(...params);
    },
    async getFirstAsync<T>(source: string, params: unknown[] = []) {
      const row = raw.prepare(source).get(...params);
      return (row as T | undefined) ?? null;
    },
    async getAllAsync<T>(source: string, params: unknown[] = []) {
      return raw.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task: () => Promise<void>) {
      raw.exec("BEGIN");
      try {
        await task();
        raw.exec("COMMIT");
      } catch (error) {
        raw.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
