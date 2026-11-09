import { useEffect, useState } from "react";
import { initDb, getSettings } from "../db";
import { seedDevData } from "../db/seedDev";
import { syncReminderSchedule } from "../services/reminderService";
import type { AppSettings } from "../domain/types";
import { logger } from "../utils/logger";

type BootstrapState =
  | { status: "loading" }
  | { status: "ready"; settings: AppSettings }
  | { status: "error"; message: string };

export function useAppBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initDb();
        await seedDevData();
        const settings = await getSettings();
        // Re-apply local reminder schedule after relaunch when enabled.
        try {
          await syncReminderSchedule(settings);
        } catch (reminderError) {
          logger.log("[app] reminder sync skipped", reminderError);
        }
        if (mounted) setState({ status: "ready", settings });
      } catch (error) {
        logger.error("[app] bootstrap failed", error);
        if (mounted) {
          setState({
            status: "error",
            message:
              "ReadTrail could not prepare your local library. Please restart the app. Your existing data has not been modified.",
          });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
