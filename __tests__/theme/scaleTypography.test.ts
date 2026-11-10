import { scaleTypography } from "../../src/theme/scaleTypography";
import { typography } from "../../src/theme/tokens";

describe("scaleTypography", () => {
  it("scales font sizes and line heights", () => {
    const scaled = scaleTypography(1.5);
    expect(scaled.body.fontSize).toBe(Math.round(typography.body.fontSize * 1.5));
    expect(scaled.body.lineHeight).toBe(Math.round(typography.body.lineHeight * 1.5));
    expect(scaled.title.fontWeight).toBe(typography.title.fontWeight);
  });

  it("falls back to 1 for invalid scales", () => {
    expect(scaleTypography(0).body.fontSize).toBe(typography.body.fontSize);
    expect(scaleTypography(Number.NaN).body.fontSize).toBe(typography.body.fontSize);
  });
});
