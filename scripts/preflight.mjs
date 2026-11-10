#!/usr/bin/env node
/**
 * Owner launch preflight — reports engineering vs owner-gated readiness.
 * Exit 0 when engineering artefacts are present; prints BLOCKED items for the owner.
 * Does not run EAS or store submission.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

function extractExport(source, name) {
  const re = new RegExp(
    `export const ${name}\\s*=\\s*([\\s\\S]*?);\\n`
  );
  const m = source.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const releaseSrc = read("src/config/release.ts");
const app = JSON.parse(read("app.json"));
const shotDir = join(root, "store/screenshots/en-GB");
const requiredShots = [
  "01-library.png",
  "02-book-details.png",
  "03-session.png",
  "04-stats.png",
  "05-discover.png",
  "06-privacy.png",
];
const presentShots = existsSync(shotDir)
  ? requiredShots.filter((n) => existsSync(join(shotDir, n)))
  : [];
const privacyUrl = extractExport(releaseSrc, "PRIVACY_POLICY_URL");
const supportEmail = extractExport(releaseSrc, "SUPPORT_EMAIL");
const appStoreId = extractExport(releaseSrc, "APP_STORE_ID") ?? "";
const playLive = /PLAY_STORE_LISTING_LIVE\s*=\s*true/.test(releaseSrc);
const hasLicence = ["LICENSE", "LICENCE", "LICENSE.md", "LICENCE.md"].some((f) =>
  existsSync(join(root, f))
);
const maestroShots = existsSync(join(root, ".maestro"))
  ? readdirSync(join(root, ".maestro")).filter((f) => f.startsWith("screenshot-"))
  : [];

const engineering = [
  {
    ok: Boolean(privacyUrl && /^https:\/\//.test(privacyUrl)),
    label: "Privacy policy HTTPS URL wired",
    detail: privacyUrl || "(missing)",
  },
  {
    ok: existsSync(join(root, "docs/site/privacy/index.html")),
    label: "Hostable privacy page in repo",
  },
  {
    ok: existsSync(join(root, "docs/site/feature-graphic.png")),
    label: "Play feature graphic PNG",
  },
  {
    ok: existsSync(join(root, "store/metadata/en-GB/description.txt")),
    label: "en-GB store metadata pack",
  },
  {
    ok: existsSync(join(root, "store/screenshots/en-GB/README.md")),
    label: "Screenshot drop zone",
  },
  {
    ok: maestroShots.length >= 6,
    label: `Maestro screenshot flows (${maestroShots.length})`,
  },
  {
    ok: app?.expo?.ios?.supportsTablet === false,
    label: "Phone-first (supportsTablet false)",
  },
  {
    ok: app?.expo?.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false,
    label: "iOS encryption export compliance declared",
  },
  {
    ok: Boolean(supportEmail && supportEmail.includes("@")),
    label: "Support email configured in release.ts",
    detail: supportEmail || "(missing)",
  },
  {
    ok: appStoreId === "" && !playLive,
    label: "Store IDs still unset (expected until publish)",
  },
];

const owner = [
  {
    ok: presentShots.length === requiredShots.length,
    label: "Phone screenshots in store/screenshots/en-GB/",
    detail:
      presentShots.length === 0
        ? "none yet"
        : `${presentShots.length}/${requiredShots.length} present`,
  },
  {
    ok: hasLicence,
    label: "Repository licence file",
    detail: hasLicence ? "present" : "unlicensed — choose and add LICENSE",
  },
  {
    ok: false,
    label: "Confirm support@ mailbox is monitored",
    detail: supportEmail || "support@readtrail.app",
  },
  {
    ok: false,
    label: "EAS project linked + production credentials",
    detail: "Requires Expo/Apple/Google authorisation",
  },
  {
    ok: false,
    label: "Authorise production build + store submit",
    detail: "Do not run eas build/submit without explicit approval",
  },
  {
    ok: false,
    label: "Device VoiceOver / TalkBack smoke",
    detail: "See docs/ACCESSIBILITY.md",
  },
];

function printSection(title, items) {
  console.log(`\n## ${title}`);
  for (const item of items) {
    const mark = item.ok ? "OK  " : "TODO";
    const detail = item.detail ? ` — ${item.detail}` : "";
    console.log(`${mark}  ${item.label}${detail}`);
  }
}

console.log("ReadTrail owner launch preflight");
printSection("Engineering (in repo)", engineering);
printSection("Owner-gated", owner);

const engFailed = engineering.filter((i) => !i.ok);
if (engFailed.length) {
  console.log(
    `\nEngineering gaps: ${engFailed.map((i) => i.label).join("; ")}`
  );
  process.exit(1);
}

const ownerOpen = owner.filter((i) => !i.ok).length;
console.log(
  `\nEngineering track ready. ${ownerOpen} owner item${ownerOpen === 1 ? "" : "s"} still open — see docs/LAUNCH_RUNBOOK.md.`
);
process.exit(0);
