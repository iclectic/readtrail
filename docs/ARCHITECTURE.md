# ReadTrail architecture

**Status:** audited against the codebase as of Phase 0  
**Stack:** Expo SDK 54 · React Native 0.81.5 · React 19.1 · TypeScript (strict) · expo-sqlite  
**Approx. application code:** ~2,021 lines under `src/`

This document describes the architecture that exists today, the modular target architecture, feature modules, dependency rules, and key decisions. It is factual: nothing here is claimed as implemented unless it already exists in the repository.

---

## 1. Current architecture (as shipped)

### 1.1 High-level shape

The app is a single Expo client with local SQLite persistence. There is no backend, no authentication, and no network sync. Screens talk directly to repository functions that wrap SQL helpers.

```
App.tsx
  └─ useEffect → initDb() + seedDevData()   (not awaited before first render)
  └─ AppNavigation
       └─ NavigationContainer
            └─ RootTabs
                 ├─ LibraryTab → LibraryStack
                 │    ├─ LibraryHome
                 │    ├─ BookDetails
                 │    ├─ AddEditBook
                 │    └─ UpdateProgress
                 ├─ StatsTab → StatsScreen
                 └─ SettingsTab → SettingsScreen
```

### 1.2 Source layout today

| Path | Role |
|------|------|
| `App.tsx` / `index.ts` | Entry; DB init fire-and-forget; mounts navigation |
| `src/navigation/` | `NavigationContainer`, bottom tabs, library stack |
| `src/screens/library/` | Library, book details, add/edit, progress, stats |
| `src/screens/settings/` | Export, clear data, rate/contact placeholders |
| `src/db/sqlite.ts` | Open DB, `CREATE TABLE IF NOT EXISTS`, query/write helpers |
| `src/db/repositories/` | `booksRepo`, `progressEntriesRepo` |
| `src/models/` | `Book`, `ProgressEntry` interfaces |
| `src/components/` | Empty barrel (`export {}`) — no shared UI yet |
| `src/utils/` | Logger, date formatting, haptics |
| `src/types/navigation.ts` | React Navigation param lists |

### 1.3 Data flow today

1. Screen loads data via repository calls (`getAllBooks`, `getBookById`, etc.).
2. Mutations call repository write functions (`createBook`, `updateBook`, `addProgressEntry`, …).
3. Progress updates perform **two separate writes**: insert into `progress_entries`, then `updateBook` for `currentPage`. These are **not** wrapped in a transaction.
4. UI state is local React state per screen; there is no shared app store or query cache.
5. Stats are computed in the Stats screen from full-table reads.

### 1.4 Persistence today

- Database file: `readtrail.db` via `expo-sqlite`.
- Tables: `books`, `progress_entries` (see [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)).
- One index: `idx_progress_entries_bookId`.
- Foreign keys enabled with `PRAGMA foreign_keys = ON`.
- **No** `user_version`, **no** migration runner, **no** `schema_migrations` table.
- Schema is created with `CREATE TABLE IF NOT EXISTS` only — existing installs never receive additive schema changes.

### 1.5 Known architectural defects

| Defect | Location | Impact |
|--------|----------|--------|
| `initDb` not awaited before render | `App.tsx` | Screens can query before tables exist |
| No `SafeAreaProvider` | `App.tsx` / navigation | `useSafeAreaInsets` in Stats/Settings returns zeros |
| Non-atomic progress writes | `UpdateProgressScreen` | Entry can exist without matching `currentPage` (or vice versa) |
| Delete progress does not recompute `currentPage` | `BookDetailsScreen` | Stale page after deleting the latest entry |
| No `page <= totalPages` validation | `UpdateProgressScreen` | Invalid progress can be stored |
| `Book.status` typed as `string` | `src/models/Book.ts` | Loses the reading \| paused \| finished union |
| Empty components barrel | `src/components/index.ts` | No design-system layer yet |
| Screens own business rules | screens + repos | Hard to test domain logic in isolation |

### 1.6 What is deliberately absent

No design tokens package, no application/services layer, no domain invariants module, no feature folders, no CI workflows with content, no tests with content, no import path, no cloud integrations, no auth.

---

## 2. Target modular architecture

Move from “screens → repositories → SQL” to layered, feature-oriented modules while keeping Expo, React Native, TypeScript, and SQLite.

### 2.1 Layers

```
┌─────────────────────────────────────────────────────────┐
│ Presentation                                            │
│  screens, navigation, design-system components, hooks   │
├─────────────────────────────────────────────────────────┤
│ Application                                             │
│  use-cases / services (orchestrate domain + repos)      │
├─────────────────────────────────────────────────────────┤
│ Domain                                                  │
│  entities, value objects, invariants, pure calculations │
├─────────────────────────────────────────────────────────┤
│ Repositories                                            │
│  interfaces + SQLite implementations                    │
├─────────────────────────────────────────────────────────┤
│ Persistence                                             │
│  sqlite client, migrations, transactions, seeds         │
├─────────────────────────────────────────────────────────┤
│ Integrations (optional, later)                          │
│  share sheet, file import/export, store links, ISBN API │
└─────────────────────────────────────────────────────────┘
```

