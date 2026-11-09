# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Phase 0–4 + hardening

- Audit docs, foundation, library/sessions/notes/goals/analytics/discover
- Reminders, ISBN scan, Reading Memory, bulk ops, duplicates, charts, annual report, covers

### Production polish

- [x] Book **tags** UI (editor, details chips, library filter)
- [x] **CSV** library export/import + **Markdown notes** export
- [x] In-app **Privacy** screen (Settings stack)
- [x] **Reading calendar** month view
- [x] Annual report **shareable PNG** via view-shot (plus text share)
- [x] Local privacy-conscious **analytics events** (on-device only)
- [x] Accessibility helpers (min touch targets, tab labels, headers)
- [x] `docs/SECURITY.md` dependency audit notes
- [x] `docs/VERIFICATION_REPORT.md`
- [x] Extra unit tests (CSV, tags)

### Release preparation (this stage)

- [x] Hostable privacy page (`docs/site/privacy/`)
- [x] Store listing copy pack (`STORE_LISTING.md`)
- [x] Data safety + age rating drafts
- [x] Screenshot capture guide + Maestro screenshot stubs
- [x] Feature graphic SVG draft
- [x] `src/config/release.ts` for privacy URL / store rate links
- [x] RELEASE_CHECKLIST refreshed to match shipped product

---

## Current

Owner-gated store launch steps: host privacy URL, capture screenshots, confirm support mailbox, choose repository licence, authorise EAS production builds and store submission.

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device
- [ ] Publish privacy page and set `PRIVACY_POLICY_URL`
- [ ] Store screenshot capture
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance benchmarks
- [ ] Repository licence decision

---

## Test results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Passed |
| `npm test` | Passed (32 tests) |
| `npm run lint` | Passed |
| Native builds / device E2E | Not executed here |

---

## Next recommended action

1. Merge polish (#3) then this release-prep PR.
2. Host `docs/site/privacy/` and paste the URL into `src/config/release.ts`.
3. Capture screenshots per SCREENSHOT_GUIDE.md.
4. Authorise EAS production builds when ready.
