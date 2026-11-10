# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 on `main`

Engineering stack + privacy URL + screenshot pack + security audit merged.

### Accessibility pass (this stage)

- [x] Contrast helpers + WCAG AA token tests (light/dark body text)
- [x] TextField error live regions; Button busy/disabled state; Chip 44pt targets
- [x] Goals, session timer, notes, onboarding, progress, memory labels/headers
- [x] Phone-first: `ios.supportsTablet: false` for 1.0 (no tablet screenshot set required)

---

## Current

Owner-gated launch items: device screenshots (phone), licence, support mailbox, EAS/store authorisation. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device + drop PNG screenshots
- [ ] Optional: GitHub Pages / Cursor host for cleaner privacy URL
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device VoiceOver / TalkBack / Dynamic Type audit
- [ ] Repository licence decision
- [ ] Optional: re-enable iPad with tablet screenshots

---

## Test results

| Check | Result |
|-------|--------|
| `npm run verify` | Passed (typecheck, 58 tests, lint) |
| `npm run audit:security` | Passed on prior stage (0 critical) |

---

## Next recommended action

Capture phone screenshots into `store/screenshots/en-GB/`, choose a repository licence, then authorise EAS when ready.
