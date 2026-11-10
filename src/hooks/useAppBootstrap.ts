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

/**
 * @param attempt Increment to retry bootstrap after a failure (e.g. from the error screen).
 */
export function useAppBootstrap(attempt = 0): BootstrapState {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    setState({ status: "loading" });

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
              "ReadTrail could not prepare your local library. Your existing data has not been modified. You can try again.",
          });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [attempt]);

  return state;
}
