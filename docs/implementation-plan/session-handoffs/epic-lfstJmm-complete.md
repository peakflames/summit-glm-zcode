# Epic lfstJmm: Row UI Parity — Done Toggle, Streak Caption & Help Hint — Complete

**Completed:** 2026-09-05
**Verified by:** Independent review via `/peak-workflow:wrapup-epic lfstJmm`

## What Was Built

The daily check-in now feels like a deliberate button: each habit row's control is a
"Done today" / "Done ✓" toggle button (neutral outlined when undone, success green when
done, never the flame accent), every streak badge carries a mono "DAY STREAK" caption
directly beneath the number, and the Active view shows a one-line help hint teaching the
streak-continuation and honest-reset rule. Behavior, data model, and dependencies are
untouched — `toggleToday`, the streak engine, and persistence are exactly as Epic
m1i25n4 left them, and the full suite stayed green as the regression signal.

## Key Files

| File | Purpose |
|------|---------|
| `src/ui/habit-row.ts` | Checkbox → `<button type="button" aria-pressed>` toggle ("Done today"/"Done ✓", `pf-btn--secondary` + Summit done treatment); streak badge restructured into `.streak-number` + `.streak-caption` ("DAY STREAK") |
| `src/ui/habit-list.ts` | Active-only help hint (`p.habit-help-hint.pf-hint`) rendered above rows/empty state; region cleared via `replaceChildren` before each render |
| `src/styles.css` | `.streak-number`/`.streak-caption` (mono caption ramp), `.habit-help-hint` layout, `.habit-done-btn[aria-pressed='true']` success-green treatment via `--status-success`; obsolete `.habit-done` checkbox rules removed |
| `src/app.test.ts` | Checkbox selections → toggle button (`aria-pressed`/label); badge assertions retargeted to `.streak-number`; empty-state assertions scoped to `.empty-state` |
| `src/ui/habit-list.test.ts` | DAY STREAK caption on every row (active + archived), hint present on Active (exact wording, first element), absent on Archived/All, removed on re-render |
| `src/ui/design-system.test.ts` | TOR-07-OgGR571 contract: neutral outlined undone (`pf-btn--secondary`), success-green done (`--status-success`, never `--accent`/`pf-btn--primary`) at class and source level |

## Key Decisions

- The toggle button reuses the existing `onToggle` callback path unchanged — the row
  remains a pure function of the habit, with pressed state derived from
  `habit.completions.includes(todayLocalDate())`.
- The done-state treatment is Summit CSS on `.habit-done-btn[aria-pressed='true']`
  layered over the vendored `pf-btn--secondary`; the Add button stays the sole
  flame-accented control (TOR-07-EXjNoVz one-hot-element rule).
- The help hint is rendered inside the list region as its first element (before rows or
  the empty state), keyed on the `active` filter only — absent on Archived and All.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-03-WUQGIE9 | `docs/requirements/03-daily-checkin.feature.md` | PASS | src/app.test.ts:594 |
| TOR-03-M5RmMBx | `docs/requirements/03-daily-checkin.feature.md` | PASS | src/app.test.ts:620 |
| TOR-02-XOoULU3 | `docs/requirements/02-habit-management.feature.md` | PASS | src/app.test.ts:310 |
| TOR-04-Ft8iQbI | `docs/requirements/04-streaks.feature.md` | PASS | src/app.test.ts:651 |
| TOR-04-rknaMfI | `docs/requirements/04-streaks.feature.md` | PASS | src/ui/habit-list.test.ts:117 |
| TOR-04-HiRBSAa | `docs/requirements/04-streaks.feature.md` | PASS | src/ui/habit-list.test.ts:132 |
| TOR-07-OgGR571 | `docs/requirements/07-visual-design.feature.md` | PASS | src/ui/design-system.test.ts:129,157 |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (tests, lint, build, live browser + console)
- Tests: 110 passed, 0 skipped, 0 failed (12 files)

### Highlights
- ✅ TOR-03-WUQGIE9 / TOR-03-M5RmMBx — toggle records/undo verified in tests
  (src/app.test.ts:594, :620) and live: storage gained/lost exactly one today-entry,
  state survived reload, badge recomputed.
- ✅ TOR-02-XOoULU3 — new row renders complete immediately: unpressed "Done today"
  button, badge 0, Archive action, input cleared (src/app.test.ts:310).
- ✅ TOR-04-Ft8iQbI — badge updated 0→1 on the same rendered page, no reload
  (src/app.test.ts:651 asserts list-element identity; live-confirmed).
- ✅ TOR-04-rknaMfI — "DAY STREAK" caption beneath the number on every badge, active
  and archived rows alike (src/ui/habit-list.test.ts:117).
- ✅ TOR-04-HiRBSAa — hint with exact TOR wording, first element in the list region on
  Active; absent on Archived and All (src/ui/habit-list.test.ts:132-172).
- ✅ TOR-07-OgGR571 — done state success green (`--status-success` = rgb(78,154,107));
  at-rest undone state neutral outlined (transparent bg + `--border-strong`); neither
  state uses `--accent`/`pf-btn--primary` (src/ui/design-system.test.ts:129-162). The
  ember tint observed mid-session on the undone button was the vendored
  `pf-btn--secondary:hover` rule with the pointer parked on the button — at rest it is
  neutral.

### Conclusion
All 7 TOR requirements were independently confirmed: unit/DOM tests mirror each Gherkin
scenario faithfully, the full suite is green (110/110), lint and build are clean, and the
live browser pass reproduced the Given/When/Then behavior with real clicks against
`npm run dev`. The store, streak engine, and persistence were verified untouched,
matching the epic's scope declaration.

### Manual verification performed: No

## Known Issues / Follow-ups

- None new from this epic. Pre-existing cosmetic item carried from earlier epics: a
  favicon 404 on first page load (noted in AQNWtiB/m1i25n4 handoffs).
