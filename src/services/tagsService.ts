import { createId } from "../domain";
import { parseTagNames } from "../domain/tags";
import type { Tag } from "../domain/types";
import {
  addTagToBook,
  findOrCreateTag,
  getTagsForBook,
  removeTagFromBook,
} from "../db";

export { parseTagNames };

export async function setBookTagsFromNames(
  bookId: string,
  names: string[]
): Promise<Tag[]> {
  const desired = [
    ...new Set(names.map((n) => n.trim()).filter(Boolean).map((n) => n.toLowerCase())),
  ];
  const current = await getTagsForBook(bookId);
  const currentByLower = new Map(current.map((t) => [t.name.toLowerCase(), t]));

  for (const tag of current) {
    if (!desired.includes(tag.name.toLowerCase())) {
      await removeTagFromBook(bookId, tag.id);
    }
  }

  const result: Tag[] = [];
  for (const lower of desired) {
    const existing = currentByLower.get(lower);
    if (existing) {
      result.push(existing);
      continue;
    }
    const original =
      names.find((n) => n.trim().toLowerCase() === lower)?.trim() ?? lower;
    const tag = await findOrCreateTag(original, () => createId("tag"));
    await addTagToBook(bookId, tag.id);
    result.push(tag);
  }
  return result;
}

export async function getBookTagLabel(bookId: string): Promise<string> {
  const tags = await getTagsForBook(bookId);
  return tags.map((t) => t.name).join(", ");
}
