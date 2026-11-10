import {
  initialMemorySchedule,
  isDueForReview,
  scheduleAfterReview,
  sortMemoryQueue,
  type ReviewQuality,
} from "../domain/memory";
import type { Book, Note } from "../domain/types";
import { getAllBooks, getMemoryNotes, updateNote } from "../db";

export type MemoryCard = {
  note: Note;
  book: Book | null;
  due: boolean;
};

export async function loadMemoryQueue(now: Date = new Date()): Promise<{
  due: MemoryCard[];
  upcoming: MemoryCard[];
}> {
  const [notes, books] = await Promise.all([getMemoryNotes(), getAllBooks()]);
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const sorted = sortMemoryQueue(notes, now);
  const cards = sorted.map((note) => ({
    note,
    book: bookMap.get(note.bookId) ?? null,
    due: isDueForReview(note.nextReviewAt, now),
  }));
  return {
    due: cards.filter((c) => c.due),
    upcoming: cards.filter((c) => !c.due),
  };
}

export async function reviewMemoryNote(
  noteId: string,
  quality: ReviewQuality
): Promise<Note | null> {
  const queue = await getMemoryNotes();
  const note = queue.find((n) => n.id === noteId);
  if (!note) return null;

  const next = scheduleAfterReview(
    {
      intervalDays: note.intervalDays,
      easeFactor: note.easeFactor,
      repetitions: note.repetitions,
    },
    quality
  );

  return updateNote(noteId, {
    intervalDays: next.intervalDays,
    easeFactor: next.easeFactor,
    repetitions: next.repetitions,
    nextReviewAt: next.nextReviewAt,
    lastReviewedAt: next.lastReviewedAt,
    includedInMemory: true,
  });
}

export async function enrolNoteInMemory(noteId: string): Promise<Note | null> {
  const schedule = initialMemorySchedule();
  return updateNote(noteId, {
    includedInMemory: true,
    intervalDays: schedule.intervalDays,
    easeFactor: schedule.easeFactor,
    repetitions: schedule.repetitions,
    nextReviewAt: schedule.nextReviewAt,
    lastReviewedAt: schedule.lastReviewedAt,
  });
}

export async function removeNoteFromMemory(noteId: string): Promise<Note | null> {
  return updateNote(noteId, {
    includedInMemory: false,
    nextReviewAt: null,
  });
}
