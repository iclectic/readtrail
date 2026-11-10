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
3. Privacy URL is already wired (jsDelivr); optional cleaner host later.
4. Capture screenshots into `store/screenshots/en-GB/` and use listing copy from `docs/STORE_LISTING.md` / `store/metadata/en-GB/`.
5. File data safety / age rating answers from the docs drafts.
6. Repository licence is proprietary (`LICENSE`); change only if you want open source.
7. Confirm `npm run preflight` shows engineering OK.

## After store IDs exist

1. Set `APP_STORE_ID` (numeric) in `src/config/release.ts`.
2. Set `PLAY_STORE_LISTING_LIVE = true` when the Play listing is public.
3. Ship a patch build so Rate ReadTrail opens the live store pages.
