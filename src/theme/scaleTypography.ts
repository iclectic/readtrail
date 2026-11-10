import { typography } from "./tokens";

type TextStyleToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing?: number;
};

function scaleToken<T extends TextStyleToken>(token: T, scale: number): T {
  return {
    ...token,
    fontSize: Math.round(token.fontSize * scale),
    lineHeight: Math.round(token.lineHeight * scale),
  };
}

/** Scale design-system type styles for Dynamic Type / large content. */
export function scaleTypography(
  scale: number,
  base: typeof typography = typography
): typeof typography {
  const safe = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return {
    display: scaleToken(base.display, safe),
    title: scaleToken(base.title, safe),
    subtitle: scaleToken(base.subtitle, safe),
    body: scaleToken(base.body, safe),
    bodyStrong: scaleToken(base.bodyStrong, safe),
    caption: scaleToken(base.caption, safe),
    label: scaleToken(base.label, safe),
  };
}
