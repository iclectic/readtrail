import { PixelRatio } from "react-native";
import { touchTarget } from "../theme/tokens";

/** Ensure interactive targets meet a minimum size for accessibility. */
export function ensureMinTouchSize(size?: number): number {
  return Math.max(touchTarget, size ?? touchTarget);
}

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
