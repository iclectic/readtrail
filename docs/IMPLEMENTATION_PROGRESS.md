# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 engineering

Merged to `main` via PR #10; Pages enablement fix via PR #11.

### Privacy URL (this stage)

- [x] Public privacy page reachable over HTTPS (jsDelivr → `docs/site/privacy/`)
- [x] `PRIVACY_POLICY_URL` set in `src/config/release.ts`
- [x] Readiness / release config tests updated

---

## Current

Owner-gated store launch: screenshots, support mailbox, licence, EAS/store authorisation. Optional: switch privacy URL to GitHub Pages / Cursor host. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device
- [ ] Optional: enable GitHub Pages / Cursor public host for a cleaner privacy URL
- [ ] Store screenshot capture on device
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance / a11y device audit
- [ ] Repository licence decision

---

## Test results

| Check | Result |
|-------|--------|
| `npm run verify` | Passed (52 tests) |

---

## Next recommended action

Capture store screenshots (demo seed), then authorise EAS builds when ready.
