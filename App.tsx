import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AppNavigation } from "./src/navigation";
import { initDb } from "./src/db";
import { seedDevData } from "./src/db/seedDev";
import { logger } from "./src/utils/logger";

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initDb();
        await seedDevData();
      } catch (error) {
        logger.error("[db] init failed on startup", error);
      }
    })();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigation/>
    </>
  );
}
