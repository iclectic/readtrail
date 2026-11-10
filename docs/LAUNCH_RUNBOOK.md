# ReadTrail launch runbook (owner)

Single checklist for shipping 1.0 after the engineering stack merges. **Do not submit builds or spend on store accounts without explicit authorisation.**

## 0. Merge status

The offline 1.0 engineering stack is on `main` (through a11y/phone-first #15).  

```bash
npm run preflight
```

Runs verify, screenshot pack check, security audit, and prints engineering OK vs owner-gated blockers. Dependency notes: [SECURITY.md](./SECURITY.md). Phone-first: `ios.supportsTablet` is false — capture phone screenshots only unless you re-enable tablet.

---

## 1. Privacy URL (blocking for stores)

**Current public URL (wired in `src/config/release.ts`):**  
`https://cdn.jsdelivr.net/gh/iclectic/readtrail@main/docs/site/privacy/`  
(serves `docs/site/privacy/` from `main` via jsDelivr)

Optional upgrades:

1. Enable GitHub Pages (**Settings → Pages → Source: GitHub Actions**) and re-run **Deploy privacy site**.  
2. Or confirm the Cursor **readtrail-privacy** publish as **public**.  
3. Replace `PRIVACY_POLICY_URL` with the Pages/custom domain once preferred.  
4. Paste the live URL into App Store Connect and Play Console.

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
2. Follow [SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md) and drop PNGs into [`store/screenshots/en-GB/`](../store/screenshots/en-GB/).  
3. Optional: run `.maestro/screenshot-*.yaml` flows, then re-export at store pixel sizes.  
4. `npm run check:screenshots`  
5. Listing copy: [STORE_LISTING.md](./STORE_LISTING.md) / `store/metadata/en-GB/`.  
6. Feature graphic: upload `docs/site/feature-graphic.png`.

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