**Dependency rule (hard):** inner layers must not import outer layers.

- Domain imports nothing from React, Expo, or SQLite.
- Application may import domain + repository interfaces.
- Repositories may import domain types + persistence helpers.
- Presentation may import application and design-system UI; it must not contain raw SQL.
- Integrations are adapters called from application services, never from domain.

### 2.2 Suggested target tree

```
src/
  app/                    # App root, providers, bootstrap (await init)
  navigation/
  design-system/          # tokens, Text, Button, Screen, ListRow, …
  features/
    library/
      screens/
      hooks/
      application/        # e.g. addBook, updateProgress (transactional)
      domain/             # BookStatus, progress invariants
    stats/
    settings/
    sessions/             # Phase 4+
    collections/          # Phase 3+
    goals/                # Phase 5+
  domain/                 # shared domain primitives if needed
  repositories/
    booksRepo.ts
    progressEntriesRepo.ts
    …                     # sessions, notes, tags, …
  persistence/
    sqlite.ts
    migrations/
    transactions.ts
  integrations/
    exportJson.ts
    importJson.ts         # later
    haptics.ts
    sharing.ts
  utils/
```

Exact folder names may vary; the layer boundaries and import rules must not.

### 2.3 Feature modules (target catalogue)

| Module | Responsibility | Phase |
|--------|----------------|-------|
| **bootstrap** | Await DB init/migrations, providers (`SafeArea`, theme) | 1 |
| **design-system** | Tokens, primitives, layout shells | 1 |
| **library** | Books CRUD, list search/filter/sort, details | 1–2 (exists; harden) |
| **progress** | Progress entries, atomic updates, history | 1–2 (exists; harden) |
| **stats** | Aggregations, streak, charts later | 2 / 5 |
| **settings** | Export, clear, about, preferences | 1–2 / 6–7 |
| **collections** | Named shelves / collections | 3 |
| **tags** | Free-form or curated tags on books | 3 |
| **covers** | Local cover images / remote fetch by ISBN | 3 |
| **sessions** | Timed or open reading sessions | 4 |
| **journal / notes** | Richer notes beyond progress `note` | 4 |
| **goals** | Daily/weekly page or book goals | 5 |
| **achievements** | Local unlocks based on activity | 5 |
| **import-export** | JSON (and later CSV) round-trip | 6 |
| **discovery** | Optional catalogue / ISBN lookup | 8 |
| **ai-assist** | Optional, offline-friendly suggestions — not core | 8 |
| **i18n / a11y / theme** | British English default strings, a11y, dark mode | 7 |
| **sync / social** | Explicitly out of scope until core is solid | post-9 |

---

## 3. Dependency rules (enforceable)

1. **No SQL in screens.** Screens call application services or repositories (prefer services for multi-step writes).
2. **No React in domain.** Domain functions are pure and unit-tested without Expo.
3. **Transactions at the persistence/application boundary.** Multi-table writes (progress + book page) must be one transaction.
4. **Migrations are the only schema evolution path.** Never rely on `CREATE TABLE IF NOT EXISTS` alone for upgrades.
5. **Integrations are optional adapters.** Missing network must not break offline library use.
6. **British English** in user-facing copy and documentation going forward.
7. **Offline-first.** Features that need the network degrade gracefully or stay optional.

Proposed lint/CI guards later: path-alias boundaries or eslint `no-restricted-imports` from `screens/**` → `persistence/**`.

---

## 4. Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Client framework | Keep **Expo + React Native + TypeScript** | Already shipping; SDK 54 / RN 0.81.5 / React 19.1 verified |
| Local store | Keep **SQLite via expo-sqlite** | Fits offline-first reading data; repositories already exist |
| Architecture style | **Feature modules + layered dependencies** | Scales past ~2k LOC without a premature rewrite |
| Sync / auth | **None until core is solid** | Product promise is local privacy; cloud adds scope and risk |
| Schema evolution | **`PRAGMA user_version` + ordered migrations** | Required before any additive tables |
| UI system | Introduce a small **design system** (tokens + primitives) | Replace duplicated StyleSheets; empty `components/` today |
| Status model | Domain union `reading \| paused \| finished` | Today stored/typed loosely as `string` |
| Testing | Jest unit/integration first; Detox/Maestro e2e later | See [TEST_STRATEGY.md](./TEST_STRATEGY.md) |
| Locale | **British English** copy | Product language decision |
| Social / AI | Deferred optional modules | Not blockers for a production reading companion MVP |

---

## 5. Bootstrap sequence (target)

1. Open SQLite database.
2. Run migrations to target `user_version`.
3. Optionally seed **dev-only** sample data.
4. Mount providers: `SafeAreaProvider`, theme, navigation.
5. Only then render tabs/screens.

Today steps 2 and 4 are missing, and step 1 races the first render.

---

## 6. Related documents

- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md) — feature-by-feature status
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) — phases 0–9
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — schema and migrations
- [TEST_STRATEGY.md](./TEST_STRATEGY.md) — test and CI approach
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — store readiness
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) — live progress tracker
