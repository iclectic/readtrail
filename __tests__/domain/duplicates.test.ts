import { findDuplicateGroups } from "../../src/domain/duplicates";
import type { Book } from "../../src/domain/types";

function book(partial: Partial<Book> & Pick<Book, "id" | "title">): Book {
  return {
    author: "",
    totalPages: 100,
    status: "want_to_read",
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

describe("duplicates", () => {
  test("groups by ISBN", () => {
    const groups = findDuplicateGroups([
      book({ id: "1", title: "A", isbn: "978-0141036144", author: "X" }),
      book({ id: "2", title: "A (paperback)", isbn: "9780141036144", author: "Y" }),
      book({ id: "3", title: "Other", isbn: "9780000000000", author: "Z" }),
    ]);
    expect(groups.some((g) => g.reason === "isbn" && g.books.length === 2)).toBe(true);
  });

  test("groups by title and author", () => {
    const groups = findDuplicateGroups([
      book({ id: "1", title: "Middlemarch", author: "George Eliot" }),
      book({ id: "2", title: "middlemarch!", author: "George Eliot" }),
      book({ id: "3", title: "Middlemarch", author: "Someone Else" }),
    ]);
    const titleGroup = groups.find((g) => g.reason === "title_author");
    expect(titleGroup?.books.map((b) => b.id).sort()).toEqual(["1", "2"]);
  });
});
