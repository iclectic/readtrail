# ReadTrail feature audit

**Audited against:** codebase under `/workspace` (Expo SDK 54, ~2,021 LOC in `src/`)  
**Classification key:**

| Status | Meaning |
|--------|---------|
| **Complete and verified** | Present, usable, and behaviour matches the stated intent in code review |
| **Implemented but requiring improvement** | Works for the happy path; known gaps, polish debt, or weak typing |
| **Partially implemented** | Scaffold, placeholder, or incomplete behaviour |
| **Missing** | Not present in code or schema |
| **Defective** | Present but incorrect or unsafe under realistic use |

This audit does **not** invent completed work. Empty folders (`__tests__/*`, `.github/workflows`) do not count as implementations.

---

## 1. Core library

| Feature | Status | Notes |
|---------|--------|-------|
| Add book (title, author, total pages, status) | **Complete and verified** | `AddEditBookScreen` + `createBook`. Status chips: reading / paused / finished. Title required; total pages optional but validated when present. |
| Edit book | **Complete and verified** | Same screen in edit mode via `bookId` route param. |
| Delete book | **Complete and verified** | Confirm dialog; cascade deletes progress via FK. |
| Book details | **Implemented but requiring improvement** | Shows title, author, current page, %, history. No edit-book entry from details header (user must navigate separately if wired only from list). No ISBN/cover/tags. |
| Library list | **Implemented but requiring improvement** | FlatList with pull-to-refresh. Inline styles; no shared list row component. |
| Search by title/author | **Complete and verified** | Client-side filter on loaded books. |
| Filter by status | **Complete and verified** | all / reading / paused / finished chips. |
| Sort (recent, title, author, progress) | **Complete and verified** | Client-side sort. |
| Book status model | **Defective** | UI uses a local union; `Book.status` is typed `string` in `src/models/Book.ts`; DB column is unconstrained `TEXT`. |
| `currentPage` consistency | **Defective** | Updated on progress save; **not** recomputed when a progress entry is deleted. |
| Page ≤ totalPages validation | **Defective** | `UpdateProgressScreen` only checks integer ≥ 0; no upper bound against `totalPages`. |

---

## 2. Progress tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Add progress entry (page + optional note) | **Implemented but requiring improvement** | Works; note can be empty string. No session linkage. |
| Progress history on book details | **Complete and verified** | Ordered by `createdAt` DESC. |
| Delete progress entry | **Defective** | Deletes row only; does **not** recompute `books.currentPage`. |
| Atomic progress + book update | **Defective** | `addProgressEntry` then `updateBook` — two separate writes, no transaction. |
| Reading sessions (timed) | **Missing** | No table, UI, or model. |
| Journal / rich notes | **Missing** | Only a plain `note` TEXT on progress entries. |
| Goals (daily/weekly) | **Missing** | — |

---

## 3. Statistics

| Feature | Status | Notes |
|---------|--------|-------|
| Library counts by status | **Complete and verified** | Derived in `StatsScreen` from `getAllBooks`. |
| Pages read / average progress | **Implemented but requiring improvement** | Sum of `currentPage`; average % across books with `totalPages > 0`. “Pages this week” logic computes a max page among weekly entries and is unused in the UI — misleading intermediate calculation. |
| Activity counts (week / month) | **Complete and verified** | Counts of progress entries in windows. |
| Reading streak | **Implemented but requiring improvement** | Consecutive calendar days with any progress entry; allows “today missing” only for day 0. Timezone/`toDateString` quirks; no tests. |
| Charts / history graphs | **Missing** | — |
| Achievements | **Missing** | — |

---

## 4. Settings & data

