import {
  buildAnnualReport,
  buildMonthlySeries,
  formatAnnualReportText,
} from "../../src/domain/charts";
import type { Book, ProgressEntry } from "../../src/domain/types";

function book(partial: Partial<Book> & Pick<Book, "id" | "title">): Book {
  return {
    author: "Author",
    totalPages: 100,
    status: "finished",
    currentPage: 100,
    isbn: null,
    coverUri: null,
    subtitle: null,
    publisher: null,
    publishedYear: null,
    genre: "Fiction",
    format: "physical",
    ownership: "owned",
    rating: 5,
    description: null,
    startedAt: null,
    finishedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

describe("charts and annual report", () => {
  test("buildMonthlySeries returns requested months", () => {
    const entries: ProgressEntry[] = [
      {
        id: "1",
        bookId: "b",
        page: 10,
        note: "",
        sessionId: null,
        createdAt: "2026-01-05T00:00:00.000Z",
      },
      {
        id: "2",
        bookId: "b",
        page: 30,
        note: "",
        sessionId: null,
        createdAt: "2026-01-20T00:00:00.000Z",
      },
    ];
    const series = buildMonthlySeries(
      entries,
      [],
      [],
      3,
      new Date("2026-03-01T00:00:00.000Z")
    );
    expect(series).toHaveLength(3);
    const january = series.find((m) => m.key === "2026-01");
    expect(january?.pages).toBe(30);
  });

  test("annual report text includes year totals", () => {
    const report = buildAnnualReport(
      2026,
      [book({ id: "1", title: "One", author: "Eliot" })],
      [],
      [],
      4
    );
    const text = formatAnnualReportText(report);
    expect(text).toContain("2026");
    expect(text).toContain("Books finished: 1");
    expect(text).toContain("Eliot");
  });
});
