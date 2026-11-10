# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0–9 engineering (through quality gate)

- Foundation → polish → release prep → SQLite quality gate

### Launch enablement (this stage)

- [x] GitHub Pages workflow for `docs/site` privacy hosting
- [x] Rich screenshot/demo seed (books, sessions, notes, tags, goals)
- [x] Dev Settings action to load demo library
- [x] Dynamic Type cap (`maxFontSizeMultiplier`) on design-system text
- [x] `scaleTypography` helper + unit tests
- [x] iOS `ITSAppUsesNonExemptEncryption: false` + export compliance doc
- [x] Accessibility checklist doc

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
| `npm test` | Passed (40 tests) |
| `npm run lint` | Passed |
| Native builds / device E2E | Not executed here |

---

## Next recommended action

1. Merge stacked PRs through launch-enablement.
2. Enable GitHub Pages (Actions source) and set `PRIVACY_POLICY_URL`.
3. Capture screenshots using the demo seed.
4. Authorise EAS production builds when ready.
