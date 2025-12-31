import * as SQLite from "expo-sqlite";
import { logger } from "../utils/logger";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("readtrail.db");
  }
  return dbPromise;
}

export async function runExec(sql: string): Promise<void> {
  try {
    const db = await getDb();
    await db.execAsync(sql);
  } catch (error) {
    logger.error("[db] exec failed", { sql, error });
    throw error;
  }
}

export async function runWrite(
  sql: string,
  params: SQLite.SQLiteBindParams = []
): Promise<SQLite.SQLiteRunResult> {
  try {
    const db = await getDb();
    const result = await db.runAsync(sql, params);
    return result;
  } catch (error) {
    logger.error("[db] write failed", { sql, params, error });
    throw error;
  }
}

export async function runQuery<T = unknown>(
  sql: string,
  params: SQLite.SQLiteBindParams = []
): Promise<T[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<T>(sql, params);
    return rows;
  } catch (error) {
    logger.error("[db] query failed", { sql, params, error });
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await runExec(`DELETE FROM progress_entries; DELETE FROM books;`);
  } catch (error) {
    logger.error("[db] clear all data failed", error);
    throw error;
  }
}

export async function initDb(): Promise<void> {
  try {
    await runExec(
      `PRAGMA foreign_keys = ON;

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
      `
    );
  } catch (error) {
    logger.error("[db] init failed", error);
    throw error;
  }
}
