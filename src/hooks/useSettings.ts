import { useCallback, useEffect, useState } from "react";
import { getSettings, updateSettings } from "../db";
import type { AppSettings } from "../domain/types";
import { logger } from "../utils/logger";

export function useSettings(initial?: AppSettings) {
  const [settings, setSettings] = useState<AppSettings | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const next = await getSettings();
      setSettings(next);
      return next;
    } catch (error) {
      logger.error("[settings] load failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initial) {
      void refresh();
    }
  }, [initial, refresh]);

  const save = useCallback(async (patch: Partial<Omit<AppSettings, "id">>) => {
    const next = await updateSettings(patch);
    setSettings(next);
    return next;
  }, []);

  return { settings, loading, refresh, save };
}
