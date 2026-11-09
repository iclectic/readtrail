import { LATEST_SCHEMA_VERSION, runMigrations } from "../../src/db/migrations";
import { createNodeSqlite } from "./helpers/nodeSqlite";

describe("runMigrations", () => {
  it("applies all migrations on an empty database", async () => {
    const db = createNodeSqlite();
    await runMigrations(db);

    const version = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version;"
    );
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);

    const tables = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
    );
    const names = tables.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "books",
        "progress_entries",
        "reading_sessions",
        "notes",
        "tags",
        "book_tags",
        "collections",
        "book_collections",
        "goals",
        "achievements",
        "app_settings",
        "schema_migrations",
      ])
    );

    const applied = await db.getAllAsync<{ version: number }>(
      `SELECT version FROM schema_migrations ORDER BY version;`
    );
    expect(applied.map((row) => row.version)).toEqual([1, 2, 3]);

    db.close();
  });

  it("is idempotent when run twice", async () => {
    const db = createNodeSqlite();
    await runMigrations(db);
    await runMigrations(db);

    const version = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version;"
    );
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);

    const count = await db.getFirstAsync<{ c: number }>(
      `SELECT COUNT(*) AS c FROM schema_migrations;`
    );
    expect(count?.c).toBe(3);
    db.close();
  });

  it("upgrades a legacy books table with user_version 0", async () => {
    const db = createNodeSqlite();
    await db.execAsync(`
      CREATE TABLE books (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        totalPages INTEGER NOT NULL,
        status TEXT NOT NULL,
        currentPage INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE progress_entries (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        page INTEGER NOT NULL,
        note TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    await runMigrations(db);

    const version = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version;"
    );
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);

    const bookCols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(books);`);
    expect(bookCols.map((c) => c.name)).toEqual(
      expect.arrayContaining(["isbn", "coverUri", "format", "ownership"])
    );

    const noteCols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(notes);`);
    expect(noteCols.map((c) => c.name)).toEqual(
      expect.arrayContaining(["intervalDays", "easeFactor", "nextReviewAt"])
    );

    db.close();
  });
});
