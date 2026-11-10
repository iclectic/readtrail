# ReadTrail implementation progress

Living tracker. Update when phases complete. **Do not mark work done without evidence in the repository.**

---

## Completed

### Offline 1.0 engineering

Merged to `main` via PR #10 (hardening through release assets).

### Pages enablement fix (this stage)

- [x] `actions/configure-pages` `enablement: true` so the deploy workflow can create the Pages site
- [x] Launch runbook updated post-merge

---

## Current

Owner-gated store launch: get privacy Pages live, set `PRIVACY_POLICY_URL`, screenshots, licence, EAS/store authorisation. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).

---

## Remaining

- [ ] Optional AI features (deferred)
- [ ] Cloud sync / social (deferred)
- [ ] Execute Maestro on simulator/device
- [ ] Confirm privacy Pages URL live + set `PRIVACY_POLICY_URL`
- [ ] Store screenshot capture on device
- [ ] Production signing / store submission (**needs explicit authorisation**)
- [ ] Real-device performance / a11y device audit
- [ ] Repository licence decision

---

## Test results

| Check | Result |
|-------|--------|
| Workflow / docs-only change | No app code change this stage |
| Prior `npm run verify` on main tip | Passed at release-assets merge |

---

## Next recommended action

1. Merge this Pages enablement PR (or enable Pages manually).  
2. Confirm `https://iclectic.github.io/readtrail/privacy/` loads.  
3. Set `PRIVACY_POLICY_URL` and continue the launch runbook.  
