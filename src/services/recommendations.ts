import type { Book } from "../domain/types";

export type Recommendation = {
  book: Book;
  reason: string;
  score: number;
};

/**
 * Deterministic, on-device recommendations from the user's own library metadata.
 * Prefers unread books that share authors or genres with finished/favourable books.
 */
export function recommendFromLibrary(books: Book[], limit = 8): Recommendation[] {
  const finished = books.filter((b) => b.status === "finished");
  const candidates = books.filter(
    (b) => b.status === "want_to_read" || b.status === "paused"
  );

  if (candidates.length === 0) {
    return books
      .filter((b) => b.status === "want_to_read" || b.status === "reading")
      .slice(0, limit)
      .map((book) => ({
        book,
        reason: "From your library",
        score: 1,
      }));
  }

  const preferredAuthors = new Set(
    finished.map((b) => b.author.trim().toLowerCase()).filter(Boolean)
  );
  const preferredGenres = new Set(
    finished.map((b) => (b.genre ?? "").trim().toLowerCase()).filter(Boolean)
  );

  const scored = candidates.map((book) => {
    let score = 0;
    const reasons: string[] = [];
    const author = book.author.trim().toLowerCase();
    const genre = (book.genre ?? "").trim().toLowerCase();

    if (author && preferredAuthors.has(author)) {
      score += 5;
      reasons.push(`You have finished other books by ${book.author}`);
    }
    if (genre && preferredGenres.has(genre)) {
      score += 3;
      reasons.push(`Matches genres you enjoy (${book.genre})`);
    }
    if (book.status === "want_to_read") {
      score += 1;
      reasons.push("On your want-to-read list");
    }
    if (book.status === "paused") {
      score += 2;
      reasons.push("A paused book you may wish to resume");
    }

    return {
      book,
      score,
      reason: reasons[0] ?? "Suggested from your library",
    };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title))
    .slice(0, limit);
}
