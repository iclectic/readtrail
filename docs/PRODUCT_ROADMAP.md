# ReadTrail product roadmap

**Audience:** independent developer building a production, offline-first reading companion  
**Language:** British English in product copy going forward  
**Principle:** harden the core before expanding surface area; no cloud auth/sync until the local product is solid

Phases are **dependency-aware**. Later phases assume earlier foundation work lands first. Nothing in Phases 1–9 is claimed complete unless listed under Phase 0 / current progress in [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md).

**Status note (10 November 2026):** Phases 0–9 engineering for the offline MVP are on `main`. Run `npm run preflight` for the owner go/no-go. Remaining work is owner-gated store launch (device screenshots, EAS/submit, licence, support mailbox) plus deferred AI/cloud/social.

---

## Phase 0 — Audit and planning

**Goal:** factual baseline so implementation does not invent “done” work.

| Item | Status |
|------|--------|
| Architecture document | This docs set (started) |
| Feature audit | This docs set (started) |
| Database design (current + target) | This docs set (started) |
| Test strategy | This docs set (started) |
| Release checklist | This docs set (started) |
| Implementation progress tracker | This docs set (started) |

**Exit criteria:** docs match audited reality; critical defects listed; phases 1–9 prioritised.

---

## Phase 1 — Foundation

**Goal:** make the codebase safe to change.

Depends on: Phase 0.

| Priority | Item | Why |
|----------|------|-----|
| P0 | Await DB init (and migrations) before rendering navigation | Removes startup race |
| P0 | Introduce `PRAGMA user_version` migration runner | Unblocks all schema work |
| P0 | Wrap app in `SafeAreaProvider` | Fixes Stats/Settings insets |
| P1 | Domain types (`BookStatus` union, progress invariants) | Replace `status: string` |
| P1 | Minimal design system (tokens, `Screen`, `Button`, `TextField`, list row) | End StyleSheet copy-paste |
| P1 | Application services for multi-step writes | Seat for transactions |
| P1 | Jest unit tests for domain + repositories | See TEST_STRATEGY |
| P1 | ESLint/tsc scripts + GitHub Actions CI gate | Prevent regressions |
| P2 | Feature-folder / layer boundaries (incremental) | Target architecture |

**Exit criteria:** cold start never queries before schema ready; CI runs typecheck + unit tests; empty components barrel replaced by real primitives; British English adopted for new copy.

---

## Phase 2 — Data integrity and core UX hardening

**Goal:** reading progress is trustworthy.

Depends on: Phase 1 migrations + services.

| Priority | Item | Why |
|----------|------|-----|
| P0 | Transactional “add progress + update book” | Atomic writes |
| P0 | On delete progress, recompute `currentPage` (max remaining or 0) | Fix stale page |
| P0 | Validate `0 ≤ page ≤ totalPages` (when totalPages > 0) | Prevent impossible progress |
| P1 | Optionally auto-set status to `finished` when page === totalPages | Quality of life |
| P1 | Edit book from details; clearer empty states | UX completeness |
| P1 | Stats: remove dead/misleading calculations; document streak rules | Trustworthy stats |
| P2 | Repository integration tests against SQLite | Lock invariants |

**Exit criteria:** no known critical data defects from the audit remain open.

---

## Phase 3 — Library depth (metadata and organisation)

**Goal:** organise a real personal library without leaving the device.

Depends on: Phase 1 migrations.

| Priority | Item | Notes |
|----------|------|-------|
| P1 | ISBN field on books | Manual entry first |
| P1 | Tags (+ join table) | Filter library by tag |
| P1 | Collections / shelves | Many-to-many with books |
| P2 | Cover images | Local file URI first; remote fetch optional later |
| P2 | Library filters for tags/collections | Build on existing search/filter |

**Exit criteria:** user can file books into collections, tag them, and store ISBN; schema migrated cleanly on upgrade.

---

## Phase 4 — Sessions and journal

**Goal:** capture how reading happened, not only the page number.

Depends on: Phase 2 integrity; Phase 1 migrations.

