import { recomputeCurrentPage } from "../../src/domain";
import { CLEAR_ALL_USER_DATA_SQL } from "../../src/db/clearDataSql";
import { runMigrations } from "../../src/db/migrations";
import { createNodeSqlite } from "./helpers/nodeSqlite";

describe("sqlite data integrity", () => {
  it("cascades book delete to progress, notes, tags and sessions", async () => {
    const db = createNodeSqlite();
    await runMigrations(db);

    await db.runAsync(
      `INSERT INTO books (
        id, title, author, totalPages, status, currentPage,
        format, ownership, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        "book-1",
        "Middlemarch",
        "George Eliot",
        800,
        "reading",
        40,
        "physical",
        "owned",
        "2026-01-01T00:00:00.000Z",
        "2026-01-01T00:00:00.000Z",
      ]
    );
    await db.runAsync(
      `INSERT INTO progress_entries (id, bookId, page, note, createdAt)
       VALUES (?, ?, ?, ?, ?);`,
      ["p1", "book-1", 40, "", "2026-01-02T00:00:00.000Z"]
    );
    await db.runAsync(
      `INSERT INTO reading_sessions (id, bookId, startedAt, notes)
       VALUES (?, ?, ?, ?);`,
      ["s1", "book-1", "2026-01-02T00:00:00.000Z", ""]
    );
    await db.runAsync(
      `INSERT INTO notes (id, bookId, kind, body, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        "n1",
        "book-1",
        "note",
        "A reflection",
        "2026-01-02T00:00:00.000Z",
        "2026-01-02T00:00:00.000Z",
      ]
    );
    await db.runAsync(`INSERT INTO tags (id, name, createdAt) VALUES (?, ?, ?);`, [
      "t1",
      "classics",
      "2026-01-01T00:00:00.000Z",
    ]);
    await db.runAsync(`INSERT INTO book_tags (bookId, tagId) VALUES (?, ?);`, [
      "book-1",
      "t1",
    ]);

    await db.runAsync(`DELETE FROM books WHERE id = ?;`, ["book-1"]);

    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM progress_entries;`))
        ?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM reading_sessions;`))
        ?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM notes;`))?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM book_tags;`))?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM tags;`))?.c
    ).toBe(1);

    db.close();
  });

  it("clear-all SQL empties user tables but keeps settings and schema", async () => {
    const db = createNodeSqlite();
    await runMigrations(db);

    await db.runAsync(
      `INSERT INTO books (
        id, title, author, totalPages, status, currentPage,
        format, ownership, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        "book-2",
        "Persuasion",
        "Jane Austen",
        250,
        "reading",
        10,
        "physical",
        "owned",
        "2026-01-01T00:00:00.000Z",
        "2026-01-01T00:00:00.000Z",
      ]
    );
    await db.runAsync(
      `INSERT INTO goals (id, type, targetValue, periodStart, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        "g1",
        "pages_daily",
        20,
        "2026-01-01",
        1,
        "2026-01-01T00:00:00.000Z",
        "2026-01-01T00:00:00.000Z",
      ]
    );

    await db.execAsync(CLEAR_ALL_USER_DATA_SQL);

    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM books;`))?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM goals;`))?.c
    ).toBe(0);
    expect(
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM app_settings;`))
        ?.c
    ).toBe(1);
    expect(
      (await db.getFirstAsync<{ user_version: number }>(`PRAGMA user_version;`))
        ?.user_version
    ).toBe(3);

    db.close();
  });

  it("recomputes current page after deleting the latest progress entry", async () => {
    const remaining = [
      {
        id: "p1",
        bookId: "book-1",
        page: 12,
        note: "",
        sessionId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "p2",
        bookId: "book-1",
        page: 40,
        note: "",
        sessionId: null,
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ];

    const afterDeleteLatest = remaining.filter((e) => e.id !== "p2");
    expect(recomputeCurrentPage(afterDeleteLatest)).toBe(12);
    expect(recomputeCurrentPage([])).toBe(0);
  });
});
