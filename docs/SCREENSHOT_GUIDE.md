# Store screenshot capture guide

Capture on simulators or devices after a production or preview build. Do not invent marketing screenshots from mocks if the UI differs.

## Devices

| Store | Minimum set |
|-------|-------------|
| Apple | 6.7" iPhone (or current required size). iPad not required — `ios.supportsTablet: false` |
| Google Play | Phone (1080+ wide); tablet optional |

## Prep

1. Install a clean **development** or preview build (`eas build --profile preview` or Expo Go).
2. Load demo data (development builds only — never ship seed data in production):
   - Fresh install auto-seeds a rich library when empty (`seedDevData` → `seedScreenshotLibrary`).
   - Or Settings → Developer → **Load screenshot demo library** (appears only in `__DEV__`).
   - If the library already has books, Clear all data first, then load the demo set.
3. Use light theme for the primary set; optional dark-mode alternate set.
4. British English UI strings should already be present.

## Shots to capture (phone)

| # | Screen | Suggested state |
|---|--------|-----------------|
| 1 | Library | Several books with covers; status chips visible |
| 2 | Book details | Progress, tags, open session affordance |
| 3 | Active / recent session | Timer or completed session history |
| 4 | Stats | Streak + chart or annual report |
| 5 | Discover | Search results from Open Library (online) |
| 6 | Settings / Privacy | Privacy card or in-app privacy notice |

## Drop zone

Final PNGs + captions: [`store/screenshots/en-GB/`](../store/screenshots/en-GB/).  
Validate: `npm run check:screenshots`.

## Automation stubs

Maestro flows under `.maestro/` navigate to each store shot once the app is installed with the demo seed:

- `screenshot-library.yaml`
- `screenshot-book-details.yaml`
- `screenshot-session.yaml`
- `screenshot-stats.yaml`
- `screenshot-discover.yaml`
- `screenshot-settings.yaml`
- `screenshot-privacy.yaml`

Maestro does not replace store-quality framed screenshots at the required pixel sizes; re-capture or scale with the platform screenshot tool into `store/screenshots/en-GB/`.

## Framing

- Prefer full-bleed device frames matching each store’s template.
- No promotional stickers over the UI.
- Captions live in listing copy ([STORE_LISTING.md](./STORE_LISTING.md)), not as chrome on the image unless required by a frame kit.
