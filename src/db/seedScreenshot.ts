import {
  addProgressEntry,
  addTagToBook,
  createBook,
  createCollection,
  createGoal,
  createNote,
  createSession,
  createTag,
  endSession,
  getAllBooks,
  addBookToCollection,
} from "./index";
import { logger } from "../utils/logger";

function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/**
 * Rich local sample library for store screenshots and Maestro demos.
 * Dev / explicit call only — never runs in production builds unless invoked.
 */
export async function seedScreenshotLibrary(options?: {
  onlyIfEmpty?: boolean;
}): Promise<{ inserted: boolean; bookCount: number }> {
  const onlyIfEmpty = options?.onlyIfEmpty ?? true;
  const existing = await getAllBooks();
  if (onlyIfEmpty && existing.length > 0) {
    return { inserted: false, bookCount: existing.length };
  }

  const tagClassics = await createTag({ id: "seed-tag-classics", name: "classics" });
  const tagFavourites = await createTag({ id: "seed-tag-favourites", name: "favourites" });
  const shelf = await createCollection({
    id: "seed-col-shelf",
    name: "Bedside shelf",
    description: "Books within reach this month",
  });

  await createBook({
    id: "seed-1",
    title: "Middlemarch",
    author: "George Eliot",
    totalPages: 880,
    status: "reading",
    currentPage: 214,
    genre: "Fiction",
    format: "physical",
    ownership: "owned",
    rating: 5,
    startedAt: daysAgo(40),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
  });
  await createBook({
    id: "seed-2",
    title: "A Gentleman in Moscow",
    author: "Amor Towles",
    totalPages: 462,
    status: "reading",
    currentPage: 128,
    genre: "Historical fiction",
    format: "ebook",
    ownership: "owned",
    startedAt: daysAgo(18),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
  });
  await createBook({
    id: "seed-3",
    title: "The Midnight Library",
    author: "Matt Haig",
    totalPages: 304,
    status: "finished",
    currentPage: 304,
    genre: "Fiction",
    format: "physical",
    ownership: "owned",
    rating: 4,
    startedAt: daysAgo(60),
    finishedAt: daysAgo(25),
    createdAt: daysAgo(65),
    updatedAt: daysAgo(25),
  });
  await createBook({
    id: "seed-4",
    title: "Atomic Habits",
    author: "James Clear",
    totalPages: 320,
    status: "paused",
    currentPage: 96,
    genre: "Self-help",
    format: "audiobook",
    ownership: "owned",
    startedAt: daysAgo(90),
    createdAt: daysAgo(95),
    updatedAt: daysAgo(10),
  });
  await createBook({
    id: "seed-5",
    title: "Project Hail Mary",
    author: "Andy Weir",
    totalPages: 476,
    status: "want_to_read",
    currentPage: 0,
    genre: "Science fiction",
    format: "physical",
    ownership: "wishlist",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  });
  await createBook({
    id: "seed-6",
    title: "Orbital",
    author: "Samantha Harvey",
    totalPages: 144,
    status: "finished",
    currentPage: 144,
    genre: "Literary fiction",
    format: "ebook",
    ownership: "owned",
    rating: 5,
    startedAt: daysAgo(14),
    finishedAt: daysAgo(7),
    createdAt: daysAgo(16),
    updatedAt: daysAgo(7),
  });

  await addTagToBook("seed-1", tagClassics.id);
  await addTagToBook("seed-1", tagFavourites.id);
  await addTagToBook("seed-3", tagFavourites.id);
  await addBookToCollection("seed-1", shelf.id);
  await addBookToCollection("seed-2", shelf.id);

  await addProgressEntry({
    id: "seed-p1",
    bookId: "seed-1",
    page: 120,
    note: "Dorothea’s idealism feels painfully familiar.",
    createdAt: daysAgo(20),
  });
  await addProgressEntry({
    id: "seed-p2",
    bookId: "seed-1",
    page: 214,
    note: "The provincial politics chapter is denser than expected.",
    createdAt: daysAgo(1),
  });
  await addProgressEntry({
    id: "seed-p3",
    bookId: "seed-2",
    page: 128,
    note: "",
    createdAt: daysAgo(2),
  });

  const session = await createSession({
    id: "seed-s1",
    bookId: "seed-1",
    startedAt: daysAgo(1),
    startPage: 190,
    notes: "Evening session",
  });
  await endSession(session.id, {
    endedAt: daysAgo(1),
    endPage: 214,
    durationSeconds: 48 * 60,
    notes: "Quiet progress after dinner.",
  });
  const sessionTwo = await createSession({
    id: "seed-s2",
    bookId: "seed-2",
    startedAt: daysAgo(2),
    startPage: 100,
  });
  await endSession(sessionTwo.id, {
    endedAt: daysAgo(2),
    endPage: 128,
    durationSeconds: 35 * 60,
  });

  await createNote({
    id: "seed-n1",
    bookId: "seed-1",
    kind: "quote",
    page: 214,
    body: "“It is a narrow mind which cannot look at a subject from various points of view.”",
    isFavourite: true,
    tags: "classics",
    createdAt: daysAgo(1),
  });
  await createNote({
    id: "seed-n2",
    bookId: "seed-3",
    kind: "reflection",
    body: "Finished feeling oddly hopeful about ordinary lives.",
    isFavourite: true,
    createdAt: daysAgo(25),
  });

  const periodStart = new Date();
  periodStart.setUTCDate(1);
  await createGoal({
    id: "seed-g1",
    type: "yearly_books",
    targetValue: 24,
    periodStart: periodStart.toISOString().slice(0, 10),
  });
  await createGoal({
    id: "seed-g2",
    type: "daily_pages",
    targetValue: 20,
    periodStart: new Date().toISOString().slice(0, 10),
  });

  logger.log("[db] screenshot seed inserted demo library");
  return { inserted: true, bookCount: 6 };
}
