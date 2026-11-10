# ReadTrail architecture

**Status:** refreshed 10 November 2026 (Europe/London)  
**Stack:** Expo SDK 54 · React Native 0.81 · React 19 · TypeScript (strict) · expo-sqlite  
**Principle:** offline-first personal reading companion; no account required for core use

---

## 1. Runtime shape

```
App.tsx
  └─ useAppBootstrap()  → await initDb() → seedDevData (__DEV__) → getSettings()
  └─ SafeAreaProvider
       └─ AppSettingsProvider
            └─ ThemeProvider (light / dark / system, reduce motion, Dynamic Type cap)
                 └─ OnboardingScreen | AppNavigation
                      └─ Tabs: Library · Discover · Goals · Notes/Memory · Stats · Settings
```

Bootstrap blocks navigation until migrations finish. Dev builds may seed a screenshot demo library when empty.

---

## 2. Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| UI | `src/screens/`, `src/components/` | Presentation; British English copy via `src/i18n` |
| Navigation | `src/navigation/` | Tabs + native stacks |
| Application services | `src/services/` | Multi-step writes (progress, sessions, backup, CSV, tags, reminders, metadata) |
| Domain | `src/domain/` | Pure rules: progress, streaks, goals, analytics, CSV/tags, backup reminder |
| Persistence | `src/db/` | SQLite helpers, `user_version` migrations, repositories |
| Theme | `src/theme/` | Tokens, ThemeProvider, typography scaling helpers |
| Config | `src/config/release.ts` | Privacy URL / store IDs (empty until live) |

**Dependency rule:** screens → services/domain/db; services → domain + db; domain has no React Native UI imports.

---

## 3. Persistence

- File: `readtrail.db` via `expo-sqlite`
- Migrations: `001` baseline → `002` library expansion → `003` reading memory → `004` backup reminder (`lastBackupAt`)
- Foreign keys on; book delete cascades to progress, sessions, notes, tag/collection joins
- Clear-all uses shared `CLEAR_ALL_USER_DATA_SQL` (keeps settings + schema)
- Integration tests run migrations against Node `better-sqlite3` via `MigrationDatabase`

---

## 4. Key product flows

| Flow | Mechanism |
|------|-----------|
| Progress update | `progressService.recordProgress` in a transaction; validates page bounds; may mark finished |
| Delete progress | Recomputes `currentPage` from remaining entries |
| Backup | JSON export/import (format v2) + CSV library + Markdown notes; sets `lastBackupAt` |
| Catalogue | Optional Open Library HTTPS; fails closed offline |
| Reminders | Local notifications only; permission at enable time |
| Privacy | In-app notice + hostable `docs/site/privacy/` |

---

## 5. Quality gates

- `npm run typecheck` · `npm test` · `npm run lint` (CI on PRs/`main`)
- Maestro stubs under `.maestro/` (device execution owner-gated)
- Store launch artefacts: listing copy, data safety, age rating, Pages workflow, EAS notes

---

## 6. Explicit non-goals (current release path)

- Cloud sync / accounts / social feeds  
- AI features that send private notes off-device  
- Ebook reader engine  
- Submitting store builds without owner authorisation  

---

## Related documents

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)  
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)  
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)  
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)  
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