| Priority | Item | Notes |
|----------|------|-------|
| P1 | `reading_sessions` (start/end, book, pages delta optional) | Manual start/stop MVP |
| P1 | First-class `notes` (journal) entity | Beyond progress.note |
| P2 | Link notes to book, session, or page | Flexible anchoring |
| P2 | Session history on book details / stats | Feed richer activity |

**Exit criteria:** user can log a session and a journal note; progress remains consistent.

---

## Phase 5 — Goals, achievements, richer stats

**Goal:** motivation without social pressure.

Depends on: Phases 2 and 4 data.

| Priority | Item | Notes |
|----------|------|-------|
| P1 | Reading goals (daily/weekly pages or minutes) | Stored in `goals` |
| P1 | Goal progress derived from sessions/progress | Pure domain calcs preferred |
| P2 | Local achievements | Stored unlocks; no network |
| P2 | Stats charts (pages over time) | Keep offline |

**Exit criteria:** at least one goal type works end-to-end; streak/goal rules covered by unit tests.

---

## Phase 6 — Import and data portability

**Goal:** users can leave and return without lock-in.

Depends on: stable schema (Phases 1–3 at minimum).

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Import JSON matching export shape | Merge vs replace strategies |
| P1 | Export versioning / schema version in payload | Forward compatible |
| P2 | CSV import/export | Optional |
| P2 | Backup reminder in Settings | Soft UX |

**Exit criteria:** round-trip export → clear → import restores library; tested.

---

## Phase 7 — Accessibility, appearance, localisation

**Goal:** production polish for real devices and readers.

Depends on: design system (Phase 1).

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Accessibility pass (labels, hit targets, contrast, screen readers) | Store expectation |
| P1 | Dark mode + system theme | Settings + `userInterfaceStyle` |
| P1 | Dynamic type / large content well | RN Text scaling |
| P2 | i18n framework with en-GB default | British English source strings |
| P2 | Reduce motion where appropriate | Prefer intentional motion |

**Exit criteria:** a11y checklist in RELEASE_CHECKLIST largely tickable; dark mode usable.

---

## Phase 8 — Discovery and optional intelligence

**Goal:** optional helpers that never break offline use.

Depends on: ISBN/covers (Phase 3); solid core.

| Priority | Item | Notes |
|----------|------|-------|
| P2 | ISBN / catalogue lookup (opt-in network) | Fill metadata |
| P2 | Soft discovery (“add from search”) | Still saves locally |
| P3 | AI assist (summaries, prompts) | Explicitly optional; not required for v1 store |
| — | Social feeds / accounts | **Out of scope** until post-core |

**Exit criteria:** discovery features fail closed when offline; core library unaffected.

---

## Phase 9 — Store release readiness

**Goal:** ship a credible 1.0 to Play Store and App Store.

Depends on: Phases 1–2 mandatory; 3–7 as scoped for the chosen MVP cut; checklist green.

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Privacy policy / support URL live | Store requirement |
| P0 | App icons, screenshots, store listings (en-GB) | Marketing assets |
| P0 | Production EAS builds; versioning discipline | `eas.json` already drafted |
| P0 | Replace rate-app placeholders with real store IDs | Settings |
| P1 | Crash-free smoke on physical iOS + Android | Manual + e2e sample |
| P1 | Licence decision for the repository | Proprietary `LICENSE` added; open-source optional later |
| P2 | Soft launch / closed test tracks | Play internal/closed; TestFlight |

**Exit criteria:** [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) critical items complete; no open P0 defects from Phases 1–2.

---

## Suggested MVP cut for first public release

An independent developer should aim for:

1. Phases **0–2** complete (non-negotiable).
2. Phase **6** JSON import (parity with export) strongly recommended.
3. Phase **7** a11y + dark mode strongly recommended for store quality.
4. Phase **3** tags **or** collections (one organisation model) if time allows.
5. Defer sessions/goals/AI/social if they threaten the release.

---

## Explicit non-goals (until core is solid)

- Cloud sync and multi-device accounts  
- Social graphs, public profiles, comments  
- DRM / ebook reader engine (ReadTrail is a **tracker**, not a reader)  
- Rewriting away from Expo/React Native/SQLite  

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)  
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)  
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)  
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)  
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
