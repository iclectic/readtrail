# ReadTrail test strategy

**Current state:** Jest unit + Node SQLite integration tests run in CI. Maestro flows exist under `.maestro/` but are not executed in the cloud agent environment.

---

## 1. Goals

1. Protect data integrity (progress, migrations, deletes) before expanding features.  
2. Keep domain logic pure and fast under Jest.  
3. Use integration tests for SQLite migrations and cascade/clear SQL.  
4. Keep a thin Maestro smoke suite for release candidates.  
5. Fail CI on type errors, lint, and failing tests.

---

## 2. Test layers

### 2.1 Unit tests (Jest)

**Where:** `__tests__/domain/**`, `__tests__/services/**`, `__tests__/config/**`.

**Covered:** progress invariants, streaks, goals, analytics, charts, duplicates, Reading Memory scheduling, CSV/tags, backup parse guards, release URL helpers.

**Rules:** no React Native rendering; no real device filesystem; deterministic clocks via injected `now` where needed.

### 2.2 Integration tests (Jest + Node SQLite)

**Where:** `__tests__/db/**`.

**Approach:** migrations speak a narrow `MigrationDatabase` interface. Production uses expo-sqlite; tests use `better-sqlite3` via `__tests__/db/helpers/nodeSqlite.ts`.

**Covered:**

| Area | Evidence |
|------|----------|
| Migrations on empty DB | `__tests__/db/migrations.test.ts` |
| Idempotent re-run | same |
| Legacy `user_version=0` upgrade | same |
| FK cascade on book delete | `__tests__/db/integrity.test.ts` |
| Clear-all SQL | shared `CLEAR_ALL_USER_DATA_SQL` |
| Recompute page after delete | domain helper assertion in integrity suite |

Repository modules still talk to expo-sqlite at runtime; critical SQL and migration behaviour are locked by the Node adapter.

### 2.3 End-to-end (Maestro)

**Where:** `.maestro/*.yaml`.

**Minimum flows:**

1. Cold start → library  
2. Add book → appears in list (`smoke-add-book.yaml` / `smoke-library.yaml`)  
3. Settings export / clear controls visible  
4. Screenshot navigation stubs for store capture  

Run on a simulator/emulator with the app installed, e.g. `npx maestro test .maestro/smoke-library.yaml`.

---

## 3. Scripts and CI

```bash
npm run typecheck
npm test
npm run lint
```

GitHub Actions workflow `.github/workflows/ci.yml` runs these on pull requests and `main`.

`better-sqlite3` is a **devDependency** for migration/integrity tests only.

---

## 4. Manual test charter (release candidates)

- [ ] Fresh install: library loads without error  
- [ ] Add book → update progress → kill app → reopen → data persists  
- [ ] Delete latest progress → current page updates correctly  
- [ ] Progress at `totalPages` marks finished as designed  
- [ ] Export JSON / CSV opens share sheet  
- [ ] Clear all data empties library and stats  
- [ ] Reduce motion disables library/details layout animations  
- [ ] Privacy screen and Settings backup controls reachable  

---

## 5. Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)  
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)  
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)  
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
