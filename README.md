# ReadTrail

ReadTrail is an offline-first reading companion for Android and iOS, built with Expo and React Native.

It helps you build a personal library, track progress and sessions, keep a reading journal, set goals, and review insights — without requiring an account for core use.

## What you can do

- **Library** — add books manually or look up titles/ISBNs; organise by status, format, ownership, genre, tags and collections
- **Progress** — page updates with validation, history, and automatic status changes
- **Sessions** — timed reading sessions with duration tracking
- **Journal** — notes, quotations and reflections attached to books
- **Goals** — daily, weekly, monthly and annual targets you control
- **Insights** — streaks, pages advanced, reading time, formats and authors
- **Discover** — catalogue search plus personal recommendations from your own library
- **Backup** — export and import a full JSON backup
- **Privacy** — data stays on device unless you export it; catalogue lookup is optional

## Tech stack

- Expo SDK 54 · React Native · TypeScript
- React Navigation (tabs + native stack)
- SQLite via `expo-sqlite` with versioned migrations
- Jest unit tests · ESLint · GitHub Actions CI

## Getting started

### Requirements

- Node.js LTS
- npm
- Expo Go, or iOS Simulator / Android emulator

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

### Quality checks

```bash
npm run typecheck
npm test
npm run lint
```

## Project map

- `App.tsx` — bootstrap (await DB), theme, onboarding, navigation
- `src/domain/` — pure business rules (progress, streaks, goals, analytics)
- `src/db/` — SQLite, migrations, repositories
- `src/services/` — progress/session/backup/metadata/recommendations
- `src/theme/` · `src/components/` — design system
- `src/screens/` — Library, Discover, Goals, Stats, Settings, Notes, Onboarding
- `docs/` — architecture, audit, roadmap, database design, test strategy, release checklist, progress

## Data and privacy

All core reading data is stored locally in SQLite.

- No authentication required for offline use
- No cloud sync in the current release path
- Optional Open Library requests only when you search or look up an ISBN
- Export creates a JSON file shared via the system share sheet

## Builds (EAS)

`eas.json` includes `development`, `preview` and `production` profiles.

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

Do not submit to stores or change production credentials without explicit authorisation.

## Licence

No licence has been added yet. Until one is added, assume the project is not licensed for reuse.
