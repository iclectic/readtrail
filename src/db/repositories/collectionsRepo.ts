import type { Collection } from "../../domain/types";
import { mapCollection } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export async function createCollection(input: {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}): Promise<Collection> {
  const now = new Date().toISOString();
  const collection: Collection = {
    id: input.id,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
  await runWrite(
    `INSERT INTO collections (id, name, description, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?);`,
    [
      collection.id,
      collection.name,
      collection.description,
      collection.createdAt,
      collection.updatedAt,
    ]
  );
  return collection;
}

export async function updateCollection(
  id: string,
  patch: { name?: string; description?: string }
): Promise<Collection | null> {
  const existing = await getCollectionById(id);
  if (!existing) return null;
  const next: Collection = {
    ...existing,
    name: patch.name?.trim() ?? existing.name,
    description: patch.description ?? existing.description,
    updatedAt: new Date().toISOString(),
  };
  await runWrite(
    `UPDATE collections SET name = ?, description = ?, updatedAt = ? WHERE id = ?;`,
    [next.name, next.description, next.updatedAt, next.id]
  );
  return next;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const result = await runWrite(`DELETE FROM collections WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const rows = await runQuery<Parameters<typeof mapCollection>[0]>(
    `SELECT id, name, description, createdAt, updatedAt FROM collections WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ? mapCollection(rows[0]) : null;
}

export async function getAllCollections(): Promise<Collection[]> {
  const rows = await runQuery<Parameters<typeof mapCollection>[0]>(
    `SELECT id, name, description, createdAt, updatedAt FROM collections ORDER BY name COLLATE NOCASE;`
  );
  return rows.map(mapCollection);
}

export async function addBookToCollection(
  bookId: string,
  collectionId: string
): Promise<void> {
  await runWrite(
    `INSERT OR IGNORE INTO book_collections (bookId, collectionId) VALUES (?, ?);`,
    [bookId, collectionId]
  );
}

export async function removeBookFromCollection(
  bookId: string,
  collectionId: string
): Promise<void> {
  await runWrite(
    `DELETE FROM book_collections WHERE bookId = ? AND collectionId = ?;`,
    [bookId, collectionId]
  );
}

export async function getCollectionsForBook(bookId: string): Promise<Collection[]> {
  const rows = await runQuery<Parameters<typeof mapCollection>[0]>(
    `SELECT c.id, c.name, c.description, c.createdAt, c.updatedAt
     FROM collections c
     INNER JOIN book_collections bc ON bc.collectionId = c.id
     WHERE bc.bookId = ?
     ORDER BY c.name COLLATE NOCASE;`,
    [bookId]
  );
  return rows.map(mapCollection);
}

export async function getBookIdsInCollection(collectionId: string): Promise<string[]> {
  const rows = await runQuery<{ bookId: string }>(
    `SELECT bookId FROM book_collections WHERE collectionId = ?;`,
    [collectionId]
  );
  return rows.map((r) => r.bookId);
}
