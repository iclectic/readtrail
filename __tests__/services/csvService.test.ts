import { booksToCsv, csvToBookDrafts, parseCsv } from "../../src/domain/csv";
import type { Book } from "../../src/domain/types";

function book(partial: Partial<Book> & Pick<Book, "id" | "title">): Book {
  return {
    author: "Eliot",
    totalPages: 800,
    status: "finished",
    currentPage: 800,
    isbn: "9780141439518",
    coverUri: null,
    subtitle: null,
    publisher: null,
    publishedYear: 1871,
    genre: "Fiction",
    format: "physical",
    ownership: "owned",
    rating: 5,
    description: null,
    startedAt: null,
    finishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("csv domain", () => {
  test("round-trips books through CSV", () => {
    const csv = booksToCsv([book({ id: "1", title: "Middlemarch, A Study" })]);
    expect(csv).toContain("title");
    const drafts = csvToBookDrafts(csv);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.title).toBe("Middlemarch, A Study");
    expect(drafts[0]?.author).toBe("Eliot");
    expect(drafts[0]?.isbn).toBe("9780141439518");
  });

  test("parseCsv handles quotes", () => {
    const rows = parseCsv('a,b\n"hello, world",2\n');
    expect(rows[1]?.[0]).toBe("hello, world");
  });
});
