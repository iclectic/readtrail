const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Default soft nudge cadence for local backup reminders. */
export const BACKUP_REMINDER_DAYS = 14;

/**
 * Whether Settings should show a gentle backup reminder.
 * Never backed up → remind once the library is non-empty (caller decides).
 * Last backup older than `thresholdDays` → remind.
 */
export function shouldPromptBackup(
  lastBackupAt: string | null | undefined,
  now: Date = new Date(),
  thresholdDays: number = BACKUP_REMINDER_DAYS
): boolean {
  if (!lastBackupAt) return true;
  const then = Date.parse(lastBackupAt);
  if (!Number.isFinite(then)) return true;
  const ageDays = (now.getTime() - then) / MS_PER_DAY;
  return ageDays >= thresholdDays;
}

export function backupReminderCopy(lastBackupAt: string | null | undefined): string {
  if (!lastBackupAt) {
    return "You have not exported a backup yet. A JSON export keeps your library portable.";
  }
  return "It has been a while since your last backup. Export JSON when you have a moment.";
}
