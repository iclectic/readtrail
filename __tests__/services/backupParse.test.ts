import { parseBackupJson, BACKUP_FORMAT_VERSION } from "../../src/services/backupFormat";

describe("backup parse", () => {
  test("parses a minimal valid backup", () => {
    const raw = JSON.stringify({
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: "2026-01-01T00:00:00.000Z",
      appVersion: "1.0.0",
      books: [],
      progressEntries: [],
    });
    const backup = parseBackupJson(raw);
    expect(backup.books).toEqual([]);
    expect(backup.sessions).toEqual([]);
    expect(backup.notes).toEqual([]);
  });

  test("rejects invalid payloads", () => {
    expect(() => parseBackupJson("null")).toThrow(/valid object/);
    expect(() => parseBackupJson("[]")).toThrow(/missing books/);
    expect(() => parseBackupJson(JSON.stringify({ books: [] }))).toThrow(
      /progress entries/
    );
  });
});
