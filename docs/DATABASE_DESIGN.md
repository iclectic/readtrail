# ReadTrail database design

**Engine:** SQLite via `expo-sqlite` (`readtrail.db`)  
**Current migrations:** none (`CREATE TABLE IF NOT EXISTS` only)  
**Foreign keys:** enabled at init (`PRAGMA foreign_keys = ON`)

---

## 1. Current schema (verified)

Created in `src/db/sqlite.ts` → `initDb()`.

### 1.1 `books`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | TEXT | PRIMARY KEY NOT NULL | App-generated (`book_${timestamp}_${rand}`) |
| `title` | TEXT | NOT NULL | |
| `author` | TEXT | NOT NULL | May be empty string from UI trim |
| `totalPages` | INTEGER | NOT NULL | May be `0` |
| `status` | TEXT | NOT NULL | Intended: `reading` \| `paused` \| `finished`; **not enforced** |
| `currentPage` | INTEGER | NOT NULL | Denormalised; can drift vs history |
| `createdAt` | TEXT | NOT NULL | ISO-8601 |
| `updatedAt` | TEXT | NOT NULL | ISO-8601 |

Indexes: none beyond the primary key.

### 1.2 `progress_entries`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | TEXT | PRIMARY KEY NOT NULL | App-generated (`progress_…`) |
| `bookId` | TEXT | NOT NULL | FK → `books(id)` ON DELETE CASCADE |
| `page` | INTEGER | NOT NULL | No CHECK vs `books.totalPages` |
| `note` | TEXT | NOT NULL | Empty string allowed |
| `createdAt` | TEXT | NOT NULL | ISO-8601 |

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_progress_entries_bookId ON progress_entries(bookId);
```

### 1.3 What is missing today

- `PRAGMA user_version` management  
- `schema_migrations` (or equivalent) audit table  
- CHECK constraints / enums  
- Tables for sessions, notes, collections, tags, goals, settings, achievements  
- Composite uniqueness rules (e.g. tag names)

### 1.4 Integrity gaps in application behaviour

1. Progress insert + book update are **not** transactional.  
2. Deleting a progress row does **not** recompute `books.currentPage`.  
3. No guarantee `currentPage <= totalPages` when `totalPages > 0`.  
4. `status` accepts any string at the persistence layer.

---

## 2. Target schema

Target is evolutionary: migrate from the two-table schema without wiping user data. Column names below use **snake_case in SQL** going forward for new tables; existing camelCase columns on `books` / `progress_entries` may be retained for compatibility or renamed in a dedicated migration — pick one strategy and stick to it. Recommendation: **keep existing camelCase columns** on the two legacy tables; use snake_case on all new tables to reduce migration risk.

### 2.1 `schema_migrations` (optional audit) + `user_version`

Primary mechanism: SQLite `PRAGMA user_version`.

Optional companion table for human-readable history:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
```

`user_version` remains the source of truth for which migration to run next; the table is for debugging and support.

### 2.2 `books` (expanded)

Retain existing columns; add:

| Column | Type | Notes |
|--------|------|-------|
| `isbn` | TEXT NULL | Normalised ISBN-13 preferred |
| `cover_uri` | TEXT NULL | Local file URI (Phase 3) |
| `subtitle` | TEXT NULL | Optional |
| `publisher` | TEXT NULL | Optional |
| `published_year` | INTEGER NULL | Optional |
| `started_at` | TEXT NULL | Optional ISO date |
| `finished_at` | TEXT NULL | Optional ISO date |
| `notes_count` | INTEGER NOT NULL DEFAULT 0 | Optional denormalised counter |

Suggested CHECKs (when migrating):

```sql
-- Conceptual; exact migration may recreate table
CHECK (totalPages >= 0)
CHECK (currentPage >= 0)
CHECK (status IN ('reading', 'paused', 'finished'))
CHECK (totalPages = 0 OR currentPage <= totalPages)
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_updatedAt ON books(updatedAt);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
```

### 2.3 `progress_entries` (retained, tightened)

Keep as chronological page checkpoints. Optional later columns: `session_id`, `source` (`manual` \| `session`).

```sql
CREATE INDEX IF NOT EXISTS idx_progress_entries_bookId_createdAt
  ON progress_entries(bookId, createdAt DESC);
```

### 2.4 `reading_sessions`

```sql
CREATE TABLE reading_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  start_page INTEGER,
  end_page INTEGER,
  duration_seconds INTEGER,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_started_at ON reading_sessions(started_at);
```

### 2.5 `notes` (journal)

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  session_id TEXT,
  page INTEGER,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES reading_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_notes_book_id ON notes(book_id);
