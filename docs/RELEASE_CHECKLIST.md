# ReadTrail release checklist

Play Store and App Store readiness. **Do not tick items as done unless verified.** Owner-gated steps stay open until authorised.

Legend: ☐ not done · ☑ done with evidence in repo or CI · ◐ prepared / draft only

---

## 1. Product readiness (functional)

| Item | Status | Notes |
|------|--------|-------|
| Core library CRUD stable | ☑ | Library, edit, delete, tags, collections |
| Progress tracking trustworthy | ☑ | Domain validation + transactional services + tests |
| Stats accurate enough for users | ☑ | Streaks/goals/charts covered by unit tests |
| Export works on iOS and Android | ◐ | JSON/CSV/Markdown implemented; needs device verification |
| Import available | ☑ | JSON + CSV import paths |
| Empty states and error alerts reviewed | ☑ | Present across primary screens |
| No startup crash / DB race | ☑ | DB init awaited before navigation |
| Safe areas correct on notched devices | ☑ | `SafeAreaProvider` in app shell |
| British English copy pass | ☑ | en-GB source strings for product UI |
| Critical audit defects closed | ☑ | See FEATURE_AUDIT / IMPLEMENTATION_PROGRESS |

**Minimum for a public 1.0:** Phases 1–2 complete; export verified on device; no open P0 data defects.

---

## 2. Quality engineering

| Item | Status | Notes |
|------|--------|-------|
| TypeScript strict CI gate | ☑ | `npm run typecheck` in CI |
| Unit tests for domain invariants | ☑ | Jest suite (progress, goals, CSV, tags, …) |
| Integration tests for DB/migrations | ☑ | Node SQLite adapter; migrations + cascade/clear tests |
| Lint script + CI | ☑ | ESLint `--max-warnings 0` |
| E2E smoke (add book, progress, clear) | ◐ | Maestro stubs in `.maestro/`; not run on device here |
| Manual test charter executed on device | ☐ | See TEST_STRATEGY / SCREENSHOT_GUIDE |
| Crash reporting (optional for 1.0) | ☐ | Not configured |
| Performance check on low-end Android | ☐ | Needs physical device |

---

## 3. Privacy, legal, support

| Item | Status | Notes |
|------|--------|-------|
| Privacy policy URL live | ☑ | jsDelivr HTTPS URL wired; optional Pages/custom domain later |
| Support URL / contact email live | ◐ | `support@readtrail.app` — confirm mailbox |
| Data safety / nutrition labels filed | ◐ | Draft answers in DATA_SAFETY.md |
| Licence chosen for repository | ☑ | Proprietary `LICENSE` (all rights reserved) |
| Permissions justified | ☑ | Camera + notifications copy in `app.json` |
| Account deletion story N/A documented | ☑ | Privacy notice + DATA_SAFETY.md |

---

## 4. App identity and store listing

| Item | Status | Notes |
|------|--------|-------|
| Final display name | ☑ | ReadTrail in `app.json` |
| Bundle ID / application ID final | ☑ | `com.iclectic.readtrail` |
| Versioning scheme agreed | ☑ | `1.0.0` / iOS build `1` / Android `versionCode` `1`; EAS `autoIncrement` on production |
| App icon (all required sizes) | ◐ | Assets present; store visual QA pending |
| Adaptive icon Android | ◐ | Asset referenced; visual QA pending |
| Splash screen | ◐ | Present; brand polish pending |
| Screenshots (phone) en-GB | ☐ | Drop zone ready: `store/screenshots/en-GB/` |
| Screenshots (tablet) if claiming tablet support | ☑ N/A | `ios.supportsTablet: false` (phone-first 1.0) |
| Short / long description (en-GB) | ☑ | STORE_LISTING.md |
| Keywords / subtitle | ☑ | STORE_LISTING.md |
| Feature graphic (Play) | ☑ | PNG + SVG in `docs/site/`; `npm run export:feature-graphic` |
| Category chosen | ☑ | Books / Productivity (draft) |
| Content rating questionnaires | ◐ | AGE_RATING.md answers ready to file |
| Rate-app deep links live | ◐ | Wired via `src/config/release.ts`; IDs empty until publish |

