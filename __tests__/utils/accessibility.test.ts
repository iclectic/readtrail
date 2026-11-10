import { contrastRatio, relativeLuminance } from "../../src/utils/contrast";
import { ensureMinTouchSize } from "../../src/utils/touchTarget";
import { darkPalette, palette, touchTarget } from "../../src/theme/tokens";

describe("accessibility helpers", () => {
  it("enforces minimum touch targets", () => {
    expect(ensureMinTouchSize()).toBe(touchTarget);
    expect(ensureMinTouchSize(32)).toBe(touchTarget);
    expect(ensureMinTouchSize(60)).toBe(60);
  });

  it("computes known WCAG contrast pairs", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("meets WCAG AA for light body text on paper", () => {
    expect(contrastRatio(palette.ink, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.inkMuted, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.accentInk, palette.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("meets WCAG AA for dark body text on paper", () => {
    expect(contrastRatio(darkPalette.ink, darkPalette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkPalette.inkMuted, darkPalette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkPalette.accentInk, darkPalette.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
