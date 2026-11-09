# Play Data safety / Apple nutrition labels (draft answers)

Fill store questionnaires from this sheet. Revisit if network or AI features change.

## Summary posture

ReadTrail is offline-first. Core reading data stays on device. Optional Open Library lookups send only the search query or ISBN the user initiates. There is no account, no cloud sync, and no advertising SDK in the current release path.

## Data collected (Play Data safety)

| Category | Collected? | Shared? | Purpose | Notes |
|----------|------------|---------|---------|-------|
| Personal info (name, email) | No (in-app) | No | — | Feedback uses the system mail client; ReadTrail does not receive the message body on a server we operate |
| Location | No | No | — | |
| Financial info | No | No | — | |
| Health / fitness | No | No | — | |
| Messages | No | No | — | |
| Photos / videos | No* | No | App functionality | *User may attach a cover image stored locally; not uploaded by ReadTrail |
| Audio | No | No | — | |
| Files / docs | No* | No | App functionality | *Import/export files chosen by the user via system pickers/share sheet |
| Calendar / contacts | No | No | — | |
| App activity | No (off-device) | No | — | Optional local event counters stay on device |
| Web browsing | No | No | — | |
| App info / performance | No remote crash reporter yet | No | — | Optional future crash reporting needs a separate privacy update |
| Device IDs | No | No | — | |

### Data handling declarations

- **Encrypted in transit:** N/A for local SQLite; HTTPS for Open Library when the user searches.
- **Encrypted at rest:** Relies on OS device encryption; ReadTrail does not add a separate vault.
- **Users can request deletion:** Yes — Settings → Clear all data (local). No cloud account to delete.
- **Data is processed ephemerally** for catalogue lookups (request/response only).

## Apple App Privacy (nutrition)

| Type | Linked to user? | Used for tracking? | Purpose |
|------|-----------------|--------------------|---------|
| None collected by ReadTrail servers | — | — | Core product has no first-party analytics backend |
| Optional product interaction | No (on-device only) | No | Local diagnostics the user never syncs unless they export |

Declare **User Content** only if Apple requires local journal notes to be listed even when never transmitted. Prefer “Data Not Collected” for transmitted data when accurate; if Apple’s form forces local content disclosure, mark User Content → Product Personalisation / App Functionality, not linked, not used for tracking.

## Open Library third party

When the user searches or looks up an ISBN, the query string/ISBN is sent to Open Library. ReadTrail does not attach an account token. Document this under “optional network features” in the privacy policy.

## Camera / notifications

- Camera: ISBN barcode scanning only.
- Notifications: optional daily reminder; permission requested at enable time.
