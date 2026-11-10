import type { Book, BookStatus } from "../domain/types";
import {
  addBookToCollection,
  deleteBook,
  getAllBooks,
  runInTransaction,
  updateBook,
} from "../db";

export async function bulkUpdateStatus(
  bookIds: string[],
  status: BookStatus
): Promise<number> {
  let updated = 0;
  const now = new Date().toISOString();
  for (const id of bookIds) {
    const result = await updateBook(id, {
      status,
      finishedAt: status === "finished" ? now : status === "reading" ? null : undefined,
      startedAt: status === "reading" || status === "finished" ? now : undefined,
    });
    if (result) updated += 1;
  }
  return updated;
}

export async function bulkDeleteBooks(bookIds: string[]): Promise<number> {
  let deleted = 0;
  await runInTransaction(async (db) => {
    for (const id of bookIds) {
      const result = await db.runAsync(`DELETE FROM books WHERE id = ?;`, [id]);
      deleted += result.changes;
    }
  });
  return deleted;
}

export async function bulkAddToCollection(
  bookIds: string[],
  collectionId: string
): Promise<void> {
  for (const bookId of bookIds) {
    await addBookToCollection(bookId, collectionId);
  }
}

export async function findBooksByIds(ids: string[]): Promise<Book[]> {
  const all = await getAllBooks();
  const set = new Set(ids);
  return all.filter((b) => set.has(b.id));
}

/** Keep the newest updated book and delete the rest in a duplicate group. */
export async function mergeKeepNewest(books: Book[]): Promise<{ kept: Book; deleted: number }> {
  if (books.length < 2) {
    throw new Error("Need at least two books to merge duplicates.");
  }
  const sorted = [...books].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const kept = sorted[0]!;
  const toDelete = sorted.slice(1);
  for (const book of toDelete) {
    await deleteBook(book.id);
  }
  return { kept, deleted: toDelete.length };
}
