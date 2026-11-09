# EAS release notes (owner-gated)

`eas.json` already defines `development`, `preview` and `production` profiles. Production uses `autoIncrement` for native build numbers.

## Do not run without authorisation

These commands create billable builds and may require Apple/Google credentials:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## Before the first production build

1. `eas init` / link the Expo project (owner account).
2. Confirm bundle identifiers match `app.json` (`com.iclectic.readtrail`).
3. Host privacy policy; set `PRIVACY_POLICY_URL` in `src/config/release.ts`.
4. Capture screenshots and prepare listing copy from `docs/STORE_LISTING.md`.
5. File data safety / age rating answers from the docs drafts.
6. Decide repository licence (still unlicensed in README).

## After store IDs exist

1. Set `APP_STORE_ID` (numeric) in `src/config/release.ts`.
2. Set `PLAY_STORE_LISTING_LIVE = true` when the Play listing is public.
3. Ship a patch build so Rate ReadTrail opens the live store pages.
