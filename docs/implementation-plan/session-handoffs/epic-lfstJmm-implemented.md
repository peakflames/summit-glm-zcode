# Epic lfstJmm: Row UI Parity — Done Toggle, Streak Caption & Help Hint — Implemented

**Implemented:** 2026-09-05
**Branch:** `feature/epic-lfstJmm-row-ui-parity` (from `develop`)

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
| `src/app.test.ts` | Checkbox selections → toggle button (`aria-pressed`/label); badge assertions retargeted to `.streak-number`; empty-state assertions scoped to `.empty-state` (hint now precedes it on Active) |
| `src/ui/habit-list.test.ts` | New: DAY STREAK caption on every row (active + archived), hint present on Active (exact wording, first element), absent on Archived/All, removed on re-render |
| `src/ui/design-system.test.ts` | New TOR-07-OgGR571 contract: neutral outlined undone (`pf-btn--secondary`), success-green done (`--status-success`, never `--accent`/`pf-btn--primary`) at class and source level |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|----------------|--------|
| — (no deviations) | | | |

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference | Impl Reference |
|--------|--------------|---------|----------------|----------------|
| TOR-03-WUQGIE9 | 03-daily-checkin.feature.md | PASS | src/app.test.ts:594 (record/persist/reload) | src/ui/habit-row.ts:34-43, src/lib/habits.ts (toggleToday, untouched) |
| TOR-03-M5RmMBx | 03-daily-checkin.feature.md | PASS | src/app.test.ts:620 (undo + recompute) | src/ui/habit-row.ts:34-43 |
| TOR-02-XOoULU3 | 02-habit-management.feature.md | PASS | src/app.test.ts:310 (new row: unpressed "Done today" button) | src/ui/habit-row.ts:34-43 |
| TOR-04-Ft8iQbI | 04-streaks.feature.md | PASS | src/app.test.ts:651 (same-element badge 0→1, no reload) | src/app.ts:54-58 (render path, untouched) |
| TOR-04-rknaMfI | 04-streaks.feature.md | PASS | src/ui/habit-list.test.ts:117 (caption on all rows) | src/ui/habit-row.ts:59-70, src/styles.css:158 |
| TOR-04-HiRBSAa | 04-streaks.feature.md | PASS | src/ui/habit-list.test.ts:132,146,157,168 | src/ui/habit-list.ts:44-73 |
| TOR-07-OgGR571 | 07-visual-design.feature.md | PASS | src/ui/design-system.test.ts:129,157 | src/styles.css:177-184, src/ui/habit-row.ts:34 |

Regression (shared ownership, m1i25n4-owned, store behavior untouched): TOR-03-zr7VepE and
TOR-03-albP5kN remain green — see `src/app.test.ts` toggle/idempotence tests and
`src/lib/streaks.test.ts` in the passing full suite.

## Verification Results

### Quality Gates
- **Lint:** PASS — `npm run lint` clean
- **Build:** PASS — `npm run build` (tsc + vite) clean
- **Tests:** PASS — 110/110 (12 files), up from 77 at the m1i25n4 baseline; 0 failed
- **Browser verification:** PASS — live pass against `npm run dev` with real clicks

### Browser Pass Highlights
- Add flow: new row shows unpressed "Done today" button, badge 0 with "DAY STREAK"
  caption, Archive action (TOR-02-XOoULU3)
- Toggle on: button → "Done ✓" (success green `rgb(78, 154, 107)` = `--status-success`),
  aria-pressed true, badge 0→1 instantly on the same rendered page, storage gained exactly
  one `2026-09-05` local-date entry; survived reload (TOR-03-WUQGIE9, TOR-04-Ft8iQbI)
- Toggle off: back to neutral outlined "Done today" (transparent background + strong
  border at rest), storage emptied, badge recomputed (TOR-03-M5RmMBx)
- Hint: visible above the Active list with exact TOR wording; absent on Archived and All;
  re-appears when switching back (TOR-04-HiRBSAa)
- Add button remained the sole flame-accented control in every state (TOR-07-OgGR571,
  TOR-07-EXjNoVz)
- Console: 0 errors, 0 warnings (startup INFO line only)

## Known Issues / Follow-ups

- None new. The pre-existing favicon 404 on first page load (noted in AQNWtiB/m1i25n4
  handoffs) was not observed as an error in the console pass but remains an open cosmetic
  item from earlier epics.
