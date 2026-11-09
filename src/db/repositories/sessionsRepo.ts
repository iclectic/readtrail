import type { ReadingSession } from "../../domain/types";
import { mapSession } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export type CreateSessionInput = {
  id: string;
  bookId: string;
  startedAt?: string;
  startPage?: number | null;
  notes?: string;
};

export async function createSession(input: CreateSessionInput): Promise<ReadingSession> {
  const session: ReadingSession = {
    id: input.id,
    bookId: input.bookId,
    startedAt: input.startedAt ?? new Date().toISOString(),
    endedAt: null,
    startPage: input.startPage ?? null,
    endPage: null,
    durationSeconds: null,
    notes: input.notes ?? "",
  };

  await runWrite(
    `INSERT INTO reading_sessions
      (id, bookId, startedAt, endedAt, startPage, endPage, durationSeconds, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      session.id,
      session.bookId,
      session.startedAt,
      session.endedAt,
      session.startPage,
      session.endPage,
      session.durationSeconds,
      session.notes,
    ]
  );

  return session;
}

export async function endSession(
  id: string,
  patch: {
    endedAt?: string;
    endPage?: number | null;
    durationSeconds?: number | null;
    notes?: string;
  }
): Promise<ReadingSession | null> {
  const existing = await getSessionById(id);
  if (!existing) return null;

  const next: ReadingSession = {
    ...existing,
    endedAt: patch.endedAt ?? new Date().toISOString(),
    endPage: patch.endPage ?? existing.endPage,
    durationSeconds: patch.durationSeconds ?? existing.durationSeconds,
    notes: patch.notes ?? existing.notes,
  };

  await runWrite(
    `UPDATE reading_sessions
     SET endedAt = ?, endPage = ?, durationSeconds = ?, notes = ?
     WHERE id = ?;`,
    [next.endedAt, next.endPage, next.durationSeconds, next.notes, next.id]
  );

  return next;
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<ReadingSession, "id" | "bookId">>
): Promise<ReadingSession | null> {
  const existing = await getSessionById(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  await runWrite(
    `UPDATE reading_sessions
     SET startedAt = ?, endedAt = ?, startPage = ?, endPage = ?, durationSeconds = ?, notes = ?
     WHERE id = ?;`,
    [
      next.startedAt,
      next.endedAt,
      next.startPage,
      next.endPage,
      next.durationSeconds,
      next.notes,
      next.id,
    ]
  );
  return next;
}

export async function deleteSession(id: string): Promise<boolean> {
  const result = await runWrite(`DELETE FROM reading_sessions WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getSessionById(id: string): Promise<ReadingSession | null> {
  const rows = await runQuery<Parameters<typeof mapSession>[0]>(
    `SELECT id, bookId, startedAt, endedAt, startPage, endPage, durationSeconds, notes
     FROM reading_sessions WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ? mapSession(rows[0]) : null;
}

export async function getSessionsByBookId(bookId: string): Promise<ReadingSession[]> {
  const rows = await runQuery<Parameters<typeof mapSession>[0]>(
    `SELECT id, bookId, startedAt, endedAt, startPage, endPage, durationSeconds, notes
     FROM reading_sessions WHERE bookId = ? ORDER BY startedAt DESC;`,
    [bookId]
  );
  return rows.map(mapSession);
}

export async function getAllSessions(): Promise<ReadingSession[]> {
  const rows = await runQuery<Parameters<typeof mapSession>[0]>(
    `SELECT id, bookId, startedAt, endedAt, startPage, endPage, durationSeconds, notes
     FROM reading_sessions ORDER BY startedAt DESC;`
  );
  return rows.map(mapSession);
}

export async function getActiveSessionForBook(
  bookId: string
): Promise<ReadingSession | null> {
  const rows = await runQuery<Parameters<typeof mapSession>[0]>(
    `SELECT id, bookId, startedAt, endedAt, startPage, endPage, durationSeconds, notes
     FROM reading_sessions
     WHERE bookId = ? AND endedAt IS NULL
     ORDER BY startedAt DESC
     LIMIT 1;`,
    [bookId]
  );
  return rows[0] ? mapSession(rows[0]) : null;
}
