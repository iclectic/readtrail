#!/usr/bin/env node
/**
 * Renders docs/site/feature-graphic.svg → docs/site/feature-graphic.png (1024×500).
 * Usage: node scripts/export-feature-graphic.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "docs/site/feature-graphic.svg");
const pngPath = join(root, "docs/site/feature-graphic.png");

const svg = readFileSync(svgPath);
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1024 },
});
const png = resvg.render().asPng();
writeFileSync(pngPath, png);
console.log(`Wrote ${pngPath} (${png.length} bytes)`);
