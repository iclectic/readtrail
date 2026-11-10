# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0–9 through launch enablement

- Foundation → polish → release prep → quality gate → launch enablement (Pages workflow, screenshot seed, Dynamic Type, export compliance)

### Pre-launch polish (this stage)

- [x] Migration `004` — `app_settings.lastBackupAt`
- [x] Soft backup reminder in Settings (14-day cadence)
- [x] Record `lastBackupAt` on JSON / CSV / Markdown export
- [x] `AppText` design-system primitive
- [x] FlatList performance props on major lists
- [x] ARCHITECTURE.md refreshed to match the shipped app

---

## Current

Owner-gated store launch: enable GitHub Pages, set `PRIVACY_POLICY_URL`, capture screenshots, confirm support mailbox, choose licence, authorise EAS/store submission.

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device
- [ ] Enable Pages + set `PRIVACY_POLICY_URL`
- [ ] Store screenshot capture (demo seed ready)
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance / a11y device audit
- [ ] Repository licence decision

---

## Test results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Passed |
| `npm test` | Passed (45 tests) |
| `npm run lint` | Passed |
| Native builds / device E2E | Not executed here |

---

## Next recommended action

1. Merge the stacked PRs through pre-launch polish.
2. Enable GitHub Pages and set `PRIVACY_POLICY_URL`.
3. Capture screenshots with the demo seed.
4. Authorise EAS production builds when ready.
