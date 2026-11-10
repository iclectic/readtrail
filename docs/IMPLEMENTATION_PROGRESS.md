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
- [x] Settings section headers, theme radiogroup, switch checked state

### Proprietary licence (this stage)

- [x] Root `LICENSE` (all rights reserved; matches prior README posture)

---

## Current

**Engineering track ready.** Remaining work is owner-gated (see `npm run preflight` / [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md)):

1. Capture phone screenshots into `store/screenshots/en-GB/`
2. Confirm `support@readtrail.app` mailbox
3. Link EAS + authorise production builds/submit
4. Device VoiceOver / TalkBack smoke

---

## Remaining (deferred product)

- [ ] Optional AI features
- [ ] Cloud sync / social
- [ ] Optional: cleaner privacy host than jsDelivr
- [ ] Optional: re-enable iPad with tablet screenshots
- [ ] Optional: switch to an open-source licence later

---

## Test results

| Check | Result |
|-------|--------|
| `npm run preflight` | Passed (engineering OK; licence OK; 5 owner items open) |

---

## Next recommended action

Owner: run `npm run preflight`, capture screenshots, confirm support mailbox, then authorise EAS.
