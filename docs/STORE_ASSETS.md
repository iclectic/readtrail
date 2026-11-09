# Store assets checklist

Preparation notes for Google Play and Apple App Store. **Do not submit builds or spend on accounts without explicit authorisation.**

## Application identity

| Item | Value |
|------|-------|
| Display name | ReadTrail |
| iOS bundle ID | `com.iclectic.readtrail` |
| Android package | `com.iclectic.readtrail` |
| Version | `1.0.0` (see `app.json`) |

## Icons and splash

Present in `assets/`:

- `icon.png`
- `adaptive-icon.png`
- `splash-icon.png`
- `favicon.png`

Splash / adaptive background colour aligned to paper token `#F7F3EC`.

## Screenshots still required

Capture on real devices or simulators (phone + tablet where required):

1. Library with covers and status filters
2. Book details + progress
3. Reading session timer
4. Stats / annual report
5. Discover search
6. Settings / privacy summary

## Copy drafts (British English)

**Short description:**  
Offline reading companion for your library, progress, notes and goals.

**Full description (draft):**  
ReadTrail helps you track the books you are reading, log sessions, keep a private journal, set gentle goals and revisit meaningful notes — all on your device. Catalogue search and ISBN scanning are optional. Export your data whenever you like. No account is required for offline use.

## Privacy

- Draft notice: `docs/PRIVACY.md`
- Host a public URL before store submission
- Camera permission: ISBN barcode scanning only
- Notifications permission: optional daily reading reminder

## Support

- Email: `support@readtrail.app` (confirm mailbox before release)

## Remaining blockers for submission

- [ ] Public privacy policy URL
- [ ] Screenshot set for both stores
- [ ] Production signing credentials / EAS project linkage
- [ ] Age rating questionnaire answers
- [ ] Explicit authorisation to submit and incur store fees
