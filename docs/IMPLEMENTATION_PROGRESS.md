# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 engineering on `main`

Privacy URL, screenshot pack tooling, security audit, accessibility/phone-first, owner preflight, proprietary licence.

### Store screenshots (this stage)

- [x] Captured six phone PNGs on Android emulator (1080×2400) from the shipping UI + demo seed
- [x] `npm run check:screenshots` passes
- [x] Metro-compatible dependency fix: drop `image-size@2` override (breaks asset transform); keep `postcss` override

---

## Current

Remaining work is **owner-only** (see `npm run preflight` / [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md)):

1. Confirm `support@readtrail.app` mailbox is monitored
2. Add `EXPO_TOKEN` / link EAS + production signing credentials
3. Explicitly authorise production build + store submit
4. Device VoiceOver / TalkBack smoke on a physical phone

Optional: enable GitHub Pages for a cleaner privacy URL (API enablement is 403 for this agent).

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
| `npm run verify` | Passed (typecheck, 60 tests, lint) |
| `npm run check:screenshots` | Passed (6/6 PNGs ≥ 1080×1920) |
| `npm run preflight` | Engineering OK; 4 owner items open |

---

## Next recommended action

Owner: confirm support mailbox, provide Expo token / store credentials, then authorise EAS build and submit.
