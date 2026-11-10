import {
  APP_STORE_ID,
  PRIVACY_POLICY_URL,
  PLAY_STORE_LISTING_LIVE,
  appStoreUrl,
  playStoreUrl,
  privacyPolicyUrl,
  supportMailto,
} from "../../src/config/release";

describe("release config", () => {
  it("exposes a public HTTPS privacy policy URL", () => {
    expect(PRIVACY_POLICY_URL).toMatch(/^https:\/\//);
    expect(privacyPolicyUrl()).toBe(PRIVACY_POLICY_URL);
  });

  it("keeps store listing links unset until authorised", () => {
    expect(APP_STORE_ID).toBe("");
    expect(PLAY_STORE_LISTING_LIVE).toBe(false);
    expect(appStoreUrl()).toBeNull();
    expect(playStoreUrl()).toBeNull();
  });

  it("builds App Store and mailto links when values are provided", () => {
    expect(appStoreUrl("1234567890")).toBe("https://apps.apple.com/app/id1234567890");
    expect(supportMailto("Hello")).toBe(
      "mailto:support@readtrail.app?subject=Hello"
    );
  });
});
