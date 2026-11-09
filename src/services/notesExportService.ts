import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getAllBooks, getAllNotes } from "../db";
import type { Book, Note } from "../domain/types";

function noteToMarkdown(note: Note, book: Book | undefined): string {
  const title = book?.title ?? "Unknown book";
  const author = book?.author ? ` — ${book.author}` : "";
  const meta = [
    note.kind,
    note.page != null ? `p.${note.page}` : null,
    note.isFavourite ? "favourite" : null,
    note.tags || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return [
    `## ${title}${author}`,
    meta ? `*${meta}*` : "",
    "",
    note.body,
    "",
    `_${new Date(note.updatedAt).toLocaleString("en-GB")}_`,
    "",
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n");
}

export async function buildNotesMarkdown(): Promise<string> {
  const [notes, books] = await Promise.all([getAllNotes(), getAllBooks()]);
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const header = [
    "# ReadTrail notes export",
    "",
    `Exported ${new Date().toLocaleString("en-GB")}`,
    "",
    "These are your own saved notes. ReadTrail does not invent quotations.",
    "",
    "---",
    "",
  ].join("\n");

  if (notes.length === 0) {
    return header + "_No notes yet._\n";
  }

  return header + notes.map((n) => noteToMarkdown(n, bookMap.get(n.bookId))).join("\n---\n\n");
}

export async function exportNotesMarkdown(): Promise<void> {
  const markdown = await buildNotesMarkdown();
  const fileUri = `${FileSystem.cacheDirectory}readtrail-notes-${Date.now()}.md`;
  await FileSystem.writeAsStringAsync(fileUri, markdown, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: "text/markdown",
    dialogTitle: "Export ReadTrail notes",
  });
}
