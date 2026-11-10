# ReadTrail database design

**Engine:** SQLite via `expo-sqlite` (`readtrail.db`)  
**Migrations:** `PRAGMA user_version` + `schema_migrations` (versions **1–4**)  
**Foreign keys:** `PRAGMA foreign_keys = ON`  
**Source of truth:** `src/db/migrations/001_*.ts` … `004_*.ts`

---

## 1. Migration history

| Version | Name | Summary |
|---------|------|---------|
| 1 | `baseline_books_and_progress` | `books`, `progress_entries`, `schema_migrations` |
| 2 | `library_expansion` | Book metadata columns; sessions, notes, tags, collections, goals, achievements, `app_settings` |
| 3 | `reading_memory_and_indexes` | Spaced-repetition fields on `notes` + indexes |
| 4 | `backup_reminder` | `app_settings.lastBackupAt` |

Legacy installs with tables but `user_version = 0` are detected and marked as v1 before pending migrations run.

---

## 2. Current schema (v4)

### 2.1 `books`

Core: `id`, `title`, `author`, `totalPages`, `status`, `currentPage`, `createdAt`, `updatedAt`  
Expansion: `isbn`, `coverUri`, `subtitle`, `publisher`, `publishedYear`, `genre`, `format` (default `physical`), `ownership` (default `owned`), `rating`, `description`, `startedAt`, `finishedAt`

Indexes: `status`, `updatedAt`, `isbn`, `(title, author)`

Statuses (domain): `want_to_read` | `reading` | `paused` | `finished` | `did_not_finish`

### 2.2 `progress_entries`

`id`, `bookId` → books CASCADE, `page`, `note`, `sessionId` (nullable), `createdAt`  
Indexes: `bookId`, `(bookId, createdAt DESC)`, `createdAt`

### 2.3 `reading_sessions`

`id`, `bookId` → books CASCADE, `startedAt`, `endedAt`, `startPage`, `endPage`, `durationSeconds`, `notes`

### 2.4 `notes`

Journal: `id`, `bookId` CASCADE, `sessionId` SET NULL, `page`, `kind`, `body`, `tags`, `isFavourite`, `createdAt`, `updatedAt`  
Reading Memory: `intervalDays`, `easeFactor`, `repetitions`, `nextReviewAt`, `lastReviewedAt`, `includedInMemory`

### 2.5 Organisation

- `tags` / `book_tags` (unique name COLLATE NOCASE; CASCADE)
- `collections` / `book_collections` (unique name; CASCADE)

### 2.6 Motivation

- `goals` — `type`, `targetValue`, `periodStart`, `periodEnd`, `isActive`
- `achievements` — `key` unique, `title`, `description`, `unlockedAt`

### 2.7 `app_settings` (singleton `id = 1`)

`theme`, reminder fields, `streakTrackingEnabled`, `onboardingCompleted`, `reduceMotion`, `lastBackupAt`, `updatedAt`

### 2.8 `schema_migrations`

`version` PK, `name`, `applied_at` — audit trail alongside `user_version`

---

## 3. Integrity rules (application + SQL)

| Rule | Enforcement |
|------|-------------|
| `0 ≤ page ≤ totalPages` when `totalPages > 0` | Domain + `progressService` |
| Progress insert + book update atomic | `runInTransaction` |
| Delete progress recomputes `currentPage` | `removeProgressEntry` |
| Delete book cascades children | SQLite FK CASCADE |
| Clear all data | `CLEAR_ALL_USER_DATA_SQL` (keeps settings + schema) |

---

## 4. Testing

Node integration tests (`better-sqlite3` adapter) cover empty migrate, idempotent re-run, legacy upgrade, FK cascade, and clear-all SQL. See [TEST_STRATEGY.md](./TEST_STRATEGY.md).

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)  
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md)  
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)  
