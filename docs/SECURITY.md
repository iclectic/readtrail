# Security and dependency notes

## Application risk profile

ReadTrail stores personal reading data locally. There is no cloud account in the current release path. Optional network calls are limited to Open Library metadata lookups initiated by the user.

## Hardening already in place

- No hardcoded production secrets in source
- Local SQLite with foreign keys and versioned migrations
- Input validation for pages, goals and backup payloads
- Optional camera / notification permissions requested only when features are enabled, with rationale copy
- Private notes are not sent to third-party AI services

## npm audit triage (10 November 2026, Europe/London)

Re-run on `main` after screenshot pack merge. **Do not run `npm audit fix --force`** — npm proposes Expo 52, which would break SDK 54.

### Actions taken

| Change | Result |
|--------|--------|
| `npx expo install` align `expo` → `~54.0.37` / `expo-file-system` → `~19.0.24` | Expo-aligned patch bump |
| `npm audit fix` (no `--force`) | Cleared critical/high tooling CVEs where non-breaking |
| `package.json` `overrides` for `postcss` `^8.5.23` | Clears PostCSS high in Metro/CLI tree |
| `image-size` left on Metro’s `1.2.1` | `image-size@^2` breaks Metro asset transform; accepted residual **high** until Expo upgrades Metro |

### Current residual (accepted for 1.0)

`npm audit` after triage: **25** findings (**7** low, **17** moderate, **1** high from Metro `image-size`, **0** critical).

Remaining items are transitive Expo / TypeScript-ESLint / Jest tooling packages. Fixes require either:

- a breaking Expo SDK downgrade (rejected),
- waiting for upstream Expo 54 / Metro / typescript-eslint releases, or
- an `image-size` 2.x that Metro can consume (not yet)

None of the residual advisories are treated as production mobile-runtime blockers for the offline-first app binary. Re-triage when moving to the next Expo SDK.

### Commands

```bash
npm run audit:security   # fails only on critical (expect exit 0 after this triage)
npm audit                # full report
```

## Data export

Exports (JSON/CSV/Markdown) leave the device via the system share sheet. Users should treat shared files as sensitive personal data.

## Incident response (independent developer)

1. Fix and ship a patch build via EAS.
2. Increment version / build numbers.
3. Notify users in release notes if a privacy-impacting issue is found.
