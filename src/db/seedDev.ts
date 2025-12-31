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
    createdAt: now,
    updatedAt: now,
  });

  await createBook({
    id: "seed-2",
    title: "Deep Work",
    author: "Cal Newport",
    totalPages: 304,
    status: "paused",
    currentPage: 0,
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
    createdAt: now,
    updatedAt: now,
  });

  logger.log("[db] dev seed inserted sample books");
}
