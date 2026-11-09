# ReadTrail release checklist

Play Store and App Store readiness. **Do not tick items as done unless verified.** As of the Phase 0 audit, almost every release item below is **not done**.

Legend: ☐ not done · ☑ done (none claimed here without evidence)

---

## 1. Product readiness (functional)

| Item | Status | Notes |
|------|--------|-------|
| Core library CRUD stable | ☐ | Works on happy path; integrity defects remain |
| Progress tracking trustworthy | ☐ | Non-atomic writes; delete does not recompute page; no page≤totalPages check |
| Stats accurate enough for users | ☐ | Basic counts/streak exist; edge cases untested |
| Export works on iOS and Android | ☐ | Implemented; needs device verification |
| Import available | ☐ | Missing |
| Empty states and error alerts reviewed | ☐ | Present but unpolished |
| No startup crash / DB race | ☐ | `initDb` not awaited before render |
| Safe areas correct on notched devices | ☐ | No `SafeAreaProvider` |
| British English copy pass | ☐ | Required going forward; full pass not done |
| Critical audit defects closed | ☐ | See FEATURE_AUDIT / IMPLEMENTATION_PROGRESS |

**Minimum for a public 1.0:** Phase 1–2 complete; export verified; no P0 data defects.

---

## 2. Quality engineering

| Item | Status | Notes |
|------|--------|-------|
| TypeScript strict CI gate | ☐ | Strict locally; no CI script/`tsc` npm script |
| Unit tests for domain invariants | ☐ | No tests |
| Integration tests for DB/migrations | ☐ | No migrations; no tests |
| Lint script + CI | ☐ | Missing |
| E2E smoke (add book, progress, clear) | ☐ | Missing |
| Manual test charter executed on device | ☐ | See TEST_STRATEGY |
| Crash reporting (optional for 1.0) | ☐ | Not configured |
| Performance check on low-end Android | ☐ | Not done |

---

## 3. Privacy, legal, support

| Item | Status | Notes |
|------|--------|-------|
| Privacy policy URL live | ☐ | App is local-only; store still needs a policy page |
| Support URL / contact email live | ☐ | Settings uses `support@readtrail.app` — unverified |
| Data safety / nutrition labels filed | ☐ | Play Data safety; Apple privacy nutrition |
| Licence chosen for repository | ☐ | README: no licence yet |
| Permissions justified | ☐ | Currently minimal; revisit when adding covers/files/photos |
| Account deletion story N/A documented | ☐ | No accounts — state explicitly in store listings |

---

## 4. App identity and store listing

| Item | Status | Notes |
|------|--------|-------|
| Final display name | ☐ | Expo `name` is `readtrail` (confirm capitalisation: ReadTrail) |
| Bundle ID / application ID final | ☐ | `com.iclectic.readtrail` set in `app.json` |
| Versioning scheme agreed | ☐ | `1.0.0` / iOS build `1` / Android `versionCode` `1` |
| App icon (all required sizes) | ☐ | Placeholder assets present; store quality not verified |
| Adaptive icon Android | ☐ | Asset referenced; visual QA pending |
| Splash screen | ☐ | Present; brand polish pending |
| Screenshots (phone) en-GB | ☐ | Missing |
| Screenshots (tablet) if claiming tablet support | ☐ | `ios.supportsTablet: true` — need tablet shots or drop claim |
| Short / long description (en-GB) | ☐ | Missing |
| Keywords / subtitle | ☐ | Missing |
| Feature graphic (Play) | ☐ | Missing |
| Category chosen | ☐ | e.g. Books / Productivity |
| Content rating questionnaires | ☐ | Not filed |
| Rate-app deep links live | ☐ | Settings shows placeholder alert |

---

## 5. Build and distribution

| Item | Status | Notes |
|------|--------|-------|
| EAS project linked | ☐ | `eas.json` profiles exist; linkage not verified here |
| Production credentials (iOS) | ☐ | Not verified |
| Production keystore (Android) | ☐ | Not verified |
| `eas build --profile production` iOS | ☐ | Not verified |
| `eas build --profile production` Android | ☐ | Not verified |
| Internal / TestFlight distribution | ☐ | Not verified |
| Play closed testing track | ☐ | Not verified |
| Production submit config | ☐ | `eas.json` has empty `submit.production` |

---

## 6. Accessibility and appearance

| Item | Status | Notes |
|------|--------|-------|
| VoiceOver / TalkBack labels on primary flows | ☐ | Missing systematic a11y |
| Contrast checked | ☐ | Light-only UI; not audited |
| Dynamic type / large text | ☐ | Not verified |
| Dark mode | ☐ | Missing (`userInterfaceStyle: "light"`) |
| Orientation locked as intended | ☐ | Portrait in `app.json` |

---

## 7. Security and data

| Item | Status | Notes |
|------|--------|-------|
| No secrets in repo | ☐ | Review before each release |
| Backup/export documented for users | ☐ | Export exists; import missing |
| Clear-data confirmation | ☑-ish | Confirm dialog exists in Settings — still retest on release build |
| Schema migrations safe for upgrades | ☐ | No migration system yet — **blocker** for any schema change post-install |
| Dev seed disabled in production | ☐ | `seedDevData` guarded by `__DEV__` — verify release build |

---

## 8. Platform-specific

### Android (Play Store)

| Item | Status |
|------|--------|
| Target API level meets Play requirement | ☐ |
| Edge-to-edge / system bars checked (`edgeToEdgeEnabled: true`) | ☐ |
| Predictive back behaviour acceptable | ☐ |
| Data safety form | ☐ |
| App signing by Google Play enrolled | ☐ |

### iOS (App Store)

| Item | Status |
|------|--------|
| Privacy nutrition labels | ☐ |
| Encryption export compliance answered | ☐ |
| Account “Sign in with Apple” N/A explained if no auth | ☐ |
| TestFlight external notes | ☐ |
| iPad layout acceptable if tablet supported | ☐ |

---

## 9. Launch day

| Item | Status |
|------|--------|
| Production build installed on physical iPhone | ☐ |
| Production build installed on physical Android | ☐ |
| Support mailbox monitored | ☐ |
| Store listing published / scheduled | ☐ |
| Post-launch crash check (24–48h) | ☐ |
| Hotfix plan understood (EAS Update vs store binary) | ☐ |

---

## 10. Explicit non-claims

The following are **not** ready and must not be advertised as shipping features until implemented:

- Cloud sync, accounts, social  
- ISBN lookup / discovery / AI  
- Collections, tags, covers, sessions, goals, journal  
- Import  
- Dark mode, i18n, full a11y compliance  
- Automated CI/CD release pipeline  

---

## Related documents

- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)  
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) Phase 9  
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
