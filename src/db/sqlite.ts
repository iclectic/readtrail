import * as SQLite from "expo-sqlite";
import { logger } from "../utils/logger";
import { CLEAR_ALL_USER_DATA_SQL } from "./clearDataSql";
import { runMigrations } from "./migrations";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initialised = false;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("readtrail.db");
  }
  return dbPromise;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getDb();
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
    return await db.runAsync(sql, params);
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
    return await db.getAllAsync<T>(sql, params);
  } catch (error) {
    logger.error("[db] query failed", { sql, params, error });
    throw error;
  }
}

export async function runInTransaction<T>(
  work: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDb();
  let result!: T;
  await db.withTransactionAsync(async () => {
    result = await work(db);
  });
  return result;
}

export async function clearAllData(): Promise<void> {
  try {
    await runExec(CLEAR_ALL_USER_DATA_SQL);
  } catch (error) {
    logger.error("[db] clear all data failed", error);
    throw error;
  }
}

export async function initDb(): Promise<void> {
  if (initialised) return;
  try {
    const db = await getDb();
    // expo-sqlite's overload signatures are wider than our migration surface.
    await runMigrations(db as unknown as import("./migrations/types").MigrationDatabase);
    initialised = true;
    logger.log("[db] initialised");
  } catch (error) {
    logger.error("[db] init failed", error);
    throw error;
  }
}

/** Test helper — reset module init flag between integration tests. */
export function __resetDbStateForTests(): void {
  dbPromise = null;
  initialised = false;
}
