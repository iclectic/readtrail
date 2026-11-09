import { createId, inferStatusFromProgress, validateProgressPage } from "../domain";
import type { Book, ReadingSession } from "../domain/types";
import {
  createSession,
  endSession,
  getActiveSessionForBook,
  getBookById,
  getSessionById,
  runInTransaction,
} from "../db";

export async function startReadingSession(
  bookId: string
): Promise<ReadingSession> {
  const book = await getBookById(bookId);
  if (!book) throw new Error("Book not found.");

  const existing = await getActiveSessionForBook(bookId);
  if (existing) return existing;

  return createSession({
    id: createId("session"),
    bookId,
    startPage: book.currentPage,
  });
}

export async function completeReadingSession(input: {
  sessionId: string;
  endPage?: number;
  notes?: string;
}): Promise<{ session: ReadingSession; book: Book | null }> {
  const session = await getSessionById(input.sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.endedAt) {
    return { session, book: await getBookById(session.bookId) };
  }

  const book = await getBookById(session.bookId);
  if (!book) throw new Error("Book not found.");

  const endedAt = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.round(
      (new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    )
  );

  let endPage = input.endPage ?? book.currentPage;
  if (input.endPage != null) {
    const validation = validateProgressPage(input.endPage, book.totalPages);
    if (!validation.ok) throw new Error(validation.error);
    endPage = validation.page;
  }

  const updatedSession = await endSession(session.id, {
    endedAt,
    endPage,
    durationSeconds,
    notes: input.notes?.trim() ?? session.notes,
  });

  if (!updatedSession) throw new Error("Could not end session.");

  // Persist page progress if the session advanced the book.
  if (endPage !== book.currentPage) {
    const now = endedAt;
    const status = inferStatusFromProgress(endPage, book.totalPages, book.status);
    await runInTransaction(async (db) => {
      await db.runAsync(
        `INSERT INTO progress_entries (id, bookId, page, note, sessionId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          createId("progress"),
          book.id,
          endPage,
          input.notes?.trim() ?? "",
          session.id,
          now,
        ]
      );
      await db.runAsync(
        `UPDATE books
         SET currentPage = ?, status = ?, startedAt = COALESCE(startedAt, ?),
             finishedAt = ?, updatedAt = ?
         WHERE id = ?;`,
        [
          endPage,
          status,
          now,
          status === "finished" ? now : null,
          now,
          book.id,
        ]
      );
    });
    const refreshed = await getBookById(book.id);
    return { session: updatedSession, book: refreshed };
  }

  return { session: updatedSession, book };
}

export async function saveManualSession(input: {
  bookId: string;
  startedAt: string;
  endedAt: string;
  startPage?: number;
  endPage?: number;
  notes?: string;
}): Promise<ReadingSession> {
  const book = await getBookById(input.bookId);
  if (!book) throw new Error("Book not found.");

  const start = new Date(input.startedAt).getTime();
  const end = new Date(input.endedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    throw new Error("Session end must be after the start time.");
  }

  const durationSeconds = Math.round((end - start) / 1000);
  const session = await createSession({
    id: createId("session"),
    bookId: input.bookId,
    startedAt: input.startedAt,
    startPage: input.startPage ?? null,
    notes: input.notes ?? "",
  });

  const ended = await endSession(session.id, {
    endedAt: input.endedAt,
    endPage: input.endPage ?? null,
    durationSeconds,
    notes: input.notes ?? "",
  });

  if (!ended) throw new Error("Could not save session.");
  return ended;
}
