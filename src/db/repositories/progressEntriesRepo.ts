import type { ProgressEntry } from "../../models/ProgressEntry";
import { runQuery, runWrite } from "../sqlite";

export type AddProgressEntryInput = Omit<ProgressEntry, "createdAt"> & {
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
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  await runWrite(
    `INSERT INTO progress_entries (id, bookId, page, note, createdAt)
     VALUES (?, ?, ?, ?, ?);`,
    [entry.id, entry.bookId, entry.page, entry.note, entry.createdAt]
  );

  return entry;
}

export async function getProgressEntriesByBookId(
  bookId: ProgressEntry["bookId"]
): Promise<ProgressEntry[]> {
  return runQuery<ProgressEntry>(
    `SELECT id, bookId, page, note, createdAt
     FROM progress_entries
     WHERE bookId = ?
     ORDER BY createdAt DESC;`,
    [bookId]
  );
}

export async function getAllProgressEntries(): Promise<ProgressEntry[]> {
  return runQuery<ProgressEntry>(
    `SELECT id, bookId, page, note, createdAt
     FROM progress_entries
     ORDER BY createdAt DESC;`
  );
}

export async function deleteProgressEntry(
  id: ProgressEntry["id"]
): Promise<boolean> {
  const result = await runWrite(`DELETE FROM progress_entries WHERE id = ?;`, [id]);
  return result.changes > 0;
}
