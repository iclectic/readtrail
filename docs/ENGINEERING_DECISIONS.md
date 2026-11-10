# Engineering decisions

Significant choices made while transforming ReadTrail into a production-oriented reading companion.  
Last refreshed: 10 November 2026 (Europe/London).

## Stack

- **Keep Expo SDK 54 + React Native + TypeScript.** The existing app was already coherent on this stack; rewriting would destroy working offline persistence without a compelling technical reason.
- **Keep SQLite via `expo-sqlite`.** Offline-first personal data fits local relational storage. Cloud sync remains optional and deferred.

## Architecture

- **Layered modules:** presentation → services → domain → repositories → SQLite.
- **Domain logic is pure TypeScript** (`src/domain`) so progress, streaks, goals, analytics, CSV/tags and backup reminders can be unit-tested without native modules.
- **Repositories own SQL.** Screens talk to repositories/services, not raw queries.
- **Transactional writes** for progress updates that must keep `progress_entries` and `books.currentPage` consistent.
- **MigrationDatabase** interface lets production use expo-sqlite while Jest uses Node `better-sqlite3`.

## Schema evolution

- `PRAGMA user_version` migrations 001–004 (baseline → library expansion → reading memory → backup reminder).
- Legacy databases (tables present, `user_version = 0`) are recognised and marked as v1 before applying later expansions.
- Existing camelCase columns on legacy tables are retained to avoid destructive rebuilds.

## Product principles

- **British English** for user-facing copy.
- **Generous offline free experience** — no artificial library limits, no ads, no account required for core tracking.
- **Optional network use** only for catalogue/ISBN lookup (and barcode → lookup), with manual entry always available.
- **Deterministic recommendations** from the user’s own library before any AI infrastructure.
- Theme follows system by default; streak tracking, reminders and reduce motion are user-controlled.

## Testing and release

- Jest + ts-jest for domain/unit and Node SQLite integration tests.
- CI runs `npm run verify` equivalent gates (typecheck, test, lint) on push/PR.
- Maestro stubs cover smoke paths; device execution is owner-gated.
- Store launch steps are consolidated in [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

## Deferred (intentional)

- Cloud authentication and synchronisation.
- Public social/community features (require moderation before shipping).
- Paid / off-device AI features.
- Store submission and production signing credentials (require owner authorisation).
- Repository licence choice (owner decision).
