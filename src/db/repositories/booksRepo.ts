import type { Book } from "../../models/Book";
import { runQuery, runWrite } from "../sqlite";

export type CreateBookInput = Omit<Book, "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateBookInput = Partial<
  Omit<Book, "id" | "createdAt" | "updatedAt">
> & {
  updatedAt?: string;
};

export async function createBook(input: CreateBookInput): Promise<Book> {
  const now = new Date().toISOString();
  const createdAt = input.createdAt ?? now;
  const updatedAt = input.updatedAt ?? now;

  const book: Book = {
    id: input.id,
    title: input.title,
    author: input.author,
    totalPages: input.totalPages,
    status: input.status,
    currentPage: input.currentPage,
    createdAt,
    updatedAt,
  };

  await runWrite(
    `INSERT INTO books (id, title, author, totalPages, status, currentPage, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      book.id,
      book.title,
      book.author,
      book.totalPages,
      book.status,
      book.currentPage,
      book.createdAt,
      book.updatedAt,
    ]
  );

  return book;
}

export async function updateBook(
  id: Book["id"],
  patch: UpdateBookInput
): Promise<Book | null> {
  const existing = await getBookById(id);
  if (!existing) return null;

  const updatedAt = patch.updatedAt ?? new Date().toISOString();
  const next: Book = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt,
  };

  await runWrite(
    `UPDATE books
     SET title = ?, author = ?, totalPages = ?, status = ?, currentPage = ?, updatedAt = ?
     WHERE id = ?;`,
    [
      next.title,
      next.author,
      next.totalPages,
      next.status,
      next.currentPage,
      next.updatedAt,
      next.id,
    ]
  );

  return next;
}

export async function deleteBook(id: Book["id"]): Promise<boolean> {
  const result = await runWrite(`DELETE FROM books WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getAllBooks(): Promise<Book[]> {
  return runQuery<Book>(
    `SELECT id, title, author, totalPages, status, currentPage, createdAt, updatedAt
     FROM books
     ORDER BY updatedAt DESC;`
  );
}

export async function getBookById(id: Book["id"]): Promise<Book | null> {
  const rows = await runQuery<Book>(
    `SELECT id, title, author, totalPages, status, currentPage, createdAt, updatedAt
     FROM books
     WHERE id = ?
     LIMIT 1;`,
    [id]
  );

  return rows[0] ?? null;
}
