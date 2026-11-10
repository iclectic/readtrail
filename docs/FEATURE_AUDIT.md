# ReadTrail feature audit

**Last refreshed:** 9 November 2026 (Europe/London) — post quality-gate stage.  
Earlier Phase 0 rows that said “Missing” for sessions/tags/etc. are obsolete; this document reflects the current repository.

Legend: **Implemented** · **Partial** · **Deferred** · **Owner-gated**

---

## Core product

| Feature | Status | Notes |
|---------|--------|-------|
| Library CRUD | **Implemented** | Add/edit/delete, status filters, search, sort |
| Progress tracking | **Implemented** | Validation, transactional writes, recompute on delete |
| Reading sessions | **Implemented** | Timed sessions + history |
| Journal / notes | **Implemented** | Notes entity, tags, favourites, quotes |
| Goals | **Implemented** | Daily/weekly/etc. with domain maths + tests |
| Achievements | **Implemented** | Local unlocks |
| Stats / charts | **Implemented** | Streaks, charts, calendar, annual report |
| Tags | **Implemented** | Editor, chips, library filter |
| Collections | **Implemented** | Create + assign from library bulk actions |
| Covers | **Implemented** | Local URI / remote optional |
| ISBN | **Implemented** | Manual + barcode scan + Open Library lookup |
| Discover / catalogue | **Implemented** | Open Library search; fails closed offline |
| Dark mode | **Implemented** | System / light / dark |
| i18n framework | **Partial** | en-GB source module; not multi-locale |
| Accessibility | **Partial** | Labels/targets/reduce-motion/Dynamic Type cap; device audit pending |
| Error recovery | **Implemented** | Bootstrap retry + `AppErrorBoundary` |
| Offline catalogue | **Implemented** | Fails closed with Discover offline hint |
| Import / export | **Implemented** | JSON, CSV, Markdown notes |
| Reminders | **Implemented** | Local notifications |
| Reading Memory | **Implemented** | Spaced review fields + UI |
| Rate app | **Partial** | Wired via release config; store IDs empty until publish |
| AI | **Deferred** | Explicitly out of v1 |
| Cloud sync / social | **Deferred** | Explicitly out of v1 |

---

## Engineering

| Area | Status | Notes |
|------|--------|-------|
| Schema migrations | **Implemented** | `user_version` + migrations 001–003 |
| Design system | **Implemented** | Theme tokens, Screen/Button/TextField/etc. |
| Lint / typecheck / CI | **Implemented** | GitHub Actions quality job |
| Unit tests | **Implemented** | Domain + services + release config |
| DB integration tests | **Implemented** | Node SQLite adapter; migrations + cascade/clear |
| Maestro e2e stubs | **Partial** | Flows present; not executed in cloud agent |
| EAS profiles | **Partial** | Profiles exist; builds owner-gated |
| Privacy hosting | **Partial** | Static page + Pages workflow ready; enable Pages then set URL |

---

## Related documents

- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)  
