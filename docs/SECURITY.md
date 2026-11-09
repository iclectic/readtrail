# Security and dependency notes

## Application risk profile

ReadTrail stores personal reading data locally. There is no cloud account in the current release path. Optional network calls are limited to Open Library metadata lookups initiated by the user.

## Hardening already in place

- No hardcoded production secrets in source
- Local SQLite with foreign keys and versioned migrations
- Input validation for pages, goals and backup payloads
- Optional camera / notification permissions requested only when features are enabled, with rationale copy
- Private notes are not sent to third-party AI services

## npm audit (this environment)

A recent `npm audit` reported **46** transitive vulnerabilities in the dependency tree (8 low, 18 moderate, 18 high, 2 critical). Many originate from tooling (Jest/ESLint/Expo transitive packages) rather than app runtime code paths.

**Do not run `npm audit fix --force` blindly** — it may introduce breaking Expo SDK changes.

### Recommended triage before store release

1. Re-run `npm audit` on the release candidate branch.
2. Prefer Expo-aligned upgrades (`npx expo install --fix`).
3. Review critical/high items that affect production runtime bundles.
4. Record accepted residual risk for dev-only tooling CVEs.

## Data export

Exports (JSON/CSV/Markdown) leave the device via the system share sheet. Users should treat shared files as sensitive personal data.

## Incident response (independent developer)

1. Fix and ship a patch build via EAS.
2. Increment version / build numbers.
3. Notify users in release notes if a privacy-impacting issue is found.
