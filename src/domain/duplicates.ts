import type { Book } from "./types";

export type DuplicateGroup = {
  key: string;
  reason: "isbn" | "title_author";
  books: Book[];
};

function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseAuthor(author: string): string {
  return author.toLowerCase().replace(/\s+/g, " ").trim();
}

function normaliseIsbn(isbn: string | null): string | null {
  if (!isbn) return null;
  const clean = isbn.replace(/[^0-9Xx]/g, "").toUpperCase();
  return clean.length >= 10 ? clean : null;
}

/**
 * Find likely duplicate books by shared ISBN or identical normalised title+author.
 */
export function findDuplicateGroups(books: Book[]): DuplicateGroup[] {
  const byIsbn = new Map<string, Book[]>();
  const byTitleAuthor = new Map<string, Book[]>();

  for (const book of books) {
    const isbn = normaliseIsbn(book.isbn);
    if (isbn) {
      const list = byIsbn.get(isbn) ?? [];
      list.push(book);
      byIsbn.set(isbn, list);
    }

    const title = normaliseTitle(book.title);
    const author = normaliseAuthor(book.author);
    if (title) {
      const key = `${title}::${author}`;
      const list = byTitleAuthor.get(key) ?? [];
      list.push(book);
      byTitleAuthor.set(key, list);
    }
  }

  const groups: DuplicateGroup[] = [];
  const seenIds = new Set<string>();

  for (const [isbn, list] of byIsbn) {
    if (list.length < 2) continue;
    groups.push({ key: `isbn:${isbn}`, reason: "isbn", books: list });
    for (const b of list) seenIds.add(b.id);
  }

  for (const [key, list] of byTitleAuthor) {
    if (list.length < 2) continue;
    // Skip groups already fully covered by ISBN matches
    if (list.every((b) => seenIds.has(b.id))) continue;
    groups.push({ key: `ta:${key}`, reason: "title_author", books: list });
  }

  return groups.sort((a, b) => b.books.length - a.books.length);
}

export function duplicateReasonLabel(reason: DuplicateGroup["reason"]): string {
  return reason === "isbn" ? "Matching ISBN" : "Matching title and author";
}