---

## 5. Build and distribution

| Item | Status | Notes |
|------|--------|-------|
| EAS project linked | ☐ | Requires owner Expo account |
| Production credentials (iOS) | ☐ | Not authorised here |
| Production keystore (Android) | ☐ | Not authorised here |
| `eas build --profile production` iOS | ☐ | Blocked without credentials |
| `eas build --profile production` Android | ☐ | Blocked without credentials |
| Internal / TestFlight distribution | ☐ | |
| Play closed testing track | ☐ | |
| Production submit config | ◐ | `eas.json` has empty `submit.production` placeholder |

---

## 6. Accessibility and appearance

| Item | Status | Notes |
|------|--------|-------|
| VoiceOver / TalkBack labels on primary flows | ◐ | Labels/roles on primary flows; full device audit pending |
| Contrast checked | ◐ | WCAG AA token tests for body/muted ink; device spot-check pending |
| Dynamic type / large text | ◐ | `maxFontSizeMultiplier` 1.6 on design-system text; device QA pending |
| Dark mode | ☑ | System / light / dark in Settings |
| Orientation locked as intended | ☑ | Portrait in `app.json` |

---

## 7. Security and data

| Item | Status | Notes |
|------|--------|-------|
| No secrets in repo | ☑ | Review again before each release |
| Backup/export documented for users | ☑ | Settings + README + soft 14-day reminder |
| Clear-data confirmation | ☑ | Confirm dialog in Settings |
| Schema migrations safe for upgrades | ☑ | `user_version` migrations |
| Dev seed disabled in production | ☑ | Guarded by `__DEV__` — re-verify release binary |

---

## 8. Platform-specific

### Android (Play Store)

| Item | Status |
|------|--------|
| Target API level meets Play requirement | ☐ (confirm on EAS production build) |
| Edge-to-edge / system bars checked (`edgeToEdgeEnabled: true`) | ◐ |
| Predictive back behaviour acceptable | ◐ (`predictiveBackGestureEnabled: false`) |
| Data safety form | ◐ draft in DATA_SAFETY.md |
| App signing by Google Play enrolled | ☐ |

### iOS (App Store)

| Item | Status |
|------|--------|
| Privacy nutrition labels | ◐ draft in DATA_SAFETY.md |
| Encryption export compliance answered | ☑ | `ITSAppUsesNonExemptEncryption: false` + EXPORT_COMPLIANCE.md |
| Account “Sign in with Apple” N/A explained if no auth | ☑ documented |
| TestFlight external notes | ☐ |
| iPad layout acceptable if tablet supported | ☑ N/A | Phone-only for 1.0 |

---

## 9. Launch day

| Item | Status |
|------|--------|
| Production build installed on physical iPhone | ☐ |
| Production build installed on physical Android | ☐ |
| Support mailbox monitored | ☐ |
| Store listing published / scheduled | ☐ |
| Post-launch crash check (24–48h) | ☐ |
| Hotfix plan understood (EAS Update vs store binary) | ◐ documented in README / this checklist |

---

## 10. Explicit non-claims

The following must not be advertised as shipping features until implemented:

- Cloud sync, accounts, social  
- AI assist  
- DRM / ebook reader engine  

---

## Related documents

- [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md) — preferred owner checklist  
- [STORE_LISTING.md](./STORE_LISTING.md)  
- [STORE_ASSETS.md](./STORE_ASSETS.md)  
- [DATA_SAFETY.md](./DATA_SAFETY.md)  
- [AGE_RATING.md](./AGE_RATING.md)  
- [SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md)  
- [PRIVACY.md](./PRIVACY.md)  
- [CHANGELOG.md](../CHANGELOG.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
