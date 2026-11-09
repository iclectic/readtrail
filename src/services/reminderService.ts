import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { logger } from "../utils/logger";

const DAILY_REMINDER_ID = "readtrail-daily-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getReminderPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined"
> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return "granted";
  }
  if (settings.status === "undetermined") return "undetermined";
  return "denied";
}

export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return Boolean(asked.granted);
}

export async function cancelDailyReadingReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch (error) {
    // Older schedules may not use a stable identifier — cancel all as fallback.
    logger.log("[reminders] cancel by id failed; cancelling all scheduled", error);
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

/**
 * Schedule a repeating daily local reminder at the given local hour/minute.
 * Returns false if permission was not granted.
 */
export async function scheduleDailyReadingReminder(input: {
  hour: number;
  minute: number;
}): Promise<{ scheduled: boolean; reason?: string }> {
  const hour = Math.max(0, Math.min(23, Math.floor(input.hour)));
  const minute = Math.max(0, Math.min(59, Math.floor(input.minute)));

  const granted = await requestReminderPermission();
  if (!granted) {
    return {
      scheduled: false,
      reason:
        "Notification permission was not granted. You can enable reminders later in system Settings.",
    };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reading-reminders", {
      name: "Reading reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      description: "Optional daily prompts to open ReadTrail and continue reading.",
    });
  }

  await cancelDailyReadingReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Time for a few pages?",
      body: "A short reading session keeps your trail warm. Open ReadTrail when you are ready.",
      sound: undefined,
      ...(Platform.OS === "android" ? { channelId: "reading-reminders" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  logger.log("[reminders] daily reminder scheduled", { hour, minute });
  return { scheduled: true };
}

export async function syncReminderSchedule(settings: {
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
}): Promise<{ ok: boolean; message?: string }> {
  if (!settings.dailyReminderEnabled) {
    await cancelDailyReadingReminder();
    return { ok: true };
  }
  const result = await scheduleDailyReadingReminder({
    hour: settings.dailyReminderHour,
    minute: settings.dailyReminderMinute,
  });
  if (!result.scheduled) {
    return { ok: false, message: result.reason };
  }
  return { ok: true };
}
