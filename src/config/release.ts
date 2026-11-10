/**
 * Public release endpoints and store identifiers.
 *
 * Privacy is hosted from the repo via jsDelivr until GitHub Pages is enabled.
 * Keep App Store / Play listing flags empty until those listings are live.
 * Do not submit builds without explicit authorisation.
 */

export const SUPPORT_EMAIL = "support@readtrail.app";

/**
 * Public privacy policy URL.
 * Serves `docs/site/privacy/` from main via jsDelivr (verified HTTPS).
 * Prefer a GitHub Pages or custom domain URL once Pages is enabled.
 */
export const PRIVACY_POLICY_URL =
  "https://cdn.jsdelivr.net/gh/iclectic/readtrail@main/docs/site/privacy/";

/**
 * Apple App Store numeric app ID (from App Store Connect).
 * Used to open `itms-apps://…/app/id{APP_STORE_ID}`.
 */
export const APP_STORE_ID = "";

/**
 * Google Play package is already `com.iclectic.readtrail`.
 * Set true only after the listing is publicly reachable.
 */
export const PLAY_STORE_LISTING_LIVE = false;

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.iclectic.readtrail";

export function appStoreUrl(appStoreId: string = APP_STORE_ID): string | null {
  const id = appStoreId.trim();
  if (!id) return null;
  return `https://apps.apple.com/app/id${id}`;
}

export function playStoreUrl(): string | null {
  return PLAY_STORE_LISTING_LIVE ? PLAY_STORE_URL : null;
}

export function privacyPolicyUrl(): string | null {
  const url = PRIVACY_POLICY_URL.trim();
  return url.length > 0 ? url : null;
}

export function supportMailto(subject = "ReadTrail Feedback"): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
