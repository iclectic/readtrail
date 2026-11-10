# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 on `main`

Engineering stack + privacy URL (jsDelivr) + screenshot pack (#13) merged.

### Security audit (this stage)

- [x] Expo-aligned upgrades (`expo` ~54.0.37, `expo-file-system` ~19.0.24)
- [x] Non-breaking `npm audit fix`
- [x] Overrides for `image-size` / `postcss` (cleared remaining highs)
- [x] `npm run audit:security` + [SECURITY.md](./SECURITY.md) residual-risk record

---

## Current

Owner-gated launch items: device screenshots, licence, support mailbox, EAS/store authorisation. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device + drop PNG screenshots
- [ ] Optional: GitHub Pages / Cursor host for cleaner privacy URL
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance / a11y device audit
- [ ] Repository licence decision

---

## Test results

| Check | Result |
|-------|--------|
| `npm run verify` | Passed (typecheck, 53 tests, lint) |
| `npm run check:screenshots` | Passed (no PNGs yet — expected) |
| `npm run audit:security` | Passed (0 critical; 24 low/moderate residual tooling) |

---

## Next recommended action

Capture the six phone screenshots on a device/simulator into `store/screenshots/en-GB/`, choose a repository licence, then authorise EAS when ready.
