import type { BookMetadataProvider, BookMetadataResult } from "./types";

function normaliseIsbn(isbn: string): string {
  return isbn.replace(/[^0-9Xx]/g, "");
}

function mapDoc(doc: Record<string, unknown>): BookMetadataResult {
  const authors = Array.isArray(doc.author_name)
    ? (doc.author_name as string[])
    : [];
  const coverId = doc.cover_i;
  return {
    title: String(doc.title ?? "Untitled"),
    authors,
    isbn: Array.isArray(doc.isbn) ? String(doc.isbn[0]) : null,
    pageCount: typeof doc.number_of_pages_median === "number"
      ? doc.number_of_pages_median
      : null,
    publisher: Array.isArray(doc.publisher) ? String(doc.publisher[0]) : null,
    publishedYear: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
    description: null,
    coverUrl:
      typeof coverId === "number"
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
    subjects: Array.isArray(doc.subject)
      ? (doc.subject as string[]).slice(0, 8)
      : [],
    source: "openlibrary",
  };
}

/**
 * Open Library metadata provider.
 * Network calls are optional — callers must handle offline failures gracefully.
 */
export const openLibraryProvider: BookMetadataProvider = {
  id: "openlibrary",
  label: "Open Library",

  async searchByTitle(query: string): Promise<BookMetadataResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=12`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open Library search failed (${response.status}).`);
    }
    const data = (await response.json()) as { docs?: Record<string, unknown>[] };
    return (data.docs ?? []).map(mapDoc);
  },

  async lookupIsbn(isbn: string): Promise<BookMetadataResult | null> {
    const clean = normaliseIsbn(isbn);
    if (!clean) return null;

    const url = `https://openlibrary.org/isbn/${clean}.json`;
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Open Library ISBN lookup failed (${response.status}).`);
    }
    const data = (await response.json()) as Record<string, unknown>;
    const title = String(data.title ?? "Untitled");
    const publishers = Array.isArray(data.publishers)
      ? (data.publishers as string[])
      : [];
    const covers = Array.isArray(data.covers) ? (data.covers as number[]) : [];
    const publishDate = typeof data.publish_date === "string" ? data.publish_date : "";
    const yearMatch = publishDate.match(/(\d{4})/);

    return {
      title,
      authors: [],
      isbn: clean,
      pageCount: typeof data.number_of_pages === "number" ? data.number_of_pages : null,
      publisher: publishers[0] ?? null,
      publishedYear: yearMatch ? Number(yearMatch[1]) : null,
      description:
        typeof data.description === "string"
          ? data.description
          : data.description && typeof data.description === "object"
            ? String((data.description as { value?: string }).value ?? "")
            : null,
      coverUrl: covers[0]
        ? `https://covers.openlibrary.org/b/id/${covers[0]}-M.jpg`
        : `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`,
      subjects: [],
      source: "openlibrary",
    };
  },
};
