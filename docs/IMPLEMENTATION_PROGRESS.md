# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 on `main`

Engineering stack + privacy URL (jsDelivr) merged.

### Screenshot pack (this stage)

- [x] `store/screenshots/en-GB/` drop zone + captions + size guide
- [x] Maestro screenshot flows for library, details, session, stats, discover, settings, privacy
- [x] `npm run check:screenshots` validator (passes when empty; enforces dims when present)

---

## Current

Owner-gated: capture device screenshots into the drop zone, then licence + EAS/store authorisation. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

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
| `npm run verify` | Passed (typecheck, 52 tests, lint) |
| `npm run check:screenshots` | Passed (no PNGs yet — expected) |

---

## Next recommended action

Capture the six phone screenshots on a device/simulator into `store/screenshots/en-GB/`, then authorise EAS when ready.
