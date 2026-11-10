# Accessibility checklist (ReadTrail)

Partial store-readiness pass. Device VoiceOver/TalkBack audits remain owner-side.

## Implemented in product UI

| Item | Approach |
|------|----------|
| Touch targets | `ensureMinTouchSize` / `touchTarget` (44pt) on primary controls |
| Button / chip / list roles | `accessibilityRole`, `accessibilityLabel`, selected state |
| Progress | `accessibilityRole="progressbar"` with percent label |
| Headers | Key screen titles use `accessibilityRole="header"` where applied |
| Reduce motion | Settings toggle; library/details skip `LayoutAnimation` when on |
| Dynamic Type | System scaling allowed with `maxFontSizeMultiplier={1.6}` on design-system text |

## Still to verify on device

- [ ] VoiceOver: add book → update progress → settings export
- [ ] TalkBack: same path on Android
- [ ] Largest Dynamic Type: library list and book details remain usable
- [ ] Contrast: light and dark palettes against WCAG AA for body text
- [ ] Focus order on forms (add book, goals)

## Pure helpers

- `src/utils/accessibility.ts` — touch size + font-scale clamp helper
- `src/theme/scaleTypography.ts` — optional token scaling utility (unit tested)
