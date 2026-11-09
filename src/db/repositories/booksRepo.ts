import type { Book, BookFormat, BookStatus, OwnershipType } from "../../domain/types";
import { BOOK_COLUMNS, mapBook } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export type CreateBookInput = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  status: BookStatus;
  currentPage: number;
  isbn?: string | null;
  coverUri?: string | null;
  subtitle?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  genre?: string | null;
  format?: BookFormat;
  ownership?: OwnershipType;
  rating?: number | null;
  description?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
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
  const book: Book = {
    id: input.id,
    title: input.title,
    author: input.author,
    totalPages: input.totalPages,
    status: input.status,
    currentPage: input.currentPage,
    isbn: input.isbn ?? null,
    coverUri: input.coverUri ?? null,
    subtitle: input.subtitle ?? null,
    publisher: input.publisher ?? null,
    publishedYear: input.publishedYear ?? null,
    genre: input.genre ?? null,
    format: input.format ?? "physical",
    ownership: input.ownership ?? "owned",
    rating: input.rating ?? null,
    description: input.description ?? null,
    startedAt: input.startedAt ?? null,
    finishedAt: input.finishedAt ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };

  await runWrite(
    `INSERT INTO books (
      id, title, author, totalPages, status, currentPage,
      isbn, coverUri, subtitle, publisher, publishedYear, genre,
      format, ownership, rating, description, startedAt, finishedAt,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      book.id,
      book.title,
      book.author,
      book.totalPages,
      book.status,
      book.currentPage,
      book.isbn,
      book.coverUri,
      book.subtitle,
      book.publisher,
      book.publishedYear,
      book.genre,
      book.format,
      book.ownership,
      book.rating,
      book.description,
      book.startedAt,
      book.finishedAt,
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
    `UPDATE books SET
      title = ?, author = ?, totalPages = ?, status = ?, currentPage = ?,
      isbn = ?, coverUri = ?, subtitle = ?, publisher = ?, publishedYear = ?,
      genre = ?, format = ?, ownership = ?, rating = ?, description = ?,
      startedAt = ?, finishedAt = ?, updatedAt = ?
     WHERE id = ?;`,
    [
      next.title,
      next.author,
      next.totalPages,
      next.status,
      next.currentPage,
      next.isbn,
      next.coverUri,
      next.subtitle,
      next.publisher,
      next.publishedYear,
      next.genre,
      next.format,
      next.ownership,
      next.rating,
      next.description,
      next.startedAt,
      next.finishedAt,
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
  const rows = await runQuery<Parameters<typeof mapBook>[0]>(
    `SELECT ${BOOK_COLUMNS} FROM books ORDER BY updatedAt DESC;`
  );
  return rows.map(mapBook);
}

export async function getBookById(id: Book["id"]): Promise<Book | null> {
  const rows = await runQuery<Parameters<typeof mapBook>[0]>(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ? mapBook(rows[0]) : null;
}

export async function searchBooks(query: string): Promise<Book[]> {
  const q = `%${query.trim().toLowerCase()}%`;
  const rows = await runQuery<Parameters<typeof mapBook>[0]>(
    `SELECT ${BOOK_COLUMNS} FROM books
     WHERE lower(title) LIKE ? OR lower(author) LIKE ? OR lower(IFNULL(isbn,'')) LIKE ?
        OR lower(IFNULL(genre,'')) LIKE ?
     ORDER BY updatedAt DESC;`,
    [q, q, q, q]
  );
  return rows.map(mapBook);
}