```

Progress `note` can remain for lightweight captions; longer journal content belongs here.

### 2.6 `collections` and `book_collections`

```sql
CREATE TABLE collections (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE book_collections (
  book_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  PRIMARY KEY (book_id, collection_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);
```

### 2.7 `tags` and `book_tags`

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE book_tags (
  book_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 2.8 `goals`

```sql
CREATE TABLE goals (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,              -- e.g. daily_pages, weekly_pages, yearly_books
  target INTEGER NOT NULL,
  window TEXT NOT NULL,            -- day | week | month | year
  starts_on TEXT NOT NULL,         -- ISO date
  ends_on TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  CHECK (target > 0),
  CHECK (active IN (0, 1))
);
```

Progress against goals is **computed** from sessions/progress, not stored as the sole source of truth (optional cache later).

### 2.9 `settings`

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Examples: `theme` = `system` \| `light` \| `dark`; `locale` = `en-GB`.

### 2.10 `achievements`

```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY NOT NULL,     -- stable code, e.g. streak_7
  unlocked_at TEXT NOT NULL,
  meta TEXT                         -- optional JSON
);
```

---

## 3. Migration strategy (`user_version`)

### 3.1 Rules

1. On open: read `PRAGMA user_version`.  
2. Apply ordered migrations where `version > current` inside a single transaction per migration.  
3. On success: set `PRAGMA user_version = N` and optionally insert into `schema_migrations`.  
4. Never change a shipped migration’s SQL; add a new version.  
5. App bootstrap **awaits** migrations before mounting UI (fixes today’s race).

### 3.2 Suggested version plan

| Version | Name | Changes |
|---------|------|---------|
| 0 | legacy | Current CREATE TABLE IF NOT EXISTS world (ships today without setting version — treat unknown as 0) |
| 1 | baseline_versioning | Ensure tables exist; set CHECKs if feasible; create `schema_migrations`; set `user_version = 1` |
| 2 | books_metadata | Add `isbn`, `cover_uri`, … nullable columns via `ALTER TABLE` |
| 3 | organisation | `collections`, `book_collections`, `tags`, `book_tags` |
| 4 | sessions_notes | `reading_sessions`, `notes` |
| 5 | goals_settings_achievements | `goals`, `settings`, `achievements` |
| 6+ | indexes_and_tighten | Additional indexes; optional table rebuilds for CHECKs on legacy tables |

Exact numbering can be adjusted, but **baseline versioning must land before** additive product tables.

### 3.3 Example runner sketch (not implemented)

```ts
// Pseudocode — target design only
const migrations = [
  { version: 1, name: 'baseline_versioning', up: async (db) => { /* … */ } },
  { version: 2, name: 'books_metadata', up: async (db) => { /* ALTER TABLE … */ } },
];

async function migrate(db) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;
  for (const m of migrations) {
    if (m.version <= current) continue;
    await db.execAsync('BEGIN');
    try {
      await m.up(db);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
      await db.execAsync('COMMIT');
      current = m.version;
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
  }
}
```

SQLite `ALTER TABLE` limitations apply: prefer additive nullable columns; use table-rebuild migrations when adding NOT NULL without defaults or CHECKs on existing tables.

---

## 4. Indexes (target set)

| Index | Purpose |
|-------|---------|
| `idx_progress_entries_bookId` | Exists today — history by book |
| `idx_progress_entries_bookId_createdAt` | Faster latest-entry lookups / recompute |
| `idx_books_status` | Library filters |
| `idx_books_updatedAt` | Default “recent” sort could move server-side later |
| `idx_books_isbn` | ISBN lookup / import dedupe |
| `idx_reading_sessions_book_id` / `_started_at` | Session history |
| `idx_notes_book_id` | Journal by book |

Avoid indexing every column; add indexes when query plans justify them.

---

## 5. Integrity rules (application + DB)

| Rule | Enforce in |
|------------------|
| `status ∈ {reading, paused, finished}` | Domain + CHECK when possible |
| `currentPage >= 0` | Domain + CHECK |
| `totalPages >= 0` | Domain + CHECK |
| If `totalPages > 0` then `currentPage <= totalPages` | Domain (+ CHECK if rebuilt) |
| Progress write updates `currentPage` atomically | Application transaction |
| Delete progress recomputes `currentPage` from remaining entries (MAX(page) or 0) | Application transaction |
| Deleting a book cascades sessions, notes, joins, progress | FK CASCADE |
| Tag/collection names unique | UNIQUE constraints |
| Settings keys unique | PK on `settings.key` |
| Export payload includes schema/app version | Application (Phase 6) |

---

## 6. Recompute policy for `currentPage`

Canonical rule after any progress mutation:

```text
currentPage = MAX(progress_entries.page) for book
              or 0 if no entries
```

Optional product rule: if `currentPage === totalPages && totalPages > 0`, set `status = 'finished'` and `finished_at` if unset. Must be explicit in application services so UI and imports behave consistently.

---

## 7. Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — persistence layer placement  
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md) — defect list tied to this schema  
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) — when tables land  
- [TEST_STRATEGY.md](./TEST_STRATEGY.md) — migration and invariant tests  
