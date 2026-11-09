import type { Book, BookStatus, ProgressEntry } from "./types";

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 0) return 0;
  if (totalPages > 0) return Math.min(Math.floor(page), totalPages);
  return Math.floor(page);
}

export function progressPercent(currentPage: number, totalPages: number): number | null {
  if (!totalPages || totalPages <= 0) return null;
  const raw = (currentPage / totalPages) * 100;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function validateProgressPage(
  page: number,
  totalPages: number
): { ok: true; page: number } | { ok: false; error: string } {
  if (!Number.isInteger(page) || page < 0) {
    return { ok: false, error: "Page must be a whole number of zero or more." };
  }
  if (totalPages > 0 && page > totalPages) {
    return {
      ok: false,
      error: `Page cannot exceed the total of ${totalPages} pages.`,
    };
  }
  return { ok: true, page };
}

export function inferStatusFromProgress(
  currentPage: number,
  totalPages: number,
  previousStatus: BookStatus
): BookStatus {
  if (totalPages > 0 && currentPage >= totalPages) {
    return "finished";
  }
  if (previousStatus === "finished" && totalPages > 0 && currentPage < totalPages) {
    return "reading";
  }
  if (previousStatus === "want_to_read" && currentPage > 0) {
    return "reading";
  }
  return previousStatus;
}

/** Recompute denormalised current page from history (latest by createdAt, then page). */
export function recomputeCurrentPage(entries: ProgressEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => {
    const t = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (t !== 0) return t;
    return b.page - a.page;
  });
  return Math.max(0, sorted[0]?.page ?? 0);
}

export function estimatedCompletionDate(
  book: Pick<Book, "currentPage" | "totalPages">,
  pagesPerDay: number,
  from: Date = new Date()
): Date | null {
  if (!book.totalPages || book.totalPages <= 0) return null;
  if (!pagesPerDay || pagesPerDay <= 0) return null;
  const remaining = Math.max(0, book.totalPages - book.currentPage);
  if (remaining === 0) return from;
  const days = Math.ceil(remaining / pagesPerDay);
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  return result;
}

export function averagePagesPerDay(
  entries: ProgressEntry[],
  windowDays = 14
): number {
  if (entries.length < 2) return 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const recent = sorted.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  if (recent.length < 2) {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return 0;
    const days =
      Math.max(
        1,
        (new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) /
          (24 * 60 * 60 * 1000)
      );
    return Math.max(0, (last.page - first.page) / days);
  }
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last) return 0;
  const days = Math.max(
    1,
    (new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  return Math.max(0, (last.page - first.page) / days);
}

export function pagesReadDelta(entries: ProgressEntry[]): number {
  if (entries.length === 0) return 0;
  const byBook = new Map<string, ProgressEntry[]>();
  for (const entry of entries) {
    const list = byBook.get(entry.bookId) ?? [];
    list.push(entry);
    byBook.set(entry.bookId, list);
  }
  let total = 0;
  for (const list of byBook.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let previous = 0;
    for (const entry of sorted) {
      const delta = Math.max(0, entry.page - previous);
      total += delta;
      previous = entry.page;
    }
  }
  return total;
}

export function statusLabel(status: BookStatus): string {
  switch (status) {
    case "want_to_read":
      return "Want to read";
    case "reading":
      return "Currently reading";
    case "paused":
      return "Paused";
    case "finished":
      return "Finished";
    case "did_not_finish":
      return "Did not finish";
    default:
      return status;
  }
}
