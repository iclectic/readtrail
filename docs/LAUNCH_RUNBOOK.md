# ReadTrail launch runbook (owner)

Single checklist for shipping 1.0 after the engineering stack merges. **Do not submit builds or spend on store accounts without explicit authorisation.**

## 0. Merge status

The offline 1.0 engineering stack is on `main` (merged via PR #10). Confirm CI with `npm run verify`.

---

## 1. Privacy URL (blocking for stores)

1. Prefer: merge the Pages enablement PR (workflow uses `enablement: true`), **or** manually set repo **Settings → Pages → Source: GitHub Actions**.  
2. Ensure workflow **Deploy privacy site** succeeds (Actions → Deploy privacy site). Re-run via **workflow_dispatch** if needed.  
3. Confirm live page, typically:  
   `https://iclectic.github.io/readtrail/privacy/`  
4. Set `PRIVACY_POLICY_URL` in `src/config/release.ts` to that URL.  
5. Paste the same URL into App Store Connect and Play Console.  
6. Ship a small patch build so Settings can open the hosted policy.

---

## 2. Support and legal

| Item | Action |
|------|--------|
| Support email | Confirm `support@readtrail.app` mailbox is monitored |
| Licence | Choose and add a repository licence (README still unlicensed) |
| Data safety | File from [DATA_SAFETY.md](./DATA_SAFETY.md) |
| Age rating | File from [AGE_RATING.md](./AGE_RATING.md) |
| Encryption | Already declared via `ITSAppUsesNonExemptEncryption: false` — see [EXPORT_COMPLIANCE.md](./EXPORT_COMPLIANCE.md) |

---

## 3. Screenshots

1. Dev/preview build with empty library (auto seed) **or** Settings → Developer → Load screenshot demo library.  
2. Follow [SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md).  
3. Listing copy: [STORE_LISTING.md](./STORE_LISTING.md).  
4. Feature graphic: upload `docs/site/feature-graphic.png` (or regenerate with `npm run export:feature-graphic`).
5. Paste listing fields from `store/metadata/en-GB/`.

---

## 4. Device QA (before production submit)

```bash
npm run verify
# optional, with app installed:
npx maestro test .maestro/smoke-library.yaml
npx maestro test .maestro/smoke-add-book.yaml
npx maestro test .maestro/smoke-clear-data.yaml
```

Manual charter: [TEST_STRATEGY.md](./TEST_STRATEGY.md) § manual + [ACCESSIBILITY.md](./ACCESSIBILITY.md) device checks.

---

## 5. EAS production (authorisation required)

See [EAS_RELEASE.md](./EAS_RELEASE.md).

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

After listings exist:

1. Set `APP_STORE_ID` in `src/config/release.ts`.  
2. Set `PLAY_STORE_LISTING_LIVE = true`.  
3. Patch-release so **Rate ReadTrail** opens the stores.

Submit only with explicit authorisation:

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

---

## 6. Post-launch

- Monitor support mailbox for 48h.  
- Watch crash-free sessions if/when a reporter is added.  
- Hotfix vs binary: prefer store binary for schema migrations; EAS Update only for JS-only fixes that do not require native/schema changes.

---

## Related docs

- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
- [STORE_ASSETS.md](./STORE_ASSETS.md)  
- [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
