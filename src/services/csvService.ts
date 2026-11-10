import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { booksToCsv, csvToBookDrafts } from "../domain/csv";
import { createBook, getAllBooks } from "../db";

export { booksToCsv, csvToBookDrafts, parseCsv } from "../domain/csv";

export async function exportLibraryCsv(): Promise<void> {
  const books = await getAllBooks();
  const csv = booksToCsv(books);
  const fileUri = `${FileSystem.cacheDirectory}readtrail-library-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export ReadTrail library CSV",
  });
}

export async function importLibraryCsv(
  csv: string,
  mode: "merge" | "skip_existing" = "skip_existing"
): Promise<{ imported: number; skipped: number }> {
  const drafts = csvToBookDrafts(csv);
  const existing = await getAllBooks();
  const byId = new Set(existing.map((b) => b.id));
  const byTitleAuthor = new Set(
    existing.map((b) => `${b.title.trim().toLowerCase()}::${b.author.trim().toLowerCase()}`)
  );

  let imported = 0;
  let skipped = 0;
  for (const draft of drafts) {
    const key = `${draft.title.trim().toLowerCase()}::${draft.author.trim().toLowerCase()}`;
    if (mode === "skip_existing" && (byId.has(draft.id) || byTitleAuthor.has(key))) {
      skipped += 1;
      continue;
    }
    await createBook({ ...draft });
    byId.add(draft.id);
    byTitleAuthor.add(key);
    imported += 1;
  }
  return { imported, skipped };
}
