import type { Note, NoteKind } from "../../domain/types";
import { mapNote } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export type CreateNoteInput = {
  id: string;
  bookId: string;
  body: string;
  kind?: NoteKind;
  page?: number | null;
  sessionId?: string | null;
  tags?: string;
  isFavourite?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: input.id,
    bookId: input.bookId,
    sessionId: input.sessionId ?? null,
    page: input.page ?? null,
    kind: input.kind ?? "note",
    body: input.body,
    tags: input.tags ?? "",
    isFavourite: input.isFavourite ?? false,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };

  await runWrite(
    `INSERT INTO notes
      (id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      note.id,
      note.bookId,
      note.sessionId,
      note.page,
      note.kind,
      note.body,
      note.tags,
      note.isFavourite ? 1 : 0,
      note.createdAt,
      note.updatedAt,
    ]
  );

  return note;
}

export async function updateNote(
  id: string,
  patch: Partial<Omit<Note, "id" | "bookId" | "createdAt">>
): Promise<Note | null> {
  const existing = await getNoteById(id);
  if (!existing) return null;
  const next: Note = {
    ...existing,
    ...patch,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };
  await runWrite(
    `UPDATE notes SET
      sessionId = ?, page = ?, kind = ?, body = ?, tags = ?, isFavourite = ?, updatedAt = ?
     WHERE id = ?;`,
    [
      next.sessionId,
      next.page,
      next.kind,
      next.body,
      next.tags,
      next.isFavourite ? 1 : 0,
      next.updatedAt,
      next.id,
    ]
  );
  return next;
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await runWrite(`DELETE FROM notes WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const rows = await runQuery<Parameters<typeof mapNote>[0]>(
    `SELECT id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt
     FROM notes WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ? mapNote(rows[0]) : null;
}

export async function getNotesByBookId(bookId: string): Promise<Note[]> {
  const rows = await runQuery<Parameters<typeof mapNote>[0]>(
    `SELECT id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt
     FROM notes WHERE bookId = ? ORDER BY updatedAt DESC;`,
    [bookId]
  );
  return rows.map(mapNote);
}

export async function getAllNotes(): Promise<Note[]> {
  const rows = await runQuery<Parameters<typeof mapNote>[0]>(
    `SELECT id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt
     FROM notes ORDER BY updatedAt DESC;`
  );
  return rows.map(mapNote);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const q = `%${query.trim().toLowerCase()}%`;
  const rows = await runQuery<Parameters<typeof mapNote>[0]>(
    `SELECT id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt
     FROM notes
     WHERE lower(body) LIKE ? OR lower(tags) LIKE ?
     ORDER BY updatedAt DESC;`,
    [q, q]
  );
  return rows.map(mapNote);
}

export async function getFavouriteNotes(): Promise<Note[]> {
  const rows = await runQuery<Parameters<typeof mapNote>[0]>(
    `SELECT id, bookId, sessionId, page, kind, body, tags, isFavourite, createdAt, updatedAt
     FROM notes WHERE isFavourite = 1 ORDER BY updatedAt DESC;`
  );
  return rows.map(mapNote);
}
