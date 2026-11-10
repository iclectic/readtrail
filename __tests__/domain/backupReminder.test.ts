import {
  BACKUP_REMINDER_DAYS,
  backupReminderCopy,
  shouldPromptBackup,
} from "../../src/domain/backupReminder";

describe("shouldPromptBackup", () => {
  const now = new Date("2026-11-10T12:00:00.000Z");

  it("prompts when never backed up", () => {
    expect(shouldPromptBackup(null, now)).toBe(true);
    expect(shouldPromptBackup(undefined, now)).toBe(true);
  });

  it("prompts when last backup is older than the threshold", () => {
    const old = new Date(now);
    old.setUTCDate(old.getUTCDate() - (BACKUP_REMINDER_DAYS + 1));
    expect(shouldPromptBackup(old.toISOString(), now)).toBe(true);
  });

  it("does not prompt when backup is recent", () => {
    const recent = new Date(now);
    recent.setUTCDate(recent.getUTCDate() - 3);
    expect(shouldPromptBackup(recent.toISOString(), now)).toBe(false);
  });

  it("treats invalid timestamps as needing a backup", () => {
    expect(shouldPromptBackup("not-a-date", now)).toBe(true);
  });
});

describe("backupReminderCopy", () => {
  it("distinguishes never vs stale", () => {
    expect(backupReminderCopy(null)).toMatch(/not exported/i);
    expect(backupReminderCopy("2026-01-01T00:00:00.000Z")).toMatch(/while/i);
  });
});
