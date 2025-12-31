# ReadTrail

ReadTrail is a small, offline first reading tracker built with Expo and React Native.

It is designed to be quick to use and easy to understand.
No accounts.
No syncing.
Just your library, your reading progress, and a simple history of updates stored locally on your device.

## What you can do

- **Add books** with title, author, total pages, and a reading status.
- **Update progress** (and optionally add a note) to build a progress history.
- **Search, filter, and sort** your library.
- **View reading stats** like streaks and recent activity.
- **Export your data** as JSON.
- **Clear all local data** if you want a fresh start.

## Tech stack

- **Expo** (SDK 54)
- **React Native**
- **TypeScript**
- **React Navigation**
  - Bottom tabs
  - Native stack for the Library flow
- **SQLite** via `expo-sqlite` (local on device)

## Getting started

### Requirements

- Node.js (LTS recommended)
- npm
- Expo Go (on your phone) or an iOS Simulator / Android emulator

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

Other handy commands:

```bash
npm run ios
npm run android
npm run web
```

## How the app is organised

If you are trying to understand the codebase, this is the high level map.

### Entry point

- `index.ts` registers the app with Expo.
- `App.tsx` is the real starting point.
  - It initialises the SQLite database (`initDb()`)
  - It seeds a few sample books in development (`seedDevData()`)
  - It mounts navigation (`<AppNavigation />`)

### Navigation

- `src/navigation/index.tsx` sets up the `NavigationContainer`.
- `src/navigation/RootTabs.tsx` defines the bottom tabs: Library, Stats, Settings.
- `src/navigation/LibraryStack.tsx` defines the Library stack:
  - LibraryHome
  - BookDetails
  - AddEditBook
  - UpdateProgress
- `src/types/navigation.ts` holds the TypeScript route param types.

### Database layer

The app uses a small repository pattern.
Screens call the repository functions, not raw SQL.

- `src/db/sqlite.ts`
  - Opens the database
  - Creates tables
  - Provides `runQuery`, `runWrite`, `runExec`
  - Contains `clearAllData()`
- `src/db/repositories/booksRepo.ts` (CRUD for books)
- `src/db/repositories/progressEntriesRepo.ts` (CRUD for progress entries)
- `src/db/index.ts` re-exports the db helpers and repositories

### Screens

- `src/screens/library/LibraryHomeScreen.tsx`
  - Lists books
  - Search, filter, sort
  - Pull to refresh
- `src/screens/library/BookDetailsScreen.tsx`
  - Book details
  - Progress history
  - Delete book
  - Delete a progress entry
- `src/screens/library/AddEditBookScreen.tsx`
  - Add or edit a book
- `src/screens/library/UpdateProgressScreen.tsx`
  - Add a progress entry and update the book’s current page
- `src/screens/library/StatsScreen.tsx`
  - Reading stats derived from your local data
- `src/screens/settings/SettingsScreen.tsx`
  - Export JSON
  - Clear all local data
  - Rate app (placeholder until published)
  - Contact and feedback

### Utilities

- `src/utils/logger.ts` wraps console logging so noisy logs do not end up in production builds.
- `src/utils/formatDate.ts` formats ISO timestamps into a readable date.
- `src/utils/haptics.ts` provides small haptic helpers used on key actions.

## Data and privacy

All data is stored locally on your device in SQLite.

- No authentication
- No network requests
- No cloud sync

If you export your data, it is saved as a JSON file and shared using the native share sheet.

## Development notes

### Seeding sample data

In development, the app will insert a few sample books the first time it runs.
See `src/db/seedDev.ts`.

### Common troubleshooting

- **Port already in use**: Expo might tell you that `8081` is already running.
  - You can accept the suggested alternative port.
- **Metro cache oddities**: If you see a strange runtime error after changes, try:

```bash
npx expo start --clear
```

## Builds (EAS)

This project includes an `eas.json` with `development`, `preview`, and `production` profiles.

If you use EAS, you can build with something like:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

(You will need EAS CLI set up and an Expo account for builds and store submissions.)

## Licence

No licence has been added yet.
If you plan to open source this, add a licence file and update this section.
