import type { ProgressEntry } from "../../domain/types";
import { mapProgressEntry } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export type AddProgressEntryInput = {
  id: string;
  bookId: string;
  page: number;
  note: string;
  sessionId?: string | null;
  createdAt?: string;
};

export async function addProgressEntry(
  input: AddProgressEntryInput
): Promise<ProgressEntry> {
  const entry: ProgressEntry = {
    id: input.id,
    bookId: input.bookId,
    page: input.page,
    note: input.note,
    sessionId: input.sessionId ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  await runWrite(
    `INSERT INTO progress_entries (id, bookId, page, note, sessionId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      entry.id,
      entry.bookId,
      entry.page,
      entry.note,
      entry.sessionId,
      entry.createdAt,
    ]
  );

  return entry;
}

export async function getProgressEntriesByBookId(
  bookId: ProgressEntry["bookId"]
): Promise<ProgressEntry[]> {
  const rows = await runQuery<Parameters<typeof mapProgressEntry>[0]>(
    `SELECT id, bookId, page, note, sessionId, createdAt
     FROM progress_entries
     WHERE bookId = ?
     ORDER BY createdAt DESC;`,
    [bookId]
  );
  return rows.map(mapProgressEntry);
}

export async function getAllProgressEntries(): Promise<ProgressEntry[]> {
  const rows = await runQuery<Parameters<typeof mapProgressEntry>[0]>(
    `SELECT id, bookId, page, note, sessionId, createdAt
     FROM progress_entries
     ORDER BY createdAt DESC;`
  );
  return rows.map(mapProgressEntry);
}

export async function deleteProgressEntry(
  id: ProgressEntry["id"]
): Promise<boolean> {
  const result = await runWrite(`DELETE FROM progress_entries WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getLatestProgressPage(bookId: string): Promise<number> {
  const rows = await runQuery<{ page: number }>(
    `SELECT page FROM progress_entries
     WHERE bookId = ?
     ORDER BY createdAt DESC, page DESC
     LIMIT 1;`,
    [bookId]
  );
  return rows[0]?.page ?? 0;
}
