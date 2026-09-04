# Epic AQNWtiB: Habit Management UI — Complete

**Completed:** 2026-09-04
**Verified by:** Independent review via `/peak-workflow:wrapup-epic AQNWtiB`

## What Was Built

The habit lifecycle on top of the persistence store: users add habits by name through the
"Add habit" input (Add button and Enter submit behave identically), see each new row
immediately with a streak badge, a "Done today" checkbox mount, and an Archive action, and
can retire habits via Archive and bring them back via Restore from the Archived filter —
with completion history preserved in both directions. Inline validation errors for empty
and over-80-character names name the problem AND the next action, per the error-message
standard, and duplicate names are deliberately allowed as independent rows.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/habits.ts` | Store actions: `addHabit` (trim + validate + create), `archiveHabit`, `restoreHabit` — each persists through `updateState` |
| `src/ui/habit-form.ts` | Add-habit input + Add button + Enter submit; lazy inline `role="alert"` validation errors |
| `src/ui/habit-row.ts` | Row rendering: name, streak badge (0 until epic m1i25n4), "Done today" checkbox mount, Archive/Restore action |
| `src/app.ts` | List rendering with All/Active/Archived filter visibility, re-render on every mutation and filter change |
| `src/styles.css` | `.habit-row`, `.habit-name`, `.streak-badge`, `.habit-action`, `.form-error` styles |
| `src/lib/habits.test.ts` | 9 store-level tests mirroring the TOR Gherkin |
| `src/ui/habit-form.test.ts` | 7 form-level tests (submit paths, validation, trimming) |
| `src/app.test.ts` | 5 new UI-level tests (add row shape, reload, duplicates, archive, restore) |

## Key Decisions

- The "Done today" checkbox and streak badge are intentional unwired mounts in this epic;
  the toggle engine, TOR-03 coverage, and real streak computation land with epic m1i25n4.
  Until then the badge shows 0, which is correct for every habit this epic can create
  (no completions are possible through the UI yet).
- Filter behavior is deliberately minimal (row visibility per All/Active/Archived view);
  the full filtering/views epic is XDc5Tpp.
- The form's validation error element is created lazily and removed when cleared, so the
  shell never carries a dormant `[role="alert"]` that recovery-banner selectors could
  mistake for a real alert (pre-existing TOR-01/06 tests depend on this).
- Duplicate habit names are allowed per PV §6; independence of duplicate rows is verified
  at the state level (`src/lib/habits.test.ts:81`) since no UI path in this epic can
  create a completion — same phase-decomposition precedent as C1R8qkJ's row-rendering
  deferral.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-02-XOoULU3 | `docs/requirements/02-habit-management.feature.md` | PASS | `src/app.test.ts:293`, `src/ui/habit-form.test.ts:71` |
| TOR-02-w9nrh1o | `docs/requirements/02-habit-management.feature.md` | PASS | `src/ui/habit-form.test.ts:87` |
| TOR-02-G8b7pmU | `docs/requirements/02-habit-management.feature.md` | PASS | `src/app.test.ts:311`, `src/lib/habits.test.ts:30` |
| TOR-02-flxKIoM | `docs/requirements/02-habit-management.feature.md` | PASS | `src/ui/habit-form.test.ts:113`, `src/lib/habits.test.ts:46` |
| TOR-02-lMWubKc | `docs/requirements/02-habit-management.feature.md` | PASS | `src/ui/habit-form.test.ts:135`, `src/lib/habits.test.ts:54` |
| TOR-02-f9diV8o | `docs/requirements/02-habit-management.feature.md` | PASS | `src/app.test.ts:324`, `src/lib/habits.test.ts:63,81` |
| TOR-02-c7UnNH0 | `docs/requirements/02-habit-management.feature.md` | PASS | `src/app.test.ts:376`, `src/lib/habits.test.ts:124` |
| TOR-02-E0o3IbX | `docs/requirements/02-habit-management.feature.md` | PASS | `src/app.test.ts:401`, `src/lib/habits.test.ts:141` |

## Verification Summary

### Counts
- TOR Requirements: 8/8 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 49 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-02-XOoULU3 / TOR-02-w9nrh1o — add via button and via Enter both verified live in
  the browser: row appears immediately with correct shape (name, streak 0, unchecked
  checkbox, Archive), input cleared (`src/ui/habit-form.ts:54` shared submit path,
  `src/app.test.ts:293`)
- ✅ TOR-02-flxKIoM / TOR-02-lMWubKc — empty and 81-character submissions show inline
  errors naming the problem AND the next action; exactly 80 characters accepted; verified
  live in the browser (`src/ui/habit-form.ts:60-72`, `src/lib/habits.ts:26-35`)
- ✅ TOR-02-c7UnNH0 / TOR-02-E0o3IbX — archive removes the row from the Active view and
  flips `archived` in storage; Restore from the Archived filter returns the row to Active
  with `archived: false`; verified live in the browser
  (`src/lib/habits.ts:55-85`, `src/app.ts:56-65`)
- ✅ TOR-02-G8b7pmU / TOR-02-f9diV8o — added habits survive a page reload and duplicate
  names render as two independent rows with distinct ids; verified live in the browser
  (`src/lib/habits.ts:26`, `src/app.test.ts:311,324`)
- ✅ Quality gates — `npm run lint` (0 errors), `npm run build` (tsc + vite, no type
  errors), `npm test` (49/49 pass), browser console clean (only a pre-existing favicon
  404 unrelated to this epic)
- ✅ Code review — error handling follows the error-message standard, storage failures
  route through the C1R8qkJ recovery-banner path, no security surface (no eval, no
  secrets, all input used as text content), consistent with `docs/architecture.md`
  §6 localStorage patterns and `docs/design-notes.md` mutation-routing notes

### Conclusion
Every TOR was verified twice: at the test level (49/49 suite pass, with tests whose
Given/When/Then comments mirror the feature file scenarios) and by independent live
browser verification against the dev server exercising each scenario with real
interactions. The two documented deviations (streak badge placeholder, state-level
duplicate independence) are correct consequences of the phase decomposition into epic
m1i25n4 and do not weaken any observable requirement of this epic.

### Manual verification performed: No
(User was away from the desk during wrapup; disclosure could not be collected. The
independent reviewer's own live browser verification of all eight TOR scenarios was
performed in place of user manual testing, and the implementer's handoff records a prior
browser-use pass against the dev server.)

## Known Issues / Follow-ups

- Streak badge renders a hardcoded 0 and the "Done today" checkbox is an unwired mount —
  both are epic m1i25n4 scope (check-in toggle, TOR-03 coverage, real streak engine).
- Filter behavior is minimal row visibility; the full filtering/views epic is XDc5Tpp.
- Pre-existing favicon.ico 404 in the browser console (cosmetic, predates this epic).
- Duplicate-row independence is verified at the state level only until epic m1i25n4 wires
  the check-in toggle, at which point the interaction-level independence should be
  re-verified.
