# ReadTrail privacy notice (draft)

This draft supports store preparation. A hostable HTML copy lives at [`docs/site/privacy/index.html`](./site/privacy/index.html). Publish that folder to a public URL, then set `PRIVACY_POLICY_URL` in `src/config/release.ts`.

## Summary

ReadTrail is an offline-first personal reading companion. Core library, progress, notes, goals and statistics are stored locally on your device in SQLite.

## Data we store on device

- Book metadata you enter or import
- Reading progress, sessions and notes
- Goals, achievements and preferences
- Optional backup files you create
- Optional local product event counts that never leave the device unless you export files yourself

## Network use

- No account is required for offline reading tracking.
- If you choose **Search catalogues**, **Look up ISBN**, or **Scan barcode** with online lookup, ReadTrail requests metadata from Open Library.
- Feedback email opens your mail client; that is handled by the operating system.

## Sharing and export

- Export creates JSON, CSV or Markdown files you control via the system share sheet.
- Import replaces or merges local data only after explicit confirmation.

## Permissions

- Camera is used only to scan ISBN barcodes.
- Notifications are used only for an optional daily reading reminder you can disable at any time.
- Document picker access is used only when you import a backup or CSV.

## Artificial intelligence

ReadTrail does not send your private notes to third-party AI services. Any future AI feature will be optional and will require informed consent before private text leaves the device.

## Accounts

ReadTrail does not create user accounts for core use. There is no cloud account deletion flow because there is no cloud account. Clearing local data is available in Settings.

## Children’s privacy

ReadTrail does not knowingly collect personal information from children. Age ratings should follow store guidance for general productivity/lifestyle apps.

## Contact

support@readtrail.app

## Changes

We will update this notice when synchronisation, remote analytics or AI features are introduced. Optional cloud or AI features will require informed consent before private notes leave the device.
