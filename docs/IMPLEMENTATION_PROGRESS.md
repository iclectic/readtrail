# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 engineering on `main`

Privacy URL, screenshot pack, security audit, accessibility/phone-first, and owner preflight merged or in flight.

### Owner preflight

- [x] `npm run preflight` — verify + screenshots check + security audit + go/no-go report

### Form / secondary-screen a11y

- [x] Add/edit book radiogroups + form header
- [x] Collections, duplicates, barcode scanner, tag editor labels
- [x] Note editor type radiogroup + favourite / memory hints

---

## Current

**Engineering track ready.** Remaining work is owner-gated (see `npm run preflight` / [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md)):

1. Capture phone screenshots into `store/screenshots/en-GB/`
2. Choose and add a repository licence
3. Confirm `support@readtrail.app` mailbox
4. Link EAS + authorise production builds/submit
5. Device VoiceOver / TalkBack smoke

---

## Remaining (deferred product)

- [ ] Optional AI features
- [ ] Cloud sync / social
- [ ] Optional: cleaner privacy host than jsDelivr
- [ ] Optional: re-enable iPad with tablet screenshots

---

## Test results

| Check | Result |
|-------|--------|
| `npm run preflight` | Passed (engineering OK; 6 owner items open) |

---

## Next recommended action

Owner: run `npm run preflight`, capture screenshots, pick a licence, then authorise EAS.
