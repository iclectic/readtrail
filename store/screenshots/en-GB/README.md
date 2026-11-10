# Store screenshots (en-GB)

Drop final PNGs here after capturing on a real device or simulator.  
Do not invent mock marketing art — shots must match the shipping UI.

## Required files (phone set)

| File | Screen | Prep |
|------|--------|------|
| `01-library.png` | Library | Demo seed loaded; status chips visible |
| `02-book-details.png` | Book details | Middlemarch (or similar) with tags + progress |
| `03-session.png` | Session | Session history or timer on a reading book |
| `04-stats.png` | Stats / annual | Streak + chart or annual report |
| `05-discover.png` | Discover | Catalogue results or local recommendations |
| `06-privacy.png` | Settings / Privacy | Privacy card or in-app privacy notice |

## Target sizes

| Store | Size (px) | Notes |
|-------|-----------|-------|
| App Store iPhone 6.7" | 1290 × 2796 | Primary phone set |
| App Store iPad 13" | 2064 × 2752 | Only if keeping `ios.supportsTablet: true` |
| Play phone | 1080 × 1920 (or 1080 × 2340) | 16:9–19.5:9 portrait |

Captions: `captions.txt` (one line per shot, matching [STORE_LISTING.md](../../../docs/STORE_LISTING.md)).

## Capture helpers

```bash
# After installing the app on a simulator/device:
npx maestro test .maestro/screenshot-library.yaml
npx maestro test .maestro/screenshot-book-details.yaml
npx maestro test .maestro/screenshot-session.yaml
npx maestro test .maestro/screenshot-stats.yaml
npx maestro test .maestro/screenshot-discover.yaml
npx maestro test .maestro/screenshot-settings.yaml
npx maestro test .maestro/screenshot-privacy.yaml
```

Maestro `takeScreenshot` writes into the Maestro output folder — copy/rename into this directory at the sizes above (or re-capture with the platform screenshot tool).

Validate when files are present:

```bash
npm run check:screenshots
```
