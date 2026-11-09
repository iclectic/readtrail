import {
  createId,
  inferStatusFromProgress,
  recomputeCurrentPage,
  validateProgressPage,
} from "../domain";
import type { Book, ProgressEntry } from "../domain/types";
import {
  addProgressEntry,
  deleteProgressEntry,
  getBookById,
  getProgressEntriesByBookId,
  runInTransaction,
  updateBook,
} from "../db";

export type RecordProgressInput = {
  bookId: string;
  page: number;
  note?: string;
  sessionId?: string | null;
};

export async function recordProgress(
  input: RecordProgressInput
): Promise<{ book: Book; entry: ProgressEntry }> {
  const book = await getBookById(input.bookId);
  if (!book) {
    throw new Error("Book not found.");
  }

  const validation = validateProgressPage(input.page, book.totalPages);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const now = new Date().toISOString();
  const status = inferStatusFromProgress(validation.page, book.totalPages, book.status);
  const startedAt =
    book.startedAt ?? (validation.page > 0 ? now : null);
  const finishedAt =
    status === "finished" ? book.finishedAt ?? now : status === "reading" ? null : book.finishedAt;

  return runInTransaction(async (db) => {
    const entry: ProgressEntry = {
      id: createId("progress"),
      bookId: input.bookId,
      page: validation.page,
      note: input.note?.trim() ?? "",
      sessionId: input.sessionId ?? null,
      createdAt: now,
    };

    await db.runAsync(
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

    await db.runAsync(
      `UPDATE books
       SET currentPage = ?, status = ?, startedAt = ?, finishedAt = ?, updatedAt = ?
       WHERE id = ?;`,
      [validation.page, status, startedAt, finishedAt, now, book.id]
    );

    const updated: Book = {
      ...book,
      currentPage: validation.page,
      status,
      startedAt,
      finishedAt,
      updatedAt: now,
    };

    return { book: updated, entry };
  });
}

export async function removeProgressEntry(
  entryId: string,
  bookId: string
): Promise<Book | null> {
  const book = await getBookById(bookId);
  if (!book) return null;

  await deleteProgressEntry(entryId);
  const remaining = await getProgressEntriesByBookId(bookId);
  const currentPage = recomputeCurrentPage(remaining);
  const status = inferStatusFromProgress(currentPage, book.totalPages, book.status);
  const finishedAt =
    status === "finished"
      ? book.finishedAt ?? new Date().toISOString()
      : status === "reading"
        ? null
        : book.finishedAt;

  return updateBook(bookId, {
    currentPage,
    status,
    finishedAt,
  });
}

// Re-export for screens that still import addProgressEntry path via service
export { addProgressEntry };
