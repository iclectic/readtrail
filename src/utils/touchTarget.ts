import { touchTarget } from "../theme/tokens";

/** Ensure interactive targets meet a minimum size for accessibility. */
export function ensureMinTouchSize(size?: number): number {
  return Math.max(touchTarget, size ?? touchTarget);
}
