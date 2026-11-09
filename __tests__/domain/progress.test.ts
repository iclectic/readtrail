import {
  averagePagesPerDay,
  clampPage,
  estimatedCompletionDate,
  inferStatusFromProgress,
  pagesReadDelta,
  progressPercent,
  recomputeCurrentPage,
  validateProgressPage,
} from "../../src/domain/progress";
import type { ProgressEntry } from "../../src/domain/types";

describe("progress domain", () => {
  test("clampPage respects total pages", () => {
    expect(clampPage(50, 40)).toBe(40);
    expect(clampPage(-2, 40)).toBe(0);
    expect(clampPage(12.9, 0)).toBe(12);
  });

  test("progressPercent clamps to 0–100", () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(120, 100)).toBe(100);
    expect(progressPercent(10, 0)).toBeNull();
  });

  test("validateProgressPage rejects overflow", () => {
    expect(validateProgressPage(101, 100)).toEqual({
      ok: false,
      error: "Page cannot exceed the total of 100 pages.",
    });
    expect(validateProgressPage(20, 100)).toEqual({ ok: true, page: 20 });
  });

  test("inferStatusFromProgress finishes and reopens books", () => {
    expect(inferStatusFromProgress(100, 100, "reading")).toBe("finished");
    expect(inferStatusFromProgress(50, 100, "finished")).toBe("reading");
    expect(inferStatusFromProgress(1, 100, "want_to_read")).toBe("reading");
  });

  test("recomputeCurrentPage uses newest entry", () => {
    const entries: ProgressEntry[] = [
      {
        id: "1",
        bookId: "b",
        page: 10,
        note: "",
        sessionId: null,
        createdAt: "2026-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        bookId: "b",
        page: 40,
        note: "",
        sessionId: null,
        createdAt: "2026-01-02T10:00:00.000Z",
      },
    ];
    expect(recomputeCurrentPage(entries)).toBe(40);
    expect(recomputeCurrentPage([])).toBe(0);
  });

  test("pagesReadDelta sums positive advances per book", () => {
    const entries: ProgressEntry[] = [
      {
        id: "1",
        bookId: "a",
        page: 10,
        note: "",
        sessionId: null,
        createdAt: "2026-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        bookId: "a",
        page: 25,
        note: "",
        sessionId: null,
        createdAt: "2026-01-02T10:00:00.000Z",
      },
      {
        id: "3",
        bookId: "b",
        page: 5,
        note: "",
        sessionId: null,
        createdAt: "2026-01-02T11:00:00.000Z",
      },
    ];
    expect(pagesReadDelta(entries)).toBe(30);
  });

  test("estimatedCompletionDate and averagePagesPerDay", () => {
    const entries: ProgressEntry[] = [
      {
        id: "1",
        bookId: "a",
        page: 0,
        note: "",
        sessionId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        bookId: "a",
        page: 20,
        note: "",
        sessionId: null,
        createdAt: "2026-01-03T00:00:00.000Z",
      },
    ];
    expect(averagePagesPerDay(entries)).toBeGreaterThan(0);
    const eta = estimatedCompletionDate(
      { currentPage: 20, totalPages: 100 },
      10,
      new Date("2026-01-03T00:00:00.000Z")
    );
    expect(eta?.toISOString().startsWith("2026-01-11")).toBe(true);
  });
});
