# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0 — Discovery and audit

- Architecture, feature audit, roadmap, database design, test strategy, release checklist
- Engineering decisions, privacy draft, store assets checklist

### Phase 1 — Engineering foundation

- Await DB init; SafeAreaProvider; versioned migrations; domain layer; design system; Jest + CI

### Phase 2–4 — Core product

- Expanded library, sessions, notes, collections, goals, analytics, discover, backup/import, onboarding

### Phase next — Hardening (this stage)

- [x] Daily local reminders via `expo-notifications` (permission rationale + Settings toggle/time)
- [x] ISBN camera barcode scanning (`expo-camera`) with graceful manual fallback
- [x] Reading Memory spaced-repetition queue for enrolled notes/quotations
- [x] Bulk library select (status, collection, delete) + duplicate detection/merge UI
- [x] Accessible bar charts + shareable annual reading report
- [x] Cover images via `expo-image` caching
- [x] FlatList virtualisation tuning for larger libraries
- [x] Maestro smoke flow stub (`.maestro/smoke-library.yaml`)
- [x] Migration v3 for memory fields + indexes
- [x] Unit tests for memory, duplicates, charts

---

## Current

Production polish remaining: capture real store screenshots, host privacy policy URL, wire E2E on a simulator in CI where feasible, dependency audit triage, owner-authorised EAS production builds.

---

## Remaining

- [ ] Optional AI features (deferred — consent + cost controls)
- [ ] Cloud sync / social (deferred — moderation + reliability first)
- [ ] Execute Maestro/Detox on simulator in this environment (needs device runtime)
- [ ] Public privacy policy URL hosting
- [ ] Store screenshot capture on devices
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance benchmarks with documented methodology

---

## Test results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Passed |
| `npm test` | Passed (27 tests) |
| `npm run lint` | Passed |
| Native Android/iOS build | Not executed here |
| Maestro on device | Config present; not executed here |

---

## Known issues

1. Catalogue/ISBN lookup and barcode metadata enrichment require network; offline manual entry remains available.
2. Reminder scheduling depends on OS permission; denied permission disables the toggle with an explanation.
3. Annual report share uses text share sheet (not a rendered image graphic yet).
4. npm audit still reports transitive vulnerabilities — triage before store release.

---

## Next recommended action

1. Run quality checks and fix any regressions from this stage.
2. Capture store screenshots from simulator/device.
3. Host `docs/PRIVACY.md` at a public URL.
4. Request authorisation before EAS production builds or store submission.
