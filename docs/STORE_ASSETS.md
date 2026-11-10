# Store assets checklist

Preparation notes for Google Play and Apple App Store. **Do not submit builds or spend on accounts without explicit authorisation.**

## Application identity

| Item | Value |
|------|-------|
| Display name | ReadTrail |
| iOS bundle ID | `com.iclectic.readtrail` |
| Android package | `com.iclectic.readtrail` |
| Version | `1.0.0` (see `app.json`) |

## Icons and splash

Present in `assets/`:

- `icon.png`
- `adaptive-icon.png`
- `splash-icon.png`
- `favicon.png`

Splash / adaptive background colour aligned to paper token `#F7F3EC`.

## Screenshots still required

Capture on real devices or simulators (phone + tablet where required). Follow [SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md).

1. Library with covers and status filters
2. Book details + progress
3. Reading session timer
4. Stats / annual report
5. Discover search
6. Settings / privacy summary

## Listing copy

Full en-GB drafts (short/long description, keywords, what’s new): [STORE_LISTING.md](./STORE_LISTING.md).

## Feature graphic

- SVG: [`docs/site/feature-graphic.svg`](./site/feature-graphic.svg)
- PNG: [`docs/site/feature-graphic.png`](./site/feature-graphic.png) (1024×500)
- Regenerate: `npm run export:feature-graphic`
- Listing text pack: `store/metadata/en-GB/`

## Privacy

- Draft notice: `docs/PRIVACY.md`
- Hostable page: `docs/site/privacy/`
- Public URL (current): `https://cdn.jsdelivr.net/gh/iclectic/readtrail@main/docs/site/privacy/`
- Optional Pages deploy: `.github/workflows/pages.yml` (enable Pages → GitHub Actions)
- Wired in `src/config/release.ts` as `PRIVACY_POLICY_URL`
- Camera permission: ISBN barcode scanning only
- Notifications permission: optional daily reading reminder

## Data safety / age rating

- [DATA_SAFETY.md](./DATA_SAFETY.md)
- [AGE_RATING.md](./AGE_RATING.md)

## Support

- Email: `support@readtrail.app` (confirm mailbox before release)
- Configured in `src/config/release.ts`

## Rate-app deep links

| Platform | Config |
|----------|--------|
| iOS | Set `APP_STORE_ID` once App Store Connect assigns an ID |
| Android | Set `PLAY_STORE_LISTING_LIVE = true` once the listing is public |

Until then, Settings shows a not-yet-published message.

## Remaining blockers for submission

- [ ] Public privacy policy URL (host `docs/site/privacy/`)
- [ ] Screenshot set for both stores
- [ ] Production signing credentials / EAS project linkage
- [ ] Age rating questionnaire filed from [AGE_RATING.md](./AGE_RATING.md)
- [ ] Licence decision for the repository
- [ ] Explicit authorisation to submit and incur store fees
