import type { Tag } from "../../domain/types";
import { mapTag } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export async function createTag(input: {
  id: string;
  name: string;
  createdAt?: string;
}): Promise<Tag> {
  const tag: Tag = {
    id: input.id,
    name: input.name.trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  await runWrite(`INSERT INTO tags (id, name, createdAt) VALUES (?, ?, ?);`, [
    tag.id,
    tag.name,
    tag.createdAt,
  ]);
  return tag;
}

export async function findOrCreateTag(name: string, idFactory: () => string): Promise<Tag> {
  const trimmed = name.trim();
  const existing = await runQuery<Parameters<typeof mapTag>[0]>(
    `SELECT id, name, createdAt FROM tags WHERE name = ? COLLATE NOCASE LIMIT 1;`,
    [trimmed]
  );
  if (existing[0]) return mapTag(existing[0]);
  return createTag({ id: idFactory(), name: trimmed });
}

export async function deleteTag(id: string): Promise<boolean> {
  const result = await runWrite(`DELETE FROM tags WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getAllTags(): Promise<Tag[]> {
  const rows = await runQuery<Parameters<typeof mapTag>[0]>(
    `SELECT id, name, createdAt FROM tags ORDER BY name COLLATE NOCASE;`
  );
  return rows.map(mapTag);
}

export async function addTagToBook(bookId: string, tagId: string): Promise<void> {
  await runWrite(`INSERT OR IGNORE INTO book_tags (bookId, tagId) VALUES (?, ?);`, [
    bookId,
    tagId,
  ]);
}

export async function removeTagFromBook(bookId: string, tagId: string): Promise<void> {
  await runWrite(`DELETE FROM book_tags WHERE bookId = ? AND tagId = ?;`, [bookId, tagId]);
}

export async function getTagsForBook(bookId: string): Promise<Tag[]> {
  const rows = await runQuery<Parameters<typeof mapTag>[0]>(
    `SELECT t.id, t.name, t.createdAt
     FROM tags t
     INNER JOIN book_tags bt ON bt.tagId = t.id
     WHERE bt.bookId = ?
     ORDER BY t.name COLLATE NOCASE;`,
    [bookId]
  );
  return rows.map(mapTag);
}

export async function getBookIdsByTagId(tagId: string): Promise<string[]> {
  const rows = await runQuery<{ bookId: string }>(
    `SELECT bookId FROM book_tags WHERE tagId = ?;`,
    [tagId]
  );
  return rows.map((r) => r.bookId);
}
