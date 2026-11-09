import type { AppSettings } from "../../domain/types";
import { mapSettings } from "../mappers";
import { runQuery, runWrite } from "../sqlite";

export async function getSettings(): Promise<AppSettings> {
  const rows = await runQuery<Parameters<typeof mapSettings>[0]>(
    `SELECT id, theme, dailyReminderEnabled, dailyReminderHour, dailyReminderMinute,
            streakTrackingEnabled, onboardingCompleted, reduceMotion, updatedAt
     FROM app_settings WHERE id = 1 LIMIT 1;`
  );
  if (rows[0]) return mapSettings(rows[0]);

  const now = new Date().toISOString();
  await runWrite(
    `INSERT OR IGNORE INTO app_settings (
      id, theme, dailyReminderEnabled, dailyReminderHour, dailyReminderMinute,
      streakTrackingEnabled, onboardingCompleted, reduceMotion, updatedAt
    ) VALUES (1, 'system', 0, 20, 0, 1, 0, 0, ?);`,
    [now]
  );
  return {
    id: 1,
    theme: "system",
    dailyReminderEnabled: false,
    dailyReminderHour: 20,
    dailyReminderMinute: 0,
    streakTrackingEnabled: true,
    onboardingCompleted: false,
    reduceMotion: false,
    updatedAt: now,
  };
}

export async function updateSettings(
  patch: Partial<Omit<AppSettings, "id">>
): Promise<AppSettings> {
  const current = await getSettings();
  const next: AppSettings = {
    ...current,
    ...patch,
    id: 1,
    updatedAt: new Date().toISOString(),
  };
  await runWrite(
    `UPDATE app_settings SET
      theme = ?, dailyReminderEnabled = ?, dailyReminderHour = ?, dailyReminderMinute = ?,
      streakTrackingEnabled = ?, onboardingCompleted = ?, reduceMotion = ?, updatedAt = ?
     WHERE id = 1;`,
    [
      next.theme,
      next.dailyReminderEnabled ? 1 : 0,
      next.dailyReminderHour,
      next.dailyReminderMinute,
      next.streakTrackingEnabled ? 1 : 0,
      next.onboardingCompleted ? 1 : 0,
      next.reduceMotion ? 1 : 0,
      next.updatedAt,
    ]
  );
  return next;
}
