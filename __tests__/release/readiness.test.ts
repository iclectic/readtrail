import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  APP_STORE_ID,
  PLAY_STORE_LISTING_LIVE,
  PRIVACY_POLICY_URL,
} from "../../src/config/release";

const root = join(__dirname, "../..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("release readiness artefacts", () => {
  it("points privacy at a public HTTPS page; keeps store IDs unset until live", () => {
    expect(PRIVACY_POLICY_URL).toMatch(/^https:\/\/.+/);
    expect(APP_STORE_ID).toBe("");
    expect(PLAY_STORE_LISTING_LIVE).toBe(false);
  });

  it("ships hostable privacy page, launch runbook, and screenshot drop zone", () => {
    expect(existsSync(join(root, "docs/site/privacy/index.html"))).toBe(true);
    expect(existsSync(join(root, "docs/LAUNCH_RUNBOOK.md"))).toBe(true);
    expect(existsSync(join(root, ".github/workflows/pages.yml"))).toBe(true);
    expect(existsSync(join(root, "store/screenshots/en-GB/README.md"))).toBe(true);
    expect(existsSync(join(root, "store/screenshots/en-GB/captions.txt"))).toBe(true);
    expect(existsSync(join(root, "scripts/check-screenshots.mjs"))).toBe(true);
    expect(existsSync(join(root, "docs/SECURITY.md"))).toBe(true);
  });

  it("declares npm overrides for patched Metro tooling packages", () => {
    const pkg = JSON.parse(read("package.json")) as {
      overrides?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    expect(pkg.overrides?.["image-size"]).toMatch(/^\^2\./);
    expect(pkg.overrides?.postcss).toMatch(/^\^8\.5\./);
    expect(pkg.scripts?.["audit:security"]).toContain("npm audit");
  });

  it("ships a 1024×500 Play feature graphic PNG", () => {
    const pngPath = join(root, "docs/site/feature-graphic.png");
    expect(existsSync(pngPath)).toBe(true);
    expect(statSync(pngPath).size).toBeGreaterThan(10_000);

    const buf = readFileSync(pngPath);
    expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(
      true
    );
    // PNG signature (8) + length (4) + "IHDR" (4) → width @16, height @20
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1024);
    expect(height).toBe(500);
  });

  it("provides paste-ready en-GB store metadata", () => {
    const short = read("store/metadata/en-GB/short_description.txt").trim();
    const subtitle = read("store/metadata/en-GB/subtitle.txt").trim();
    expect(short.length).toBeGreaterThan(10);
    expect(short.length).toBeLessThanOrEqual(80);
    expect(subtitle.length).toBeLessThanOrEqual(30);
    expect(read("store/metadata/en-GB/description.txt")).toMatch(/offline/i);
  });

  it("declares iOS encryption export compliance in app.json", () => {
    const app = JSON.parse(read("app.json")) as {
      expo: { ios: { infoPlist: { ITSAppUsesNonExemptEncryption?: boolean } } };
    };
    expect(app.expo.ios.infoPlist.ITSAppUsesNonExemptEncryption).toBe(false);
  });

  it("ships phone-first (no iPad tablet claim for 1.0)", () => {
    const app = JSON.parse(read("app.json")) as {
      expo: { ios: { supportsTablet?: boolean } };
    };
    expect(app.expo.ios.supportsTablet).toBe(false);
  });

  it("ships owner launch preflight script", () => {
    const pkg = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    expect(existsSync(join(root, "scripts/preflight.mjs"))).toBe(true);
    expect(pkg.scripts?.preflight).toContain("scripts/preflight.mjs");
  });
});
