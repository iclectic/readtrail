# Engineering decisions

Significant choices made while transforming ReadTrail into a production-oriented reading companion.

## Stack

- **Keep Expo SDK 54 + React Native + TypeScript.** The existing app was already coherent on this stack; rewriting would destroy working offline persistence without a compelling technical reason.
- **Keep SQLite via `expo-sqlite`.** Offline-first personal data fits local relational storage. Cloud sync remains optional and deferred.

## Architecture

- **Layered feature modules:** presentation → services → domain → repositories → SQLite.
- **Domain logic is pure TypeScript** (`src/domain`) so progress, streaks, goals and analytics can be unit-tested without native modules.
- **Repositories own SQL.** Screens talk to repositories/services, not raw queries.
- **Transactional writes** for progress updates that must keep `progress_entries` and `books.currentPage` consistent.

## Schema evolution

- Introduced `PRAGMA user_version` migrations.
- Legacy databases (tables present, `user_version = 0`) are recognised and marked as v1 before applying v2 expansions.
- Existing camelCase columns on `books` / `progress_entries` are retained to avoid destructive rebuilds; new tables follow the same column style for consistency with the legacy tables.

## Product principles

- **British English** for user-facing copy.
- **Generous offline free experience** — no artificial library limits, no ads, no account required for core tracking.
- **Optional network use** only for catalogue/ISBN lookup, with manual entry always available.
- **Deterministic recommendations** first (from the user’s own library metadata) before any AI infrastructure.
- Theme follows system by default; streak tracking and reminders can be disabled.

## Testing

- Jest + ts-jest for domain/unit tests in Node.
- CI runs typecheck and unit tests on push/PR.
- Native SQLite integration tests and device E2E remain follow-up work (require Expo/device runtime).

## Deferred (intentional)

- Cloud authentication and synchronisation.
- Public social/community features (require moderation before shipping).
- Paid AI features.
- Native ISBN camera scanning (catalogue ISBN lookup is in place; camera scanning needs permissions + UX polish).
- Store submission and production signing credentials (require owner authorisation).
