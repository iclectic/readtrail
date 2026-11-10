import { seedScreenshotLibrary } from "./seedScreenshot";

/** Dev-only empty-library seed used on first launch in Expo Go / debug builds. */
export async function seedDevData(): Promise<void> {
  if (!__DEV__) return;
  await seedScreenshotLibrary({ onlyIfEmpty: true });
}
