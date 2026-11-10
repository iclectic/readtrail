import { createId } from "./ids";
import { isBookFormat, isBookStatus, isOwnershipType } from "./types";
import type { Book, BookFormat, BookStatus, OwnershipType } from "./types";

const CSV_HEADER = [
  "id",
  "title",
  "author",
  "totalPages",
  "status",
  "currentPage",
  "isbn",
  "genre",
  "format",
  "ownership",
  "rating",
  "publisher",
  "publishedYear",
].join(",");

function escapeCsv(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function bookToRow(book: Book): string {
  return [
    book.id,
    book.title,
    book.author,
    book.totalPages,
    book.status,
    book.currentPage,
    book.isbn,
    book.genre,
    book.format,
    book.ownership,
    book.rating,
    book.publisher,
    book.publishedYear,
  ]
    .map(escapeCsv)
    .join(",");
}

export function booksToCsv(books: Book[]): string {
  return [CSV_HEADER, ...books.map(bookToRow)].join("\n");
}

/** Minimal RFC4180-ish parser for our export shape. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export function csvToBookDrafts(csv: string): Omit<Book, "createdAt" | "updatedAt">[] {
  const rows = parseCsv(csv.trim());
  if (rows.length < 2) return [];
  const header = rows[0]!.map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const drafts: Omit<Book, "createdAt" | "updatedAt">[] = [];
  for (const raw of rows.slice(1)) {
    const get = (name: string) => {
      const i = idx(name);
      return i >= 0 ? (raw[i] ?? "").trim() : "";
    };
    const title = get("title");
    if (!title) continue;
    const statusRaw = get("status") || "want_to_read";
    const formatRaw = get("format") || "physical";
    const ownershipRaw = get("ownership") || "owned";
    const status: BookStatus = isBookStatus(statusRaw) ? statusRaw : "want_to_read";
    const format: BookFormat = isBookFormat(formatRaw) ? formatRaw : "physical";
    const ownership: OwnershipType = isOwnershipType(ownershipRaw)
      ? ownershipRaw
      : "owned";
    const ratingRaw = get("rating");
    drafts.push({
      id: get("id") || createId("book"),
      title,
      author: get("author"),
      totalPages: Number(get("totalPages") || 0) || 0,
      status,
      currentPage: Number(get("currentPage") || 0) || 0,
      isbn: get("isbn") || null,
      coverUri: null,
      subtitle: null,
      publisher: get("publisher") || null,
      publishedYear: get("publishedYear") ? Number(get("publishedYear")) : null,
      genre: get("genre") || null,
      format,
      ownership,
      rating: ratingRaw ? Number(ratingRaw) : null,
      description: null,
      startedAt: null,
      finishedAt: null,
    });
  }
  return drafts;
}
