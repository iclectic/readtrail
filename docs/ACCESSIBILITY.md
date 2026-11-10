# Accessibility checklist (ReadTrail)

Partial store-readiness pass. Device VoiceOver/TalkBack audits remain owner-side.

## Implemented in product UI

| Item | Approach |
|------|----------|
| Touch targets | `ensureMinTouchSize` / `touchTarget` (44pt) on Button, Chip, and primary controls |
| Button / chip / list roles | `accessibilityRole`, `accessibilityLabel`, selected / disabled / busy state |
| Form fields | `TextField` exposes label, error hint, and polite live-region alerts |
| Progress | `accessibilityRole="progressbar"` with percent label |
| Headers | Key screen titles use `accessibilityRole="header"` (Goals, session, onboarding, memory, …) |
| Goals / notes / session | Goal cards summarised; note rows labelled; session timer live region |
| Add/edit book | Form header; status/format/ownership radiogroups; loading progress |
| Collections / duplicates | Row summaries; delete/merge actions named with context |
| Barcode scan | Permission + viewfinder labels; torch and lookup live region |
| Tags | Header + remove hint on selected chips |
| Note editor | Header, type radiogroup, favourite / Reading Memory hints |
| Reduce motion | Settings toggle; library/details skip `LayoutAnimation` when on |
| Dynamic Type | System scaling allowed with `maxFontSizeMultiplier={1.6}` on design-system text |
| Contrast (tokens) | Unit-tested WCAG AA for body/muted ink on paper (light + dark) via `contrastRatio` |

## Phone-first 1.0

`ios.supportsTablet` is **false** for the initial store cut so iPad screenshots and tablet layout QA are not required. Re-enable later with tablet screenshots if desired.

## Still to verify on device

- [ ] VoiceOver: add book → update progress → settings export
- [ ] TalkBack: same path on Android
- [ ] Largest Dynamic Type: library list and book details remain usable
- [ ] Focus order on forms (add book, goals)
- [ ] Confirm chip rows wrap comfortably at largest text

## Pure helpers

- `src/utils/touchTarget.ts` / `contrast.ts` — pure helpers (unit tested)
- `src/utils/accessibility.ts` — re-exports + font-scale clamp
- `src/theme/scaleTypography.ts` — optional token scaling utility (unit tested)
