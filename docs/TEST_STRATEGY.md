# ReadTrail test strategy

**Current state:** no executable tests. `__tests__/db`, `__tests__/domain`, and `__tests__/services` directories exist but are empty. `package.json` has no `test`, `lint`, or `typecheck` scripts. `.github/workflows` has no workflow files. CI gates described here are **planned**, not active.

---

## 1. Goals

1. Protect data integrity (progress, migrations, deletes) before expanding features.  
2. Keep domain logic pure and fast under Jest.  
3. Use integration tests for SQLite repositories and migrations.  
4. Add a thin e2e smoke suite before store submission.  
5. Fail CI on type errors and failing unit/integration tests.

---

## 2. Test layers

### 2.1 Unit tests (Jest)

**Where:** `__tests__/domain/**`, colocated `*.test.ts` next to pure modules when useful.

**Cover:**

| Area | Examples |
|------|----------|
| Domain types / parsers | `parseBookStatus`, reject unknown status |
| Progress invariants | `page` bounds vs `totalPages`; recompute `currentPage` from entries |
| Stats pure functions | streak calculation; counts by status; week/month windows |
| Goal progress | pages toward daily/weekly target (Phase 5) |
| Export payload builders | stable shape + schema version (Phase 6) |

**Rules:** no React Native rendering; no real filesystem; deterministic clocks via injected `now`.

### 2.2 Integration tests (Jest + SQLite)

**Where:** `__tests__/db/**`.

**Cover:**

| Area | Examples |
|------|----------|
| Migrations | empty DB → latest `user_version`; idempotent re-run |
| booksRepo CRUD | create/update/delete/get |
| progressEntriesRepo | add/list/delete |
| Transactions | add progress + update book commits atomically; rollback on failure |
| Recompute on delete | deleting latest entry lowers `currentPage` |
| Cascade | deleting book removes progress (and later sessions/notes) |
| clearAllData | tables empty afterwards |

**Expo note:** prefer testing persistence modules against `expo-sqlite` in a Jest environment configured for Expo, or extract SQL behind a narrow driver interface and run integration tests on a Node SQLite driver that executes the same SQL. Choose one approach in Phase 1 and document it in the Jest setup; do not leave repositories untested.

### 2.3 Component / screen tests (optional early, React Native Testing Library)

**When:** after design-system primitives exist.

**Cover:** form validation messages (title required, page bounds); filter chips; empty states. Keep shallow — screens that need navigation can use mocked navigation props.

### 2.4 End-to-end (Detox or Maestro)

**When:** Phase 9 approach / late Phase 2 smoke.

**Minimum flows:**

1. Cold start → library loads (after bootstrap gate).  
2. Add book → appears in list.  
3. Update progress → details show history and updated page.  
4. Delete progress entry → current page recomputes.  
5. Export JSON produces a shareable file (assert file write where possible).  
6. Clear data → empty library.

E2E is a **gate for release candidates**, not for every commit, until the suite is fast and stable.

---

## 3. Jest setup plan (Phase 1)

None of this is implemented yet. Planned steps:

1. Add devDependencies: `jest`, `jest-expo`, `@types/jest`, `@testing-library/react-native` (when UI tests start), `typescript` already present.  
2. Add `jest.config.js` using `jest-expo` preset.  
3. Add scripts to `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint ."
  }
}
```

4. Add ESLint (Expo or flat config) with TypeScript + `no-restricted-imports` for layer boundaries when ready.  
5. Seed first tests:

   - `__tests__/domain/bookStatus.test.ts`  
   - `__tests__/domain/progressInvariants.test.ts`  
   - `__tests__/db/migrations.test.ts` (once runner exists)  
   - `__tests__/db/progressTransaction.test.ts`

6. Ensure `__DEV__` seed logic is disabled or irrelevant in tests (empty DB fixtures).

### 3.1 Coverage expectations (initial)

Not a vanity 100% target. Phase 1–2 aim:

- Domain invariants: high coverage.  
- Repositories + migrations: critical paths covered.  
- Screens: only fragile validation logic until design system lands.

---

## 4. What to cover first (priority order)

1. **Migration runner** — upgrade from version 0 schema to version N without data loss.  
2. **Transactional progress update** — atomicity.  
3. **Recompute `currentPage` after delete**.  
4. **`page <= totalPages` validation**.  
5. **BookStatus parsing / typing**.  
6. **Streak and stats pure functions** (pin behaviour before changing UI).  
7. **Export JSON shape**.  
8. **Import merge/replace** (Phase 6).

---

## 5. CI gates

### 5.1 Planned GitHub Actions workflow

Trigger: pull requests and pushes to `main`.

Jobs (minimum):

| Gate | Command | Required |
|------|---------|----------|
| Install | `npm ci` | yes |
| Typecheck | `npm run typecheck` | yes |
| Unit/integration | `npm test -- --ci --coverage=false` | yes |
| Lint | `npm run lint` | yes once ESLint configured |

Optional later:

- E2E on schedule or `release/*` branches  
- `eas build` is **not** a default PR gate (cost/time)

### 5.2 Local pre-push hygiene (recommended)

Developers run `npm run typecheck && npm test` before push. A husky hook is optional; CI remains authoritative.

### 5.3 Current CI reality

**No gates are enforcing anything today.** Empty `.github/workflows` does not protect `main`.

---

## 6. Test data and fixtures

- Use factories: `makeBook({ … })`, `makeProgressEntry({ … })`.  
- Prefer fixed ISO timestamps for streak tests.  
- Never depend on `seedDevData` for assertions; call repositories directly.  
- Migration tests should start from a raw legacy schema dump matching production v0.

---

## 7. Manual test charter (until e2e exists)

For each PR touching persistence or progress:

- [ ] Fresh install: library loads without error  
- [ ] Add book → update progress → kill app → reopen → data persists  
- [ ] Delete latest progress → current page updates correctly  
- [ ] Progress at `totalPages` behaves as designed (validation / finished)  
- [ ] Export JSON opens share sheet  
- [ ] Clear all data empties library and stats  

---

## 8. Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — testable layer boundaries  
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — migration cases  
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) — Phase 1/2/9 testing work  
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — release verification  
