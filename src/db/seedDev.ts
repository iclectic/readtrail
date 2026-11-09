import { createBook, getAllBooks } from "./repositories/booksRepo";
import { logger } from "../utils/logger";

export async function seedDevData(): Promise<void> {
  if (!__DEV__) return;

  const existing = await getAllBooks();
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  await createBook({
    id: "seed-1",
    title: "Atomic Habits",
    author: "James Clear",
    totalPages: 320,
    status: "reading",
    currentPage: 42,
    genre: "Self-help",
    format: "physical",
    ownership: "owned",
    createdAt: now,
    updatedAt: now,
  });

  await createBook({
    id: "seed-2",
    title: "Deep Work",
    author: "Cal Newport",
    totalPages: 304,
    status: "paused",
    currentPage: 18,
    genre: "Productivity",
    format: "ebook",
    ownership: "owned",
    createdAt: now,
    updatedAt: now,
  });

  await createBook({
    id: "seed-3",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    totalPages: 352,
    status: "finished",
    currentPage: 352,
    genre: "Technology",
    format: "physical",
    ownership: "owned",
    finishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await createBook({
    id: "seed-4",
    title: "Project Hail Mary",
    author: "Andy Weir",
    totalPages: 476,
    status: "want_to_read",
    currentPage: 0,
    genre: "Science fiction",
    format: "audiobook",
    ownership: "wishlist",
    createdAt: now,
    updatedAt: now,
  });

  logger.log("[db] dev seed inserted sample books");
}
