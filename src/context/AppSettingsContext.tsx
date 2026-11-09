import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AppSettings } from "../domain/types";
import { updateSettings as persistSettings } from "../db";

type AppSettingsContextValue = {
  settings: AppSettings;
  save: (patch: Partial<Omit<AppSettings, "id">>) => Promise<AppSettings>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({
  initial,
  children,
}: {
  initial: AppSettings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState(initial);

  const save = useCallback(async (patch: Partial<Omit<AppSettings, "id">>) => {
    const next = await persistSettings(patch);
    setSettings(next);
    return next;
  }, []);

  const value = useMemo(() => ({ settings, save }), [settings, save]);

  return (
    <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
}
