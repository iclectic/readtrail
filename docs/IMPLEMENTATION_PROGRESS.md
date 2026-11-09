# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0–4 + hardening

- Audit docs, foundation, library/sessions/notes/goals/analytics/discover
- Reminders, ISBN scan, Reading Memory, bulk ops, duplicates, charts, annual report, covers

### Production polish (this stage)

- [x] Book **tags** UI (editor, details chips, library filter)
- [x] **CSV** library export/import + **Markdown notes** export
- [x] In-app **Privacy** screen (Settings stack)
- [x] **Reading calendar** month view
- [x] Annual report **shareable PNG** via view-shot (plus text share)
- [x] Local privacy-conscious **analytics events** (on-device only)
- [x] Accessibility helpers (min touch targets, tab labels, headers)
- [x] `docs/SECURITY.md` dependency audit notes
- [x] `docs/VERIFICATION_REPORT.md`
- [x] Extra unit tests (CSV, tags)

---

## Current

Owner-gated release preparation: privacy URL hosting, screenshots, EAS builds, store submission authorisation.

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device
- [ ] Public privacy policy URL hosting
- [ ] Store screenshot capture
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance benchmarks

---

## Test results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Passed |
| `npm test` | Passed (30 tests) |
| `npm run lint` | Passed |
| Native builds / device E2E | Not executed here |

---

## Next recommended action

1. Review and merge polish PR.
2. Host privacy policy; capture screenshots.
3. Authorise EAS production builds when ready.
