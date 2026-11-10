# Changelog

All notable changes to ReadTrail are documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — Unreleased (candidate)

First public offline-first release candidate.

### Added

- Personal library with tags, collections, covers, ISBN entry and barcode scan
- Progress tracking with validation, history and transactional updates
- Reading sessions, journal notes, Reading Memory, goals and achievements
- Stats, reading calendar, charts and annual report share image
- Discover: Open Library catalogue search and local recommendations
- Backup: JSON, CSV and Markdown notes export/import
- Dark mode, reduce motion, Dynamic Type cap, local daily reminders
- In-app privacy notice and hostable public privacy page
- Soft backup reminder (`lastBackupAt`)
- Error boundary and bootstrap retry
- CI (typecheck, tests, lint), Maestro smoke stubs, SQLite migration tests

### Security / privacy

- Offline-first; no account required for core use
- Optional network limited to user-initiated Open Library lookups
- iOS encryption export compliance declared (`ITSAppUsesNonExemptEncryption: false`)

### Security

- Expo 54 patch alignment; npm audit triage with accepted residual tooling advisories (see `docs/SECURITY.md`)

### Accessibility

- Stronger labels on goals, sessions, notes, onboarding and memory; form error live regions
- Chip targets meet 44pt; WCAG AA contrast checks for light/dark body text tokens
- Phone-first 1.0 (`ios.supportsTablet: false`)
- Add/edit book, collections, duplicates, barcode scan, tag editor, note editor and Settings labels

### Release tooling

- `npm run preflight` — verify + screenshot check + security audit + owner go/no-go report

### Legal

- Proprietary repository `LICENSE` (all rights reserved; not licensed for reuse)

### Store assets

- Phone screenshot set (`store/screenshots/en-GB/`, 1080×2400) captured from shipping UI

### Known owner follow-ups

- Confirm support mailbox; authorise EAS/store submission (`EXPO_TOKEN` + store credentials)
- Optional: cleaner privacy host than jsDelivr; optional open-source licence later; physical-device screenshot polish
