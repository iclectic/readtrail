# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

- **Phase 0 — audit docs started**
  - [ARCHITECTURE.md](./ARCHITECTURE.md)
  - [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)
  - [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
  - [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
  - [TEST_STRATEGY.md](./TEST_STRATEGY.md)
  - [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
  - This progress file

### Pre-existing product baseline (before Phase 0 docs)

Verified working in the audited codebase (with known defects):

- Expo SDK 54 / RN 0.81.5 / React 19.1 / TypeScript strict  
- ~2,021 LOC in `src/`  
- SQLite books + progress_entries; repository helpers  
- Screens: LibraryHome, BookDetails, AddEditBook, UpdateProgress, Stats, Settings  
- Tabs: Library, Stats, Settings  
- Add/edit books; progress with optional notes; search/filter/sort; basic stats; JSON export; clear data  
- EAS profile stubs in `eas.json`  
- Dev-only seed books  

---

## Current

**Phase 1 — foundation** (in progress / next implementation work)

Focus areas:

1. Fix startup race — await `initDb` (+ migrations) before render  
2. Migration runner using `PRAGMA user_version`  
3. `SafeAreaProvider` at app root  
4. Design system primitives (replace empty `src/components` barrel)  
5. Domain types (`BookStatus` union, progress invariants)  
6. Tests (Jest) and CI gates  
7. npm scripts: `typecheck`, `test`, `lint`  

Empty scaffolding already on disk (not implementations): `__tests__/{db,domain,services}/`, `.github/workflows/`.

---

## Remaining

### Phase 1 — foundation

- [ ] Bootstrap gate / await DB  
- [ ] Migrations + `schema_migrations` / `user_version`  
- [ ] Safe area provider  
- [ ] Domain types and invariants module  
- [ ] Application services layer for writes  
- [ ] Design system tokens + primitives  
- [ ] Jest setup + first unit/integration tests  
- [ ] ESLint + GitHub Actions CI  
- [ ] British English for new/changed copy  

### Phase 2 — data integrity and core UX

- [ ] Transactional progress updates  
- [ ] Recompute `currentPage` on progress delete  
- [ ] `page <= totalPages` validation  
- [ ] Stats cleanup; edit-from-details polish  

### Phase 3 — library depth

- [ ] ISBN, covers, tags, collections  

### Phase 4 — sessions and journal

- [ ] `reading_sessions`, first-class `notes`  

### Phase 5 — goals, achievements, richer stats

- [ ] Goals, achievements, charts  

### Phase 6 — import and portability

- [ ] JSON import; export versioning  

### Phase 7 — a11y, dark mode, i18n

- [ ] Accessibility pass, theme, en-GB i18n scaffolding  

### Phase 8 — discovery / optional AI

- [ ] Opt-in catalogue/ISBN helpers; AI only if warranted  

### Phase 9 — store release

- [ ] Privacy/support URLs, listings, production builds, checklist green  

---

## Test results

**None yet.** No test files, no CI runs, no recorded device QA matrix.

---

## Known issues (critical)

1. **App does not await `initDb` before render** — `App.tsx` fires init in `useEffect`; navigation mounts immediately.  
2. **No `SafeAreaProvider`** — Stats/Settings use `useSafeAreaInsets` without a provider.  
3. **Non-atomic progress writes** — `addProgressEntry` then `updateBook` without a transaction.  
4. **Deleting progress does not recompute `currentPage`** — book page can remain stale.  
5. **No `page <= totalPages` validation** on progress save.  
6. **No schema migrations** — only `CREATE TABLE IF NOT EXISTS`; upgrades cannot alter schema safely.  
7. **`Book.status` typed as `string`** — loses reading \| paused \| finished safety.  

Additional gaps (non-exhaustive): no tests, no lint scripts, empty components barrel, no import, no dark mode, no a11y programme, no i18n, no ISBN/collections/tags/covers/sessions/goals/journal/discovery/AI/social.

---

## Architectural decisions

| Decision | Choice |
|----------|--------|
| Client stack | **Keep** Expo + React Native + TypeScript |
| Persistence | **Keep** SQLite (`expo-sqlite`) |
| Module shape | **Feature-based modules** with layered dependencies (presentation → application → domain → repositories → persistence → integrations) |
| Sync | **Offline-first**; **no cloud auth/sync** until the core product is solid |
| Product language | **British English** going forward |
| Scope guard | Tracker companion, not an ebook reader engine |

Details: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Next

1. Fix **startup race** and add **`SafeAreaProvider`**.  
2. Land **migrations** (`user_version`).  
3. Introduce **design system** + **domain types**.  
4. Add **tests** and **CI**.  
5. Then Phase 2 integrity fixes (transactions, recompute, validation).  

Roadmap: [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md).
