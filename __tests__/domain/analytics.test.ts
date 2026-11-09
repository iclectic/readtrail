import { computeReadingAnalytics, formatDuration } from "../../src/domain/analytics";
import type { Book, ProgressEntry, ReadingSession } from "../../src/domain/types";

function book(partial: Partial<Book> & Pick<Book, "id" | "title">): Book {
  return {
    author: "Author",
    totalPages: 100,
    status: "reading",
    currentPage: 10,
    isbn: null,
    coverUri: null,
    subtitle: null,
    publisher: null,
    publishedYear: null,
    genre: null,
    format: "physical",
    ownership: "owned",
    rating: null,
    description: null,
    startedAt: null,
    finishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("analytics", () => {
  test("computeReadingAnalytics aggregates library metrics", () => {
    const books = [
      book({ id: "1", title: "A", status: "finished", currentPage: 100, rating: 5, genre: "Fiction" }),
      book({ id: "2", title: "B", status: "reading", currentPage: 20, format: "ebook" }),
    ];
    const entries: ProgressEntry[] = [
      {
        id: "e1",
        bookId: "2",
        page: 10,
        note: "",
        sessionId: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "e2",
        bookId: "2",
        page: 20,
        note: "",
        sessionId: null,
        createdAt: new Date().toISOString(),
      },
    ];
    const sessions: ReadingSession[] = [
      {
        id: "s1",
        bookId: "2",
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        startPage: 10,
        endPage: 20,
        durationSeconds: 1800,
        notes: "",
      },
    ];

    const stats = computeReadingAnalytics(books, entries, sessions);
    expect(stats.totalBooks).toBe(2);
    expect(stats.booksFinished).toBe(1);
    expect(stats.pagesReadFromHistory).toBe(20);
    expect(stats.totalReadingSeconds).toBe(1800);
    expect(stats.averageRating).toBe(5);
    expect(stats.formatDistribution.ebook).toBe(1);
  });

  test("formatDuration", () => {
    expect(formatDuration(65)).toBe("1 min");
    expect(formatDuration(3660)).toBe("1h 1m");
  });
});
