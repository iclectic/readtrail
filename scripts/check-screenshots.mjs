#!/usr/bin/env node
/**
 * Validates store screenshot PNGs when present.
 * Missing files → exit 0 with a reminder (capture is owner-gated).
 * Present files → must be PNG and meet minimum portrait dimensions.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "store/screenshots/en-GB");
const required = [
  "01-library.png",
  "02-book-details.png",
  "03-session.png",
  "04-stats.png",
  "05-discover.png",
  "06-privacy.png",
];

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const MIN_W = 1080;
const MIN_H = 1920;

const present = required.filter((name) => existsSync(join(dir, name)));
const extras = readdirSync(dir).filter(
  (name) => name.endsWith(".png") && !required.includes(name)
);

if (present.length === 0) {
  console.log(
    "No store screenshot PNGs yet under store/screenshots/en-GB/ — capture on device when ready."
  );
  if (extras.length) {
    console.log(`Note: unexpected PNGs present: ${extras.join(", ")}`);
  }
  process.exit(0);
}

let failed = false;
for (const name of present) {
  const buf = readFileSync(join(dir, name));
  if (!buf.subarray(0, 8).equals(PNG_SIG)) {
    console.error(`${name}: not a PNG`);
    failed = true;
    continue;
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (width < MIN_W || height < MIN_H) {
    console.error(
      `${name}: ${width}×${height} is below phone minimum ${MIN_W}×${MIN_H}`
    );
    failed = true;
  } else {
    console.log(`${name}: ok (${width}×${height})`);
  }
}

const missing = required.filter((name) => !present.includes(name));
if (missing.length) {
  console.log(`Still missing: ${missing.join(", ")}`);
}

process.exit(failed ? 1 : 0);