| Feature | Status | Notes |
|---------|--------|-------|
| Export JSON | **Complete and verified** | Writes books + progressEntries to cache and opens share sheet (`expo-sharing`). |
| Import JSON / CSV | **Missing** | Export only. |
| Clear all data | **Complete and verified** | Confirm dialog; `DELETE FROM progress_entries; DELETE FROM books`. |
| App version display | **Complete and verified** | Via `expo-application`. |
| Privacy copy (local-only) | **Complete and verified** | Settings card states no cloud sync / auth. |
| Rate app | **Partially implemented** | Alert placeholder; store URLs not live. |
| Contact / feedback | **Implemented but requiring improvement** | `mailto:support@readtrail.app` — address not verified as a live inbox. |
| User preferences store | **Missing** | No settings table; `userInterfaceStyle` hard-coded `light` in `app.json`. |

---

## 5. Navigation & shell

| Feature | Status | Notes |
|---------|--------|-------|
| Bottom tabs: Library, Stats, Settings | **Complete and verified** | `RootTabs` + Ionicons. |
| Library stack | **Complete and verified** | Home → Details / AddEdit / UpdateProgress. |
| Typed route params | **Complete and verified** | `src/types/navigation.ts`. |
| Safe area handling | **Defective** | Stats/Settings call `useSafeAreaInsets` but **App does not wrap `SafeAreaProvider`**. Library screens do not use insets. |
| Startup / DB bootstrap | **Defective** | `initDb()` runs in `useEffect` without blocking render. |
| Splash / loading gate until DB ready | **Missing** | — |
| Dark mode | **Missing** | `userInterfaceStyle: "light"` only. |
| Internationalisation | **Missing** | Hard-coded English strings (mix of tone; British English required going forward). |
| Accessibility (labels, roles, Dynamic Type) | **Missing** | No systematic a11y props or audit. |

---

## 6. Metadata & organisation

| Feature | Status | Notes |
|---------|--------|-------|
| ISBN | **Missing** | — |
| Cover images | **Missing** | — |
| Collections / shelves | **Missing** | — |
| Tags | **Missing** | — |
| Discovery / catalogue search | **Missing** | — |
| AI features | **Missing** | — |
| Social / sharing progress publicly | **Missing** | Intentional deferral; offline-first, no auth. |

---

## 7. Persistence & platform

| Feature | Status | Notes |
|---------|--------|-------|
| SQLite books + progress_entries | **Complete and verified** | Created in `initDb`. |
| Foreign key cascade | **Complete and verified** | `ON DELETE CASCADE` on progress → books; `PRAGMA foreign_keys = ON`. |
| Schema migrations | **Defective** / **Missing** | No `user_version`, no migration files, no `schema_migrations` table. Additive changes cannot roll out safely. |
| Dev seed data | **Complete and verified** | `__DEV__` only; three sample books when library empty. |
| Design system / shared components | **Missing** | `src/components/index.ts` is an empty barrel. |
| Lint scripts | **Missing** | `package.json` has only `start` / `android` / `ios` / `web`. |
| Unit / integration / e2e tests | **Missing** | `__tests__/{db,domain,services}` directories exist but contain **no test files**. |
| CI | **Missing** | `.github/workflows` exists but contains **no workflow files**. |
| EAS build profiles | **Partially implemented** | `eas.json` has development / preview / production; not evidence of a completed store release. |

---

## 8. Summary counts (by area judgement)

| Status | Count (approx.) |
|--------|-----------------|
| Complete and verified | Core CRUD, search/filter/sort, export, clear, tabs, FK cascade, dev seed |
| Implemented but requiring improvement | Details UX, stats depth, contact mailto, progress notes model |
| Partially implemented | Rate app, EAS config, empty test/CI folders |
| Missing | ISBN, covers, tags, collections, sessions, goals, journal, discovery, AI, social, dark mode, a11y, i18n, import, real tests, CI, design system |
| Defective | Startup race, SafeAreaProvider, non-atomic progress, delete-progress page drift, page validation, no migrations, loose `status` typing |

---

## 9. Priority implications

For an independent developer aiming at a production reading companion:

1. Fix **defective** items before adding features that deepen the schema.
2. Introduce **migrations + domain types + tests/CI** (Phase 1) so later features do not paint the app into a corner.
3. Treat metadata (ISBN, covers, tags, collections) and sessions/goals as **additive product phases**, not as prerequisites for data integrity.

See [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) for the phased backlog.
