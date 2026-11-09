import { recommendFromLibrary } from "../../src/services/recommendations";
import type { Book } from "../../src/domain/types";

function book(partial: Partial<Book> & Pick<Book, "id" | "title" | "status">): Book {
  return {
    author: "Author",
    totalPages: 100,
    currentPage: 0,
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

describe("recommendations", () => {
  test("prefers want-to-read books matching finished authors", () => {
    const books = [
      book({
        id: "1",
        title: "Finished One",
        status: "finished",
        author: "Diana Wynne Jones",
        genre: "Fantasy",
      }),
      book({
        id: "2",
        title: "Next One",
        status: "want_to_read",
        author: "Diana Wynne Jones",
        genre: "Fantasy",
      }),
      book({
        id: "3",
        title: "Other",
        status: "want_to_read",
        author: "Someone Else",
        genre: "History",
      }),
    ];

    const recs = recommendFromLibrary(books, 2);
    expect(recs[0]?.book.id).toBe("2");
    expect(recs[0]?.reason.toLowerCase()).toContain("diana");
  });
});
