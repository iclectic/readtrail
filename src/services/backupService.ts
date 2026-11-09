import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  addBookToCollection,
  addTagToBook,
  clearAllData,
  createBook,
  createCollection,
  createGoal,
  createNote,
  createSession,
  createTag,
  endSession,
  getAllAchievements,
  getAllBooks,
  getAllCollections,
  getAllGoals,
  getAllNotes,
  getAllProgressEntries,
  getAllSessions,
  getAllTags,
  getCollectionsForBook,
  getSettings,
  getTagsForBook,
  runInTransaction,
  unlockAchievement,
  updateSettings,
} from "../db";
import { addProgressEntry } from "../db/repositories/progressEntriesRepo";
import { createId } from "../domain";
import {
  BACKUP_FORMAT_VERSION,
  parseBackupJson,
  type ReadTrailBackup,
} from "./backupFormat";

export { BACKUP_FORMAT_VERSION, parseBackupJson };
export type { ReadTrailBackup };

export async function buildBackupPayload(appVersion: string): Promise<ReadTrailBackup> {
  const [
    books,
    progressEntries,
    sessions,
    notes,
    collections,
    tags,
    goals,
    achievements,
    settings,
  ] = await Promise.all([
    getAllBooks(),
    getAllProgressEntries(),
    getAllSessions(),
    getAllNotes(),
    getAllCollections(),
    getAllTags(),
    getAllGoals(),
    getAllAchievements(),
    getSettings(),
  ]);

  const bookCollections: { bookId: string; collectionId: string }[] = [];
  const bookTags: { bookId: string; tagId: string }[] = [];

  for (const book of books) {
    const cols = await getCollectionsForBook(book.id);
    for (const c of cols) bookCollections.push({ bookId: book.id, collectionId: c.id });
    const tgs = await getTagsForBook(book.id);
    for (const t of tgs) bookTags.push({ bookId: book.id, tagId: t.id });
  }

  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion,
    books,
    progressEntries,
    sessions,
    notes,
    collections,
    tags,
    bookCollections,
    bookTags,
    goals,
    achievements,
    settings,
  };
}

export async function exportBackupToShareSheet(appVersion: string): Promise<void> {
  const payload = await buildBackupPayload(appVersion);
  const json = JSON.stringify(payload, null, 2);
  const fileName = `readtrail-export-${Date.now()}.json`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error(
      "Sharing is not available on this device. The export file was written to the app cache."
    );
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Export your ReadTrail data",
  });
}

/**
 * Replace local data with a backup. Destructive — caller must confirm with the user.
 */
export async function importBackup(backup: ReadTrailBackup): Promise<{
  books: number;
  progressEntries: number;
  notes: number;
  sessions: number;
}> {
  await clearAllData();

  for (const book of backup.books) {
    await createBook({
      id: book.id || createId("book"),
      title: book.title,
      author: book.author ?? "",
      totalPages: book.totalPages ?? 0,
      status: book.status ?? "reading",
      currentPage: book.currentPage ?? 0,
      isbn: book.isbn ?? null,
      coverUri: book.coverUri ?? null,
      subtitle: book.subtitle ?? null,
      publisher: book.publisher ?? null,
      publishedYear: book.publishedYear ?? null,
      genre: book.genre ?? null,
      format: book.format ?? "physical",
      ownership: book.ownership ?? "owned",
      rating: book.rating ?? null,
      description: book.description ?? null,
      startedAt: book.startedAt ?? null,
      finishedAt: book.finishedAt ?? null,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    });
  }

  for (const entry of backup.progressEntries) {
    await addProgressEntry({
      id: entry.id || createId("progress"),
      bookId: entry.bookId,
      page: entry.page,
      note: entry.note ?? "",
      sessionId: entry.sessionId ?? null,
      createdAt: entry.createdAt,
    });
  }

  for (const session of backup.sessions) {
    await createSession({
      id: session.id || createId("session"),
      bookId: session.bookId,
      startedAt: session.startedAt,
      startPage: session.startPage,
      notes: session.notes,
    });
    if (session.endedAt) {
      await endSession(session.id, {
        endedAt: session.endedAt,
        endPage: session.endPage,
        durationSeconds: session.durationSeconds,
        notes: session.notes,
      });
    }
  }

  for (const note of backup.notes) {
    await createNote({
      id: note.id || createId("note"),
      bookId: note.bookId,
      body: note.body,
      kind: note.kind,
      page: note.page,
      sessionId: note.sessionId,
      tags: note.tags,
      isFavourite: note.isFavourite,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  }

  for (const collection of backup.collections) {
    await createCollection({
      id: collection.id || createId("collection"),
      name: collection.name,
      description: collection.description,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    });
  }

  for (const tag of backup.tags) {
    await createTag({
      id: tag.id || createId("tag"),
      name: tag.name,
      createdAt: tag.createdAt,
    });
  }

  for (const link of backup.bookCollections) {
    await addBookToCollection(link.bookId, link.collectionId);
  }
  for (const link of backup.bookTags) {
    await addTagToBook(link.bookId, link.tagId);
  }

  for (const goal of backup.goals) {
    await createGoal({
      id: goal.id || createId("goal"),
      type: goal.type,
      targetValue: goal.targetValue,
      periodStart: goal.periodStart,
      periodEnd: goal.periodEnd,
      isActive: goal.isActive,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  }

  for (const achievement of backup.achievements) {
    await unlockAchievement({
      id: achievement.id || createId("achievement"),
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      unlockedAt: achievement.unlockedAt,
    });
  }

  if (backup.settings) {
    await updateSettings(backup.settings);
  }

  await runInTransaction(async () => undefined);

  return {
    books: backup.books.length,
    progressEntries: backup.progressEntries.length,
    notes: backup.notes.length,
    sessions: backup.sessions.length,
  };
}
