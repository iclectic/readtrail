/**
 * Privacy-conscious local product analytics.
 * Events stay on device unless the user exports a backup (not included by default).
 * No network transmission.
 */
import * as FileSystem from "expo-file-system/legacy";
import { logger } from "../utils/logger";

export type AnalyticsEventName =
  | "onboarding_completed"
  | "onboarding_skipped"
  | "first_book_added"
  | "book_added"
  | "first_progress_logged"
  | "progress_logged"
  | "session_completed"
  | "goal_created"
  | "note_created"
  | "export_completed"
  | "import_completed"
  | "reminder_enabled"
  | "barcode_scan_success";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  at: string;
  props?: Record<string, string | number | boolean>;
};

const FILE = "readtrail-analytics-events.jsonl";

function fileUri(): string {
  return `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}${FILE}`;
}

export async function trackEvent(
  name: AnalyticsEventName,
  props?: AnalyticsEvent["props"]
): Promise<void> {
  try {
    const event: AnalyticsEvent = {
      name,
      at: new Date().toISOString(),
      props,
    };
    const line = `${JSON.stringify(event)}\n`;
    const uri = fileUri();
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      const existing = await FileSystem.readAsStringAsync(uri);
      await FileSystem.writeAsStringAsync(uri, existing + line);
    } else {
      await FileSystem.writeAsStringAsync(uri, line);
    }
  } catch (error) {
    logger.log("[analytics] local track failed", error);
  }
}

export async function readRecentEvents(limit = 200): Promise<AnalyticsEvent[]> {
  try {
    const uri = fileUri();
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(uri);
    return raw
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as AnalyticsEvent);
  } catch {
    return [];
  }
}

export async function summariseLocalAdoption(): Promise<Record<string, number>> {
  const events = await readRecentEvents(1000);
  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.name] = (counts[event.name] ?? 0) + 1;
  }
  return counts;
}
