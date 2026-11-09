# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0 — Discovery and audit

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
- [ENGINEERING_DECISIONS.md](./ENGINEERING_DECISIONS.md)

### Phase 1 — Engineering foundation

- Await `initDb` / migrations before rendering UI (`useAppBootstrap`, loading and error states)
- `SafeAreaProvider` at app root
- Versioned migrations (`PRAGMA user_version`) with legacy DB detection
- Expanded schema (books metadata, sessions, notes, collections, tags, goals, achievements, settings)
- Domain layer: progress, streaks, goals, analytics (pure, tested)
- Application services: progress (transactional), sessions, backup/import, metadata providers, recommendations, achievements
- Design system tokens + ThemeProvider (light/dark/system) + reusable UI primitives
- British English copy module (`src/i18n/en-GB.ts`)
- Jest unit tests + `npm run typecheck` + GitHub Actions CI workflow
- npm scripts: `typecheck`, `test`, `lint`

### Phase 2 — Core reading experience (substantial progress)

- Library statuses: Want to read, Reading, Paused, Finished, Did not finish
- Manual add/edit with format, ownership, genre, ISBN, rating, description
- Catalogue search + ISBN lookup via Open Library (graceful offline failure)
- Transactional progress updates with page validation and status inference
- Progress delete recomputes `currentPage`
- Timed reading sessions (start/end with duration + page)
- Notes journal (note / quote / reflection, favourites, tags, page refs)
- Collections CRUD
- Onboarding screen (~one-minute path to first book)

### Phase 3 — Advanced features (substantial progress)

- Goals (daily/weekly/monthly/yearly pages, minutes, books) with progress bars
- Analytics dashboard with correct page-delta and session-time metrics
- Achievements evaluation
- Export/import full JSON backup (format version 2)
- Settings: theme, streak toggle, reminder preference flag, reduce motion, privacy copy

### Phase 4 — Discovery (initial)

- Deterministic on-device recommendations from personal library
- Discover tab: title search + ISBN lookup → prefill Add Book

---

## Current

Hardening and polish: lint clean-up, remaining accessibility pass, camera ISBN scanning, richer charts, reading memory spaced repetition, store assets.

---

## Remaining

### Still open / partial

- [ ] Native barcode/ISBN camera scanning (metadata ISBN lookup exists)
- [ ] Bulk library operations and duplicate detection UI
- [ ] Virtualised performance pass on very large libraries (FlatList present; needs profiling on device)
- [ ] Accessible chart components / annual shareable reading report graphics
- [ ] Reading Memory spaced-repetition surfaces
- [ ] Optional AI features (explicitly deferred — requires consent + cost controls)
- [ ] Cloud sync / social (deferred until core reliability + moderation readiness)
- [ ] Scheduled local notifications for reminders (preference stored; OS scheduling not wired)
- [ ] Detox/Maestro E2E suite on simulators/devices
- [ ] Store screenshots, privacy policy URL hosting, production signing (needs owner credentials)
- [ ] Real-device performance benchmarks

---

## Test results

Executed in this environment:

| Check | Result |
|-------|--------|
| `npm run typecheck` | Passed |
| `npm test` | Passed (19 tests) |
| `npm run lint` | See latest CI / local run notes |
| Native Android/iOS build | Not executed in this cloud environment |
| Device E2E | Not executed |

---

## Known issues

1. Reminder preference is stored but local notification scheduling is not yet wired (needs `expo-notifications` + permission UX).
2. Catalogue search requires network; offline users must enter books manually (by design).
3. Cover images use remote URLs when available; no local cover cache pipeline yet.
4. Dependency audit reports vulnerabilities in the wider npm tree — review before store release.
5. Lint may still warn on unused vars in transitional screens; CI lint step is non-blocking until cleaned.

---

## Architectural decisions

See [ENGINEERING_DECISIONS.md](./ENGINEERING_DECISIONS.md).

| Decision | Choice |
|----------|--------|
| Client stack | Keep Expo + React Native + TypeScript |
| Persistence | SQLite with versioned migrations |
| Sync | Offline-first; no cloud yet |
| Language | British English |
| Recommendations | Deterministic / metadata-based first |

---

## Next recommended action

1. Wire `expo-notifications` behind the existing reminder toggle (with clear permission rationale).
2. Add camera barcode scanning for ISBN.
3. Add Maestro/Detox smoke flows for onboarding → add book → progress → export.
4. Produce store listing assets and privacy policy URL once product copy is approved.
5. Run production EAS builds only with explicit authorisation for credentials/spend.
