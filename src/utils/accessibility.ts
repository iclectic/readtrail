import { PixelRatio } from "react-native";

export { contrastRatio, relativeLuminance } from "./contrast";
export { ensureMinTouchSize } from "./touchTarget";

/** Soft clamp for font scaling so layouts remain usable on very large text. */
export function cappedFontScale(max = 1.6): number {
  return Math.min(max, PixelRatio.getFontScale());
}

export const a11y = {
  button: "button" as const,
  header: "header" as const,
  summary: "summary" as const,
  adjustIncreases: "adjustable" as const,
};
