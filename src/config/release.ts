/**
 * Public release endpoints and store identifiers.
 *
 * Leave URL / ID fields empty until they are live. Settings and privacy
 * screens fall back to in-app copy and mailto when values are unset.
 * Do not submit builds or invent live store URLs without authorisation.
 */

export const SUPPORT_EMAIL = "support@readtrail.app";

/** Public privacy policy URL once hosted (e.g. GitHub Pages). */
export const PRIVACY_POLICY_URL = "";

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
