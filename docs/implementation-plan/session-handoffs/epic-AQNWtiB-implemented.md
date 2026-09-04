# Epic AQNWtiB: Habit Management UI — Implemented

**Implemented:** 2026-09-04
**Next:** independent verification via `/peak-workflow:wrapup-epic AQNWtiB`

## What Was Built

The habit lifecycle on top of the persistence store: adding habits by name through the
"Add habit" input (Add button or Enter behave identically), inline validation for empty
and over-80-character names (each naming the problem AND the next action, rendered
adjacent to the input), deliberate duplicate-name support, and the archive/restore
lifecycle wired through minimal All/Active/Archived view filtering. All mutations flow
through the canonical `updateState` write-through path from Epic C1R8qkJ and persist
immediately.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/habits.ts` | Store actions: `addHabit` (trim + validate + create), `archiveHabit`, `restoreHabit` — each persists through `updateState` |
| `src/ui/habit-form.ts` | Add-habit input + Add button + Enter submit; lazy inline `role="alert"` validation errors |
| `src/ui/habit-row.ts` | Row rendering: name, streak badge (0 — real engine is m1i25n4), "Done today" checkbox mount, Archive/Restore action |
| `src/app.ts` | Full list rendering, minimal filter behavior, re-render on every mutation and filter change |
| `src/styles.css` | `.habit-row`, `.habit-name`, `.streak-badge`, `.habit-action`, `.form-error` styles |
| `src/lib/habits.test.ts` | 9 store-level tests mirroring the TOR Gherkin |
| `src/ui/habit-form.test.ts` | 7 form-level tests (submit paths, validation, trimming) |
| `src/app.test.ts` | 5 new UI-level tests (add row shape, reload, duplicates, archive, restore) |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|----------------|--------|
| TOR-02-f9diV8o | "completing a check-in on one row leaves the other row's completions and streak untouched" | Independence verified at the state level (distinct ids, independent `completions` arrays — `src/lib/habits.test.ts:81`); the check-in toggle itself is an unwired mount in the row | Phase decomposition: the toggle engine and TOR-03 coverage land in epic m1i25n4, which depends on this epic. No UI path in this epic can create a completion, so the state-level check is the strongest observable verification at this stage. Same precedent as C1R8qkJ's row-rendering deferral. |
| TOR-02-XOoULU3 | "a streak badge of 0" | Badge renders 0 unconditionally for now (`src/ui/habit-row.ts:14`) | The streak engine (`streaks.ts`) is epic m1i25n4 scope; 0 is the correct value for every habit this epic can create (no completions possible through the UI yet). |

## TOR Coverage

| TOR ID | Verdict | Test Reference | Implementation Reference |
|--------|---------|----------------|--------------------------|
| TOR-02-XOoULU3 | PASS | `src/app.test.ts:293` (row shape) + `src/ui/habit-form.test.ts:71` (submit path) | `src/app.ts:93` (render), `src/ui/habit-row.ts:18`, `src/ui/habit-form.ts:54` |
| TOR-02-w9nrh1o | PASS | `src/ui/habit-form.test.ts:87` (Enter ≡ Add) | `src/ui/habit-form.ts:81-85` (shared `submit` path) |
| TOR-02-G8b7pmU | PASS | `src/app.test.ts:311` (reload) + `src/lib/habits.test.ts:30` (stored doc) | `src/lib/habits.ts:26` via `updateState` write-through |
| TOR-02-flxKIoM | PASS | `src/ui/habit-form.test.ts:113` + `src/lib/habits.test.ts:46` | `src/lib/habits.ts:29-31` (reject), `src/ui/habit-form.ts:60-63` (message) |
| TOR-02-lMWubKc | PASS | `src/ui/habit-form.test.ts:135` + `src/lib/habits.test.ts:54` | `src/lib/habits.ts:10,33-35` (80-char limit), `src/ui/habit-form.ts:64-68` (message) |
| TOR-02-f9diV8o | PASS | `src/app.test.ts:324` (two rows) + `src/lib/habits.test.ts:63,81` (independence, state level) | `src/lib/habits.ts:26` (no uniqueness constraint), `src/ui/habit-row.ts:7` (distinct `data-habit-id`) |
| TOR-02-c7UnNH0 | PASS | `src/app.test.ts:376` (UI) + `src/lib/habits.test.ts:124` (state) | `src/lib/habits.ts:55` (`archiveHabit`), `src/app.ts:56-58` (active filter) |
| TOR-02-E0o3IbX | PASS | `src/app.test.ts:401` (UI) + `src/lib/habits.test.ts:141` (state) | `src/lib/habits.ts:61` (`restoreHabit`), `src/app.ts:58-60` (archived filter) |

## Verification Results

### Counts
- TOR Requirements: 8/8 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS

### Highlights
- ✅ `npm run lint` — PASS (0 errors)
- ✅ `npm run build` — PASS (tsc --noEmit + vite build, no type errors)
- ✅ `npm test` — PASS (49 tests, 0 failed; 28 pre-existing + 21 new)
- ✅ Browser check — PASS: exercised live at http://localhost:5173 — add via button and
  Enter, empty and 81-character inline errors (problem + next action), 80-character
  accepted, duplicate names as two rows, reload persistence, Archive removing the row
  from the Active view, Archived filter showing Restore, Restore returning the habit to
  Active, and the stored document remaining a clean v1 document (`schemaVersion: 1`)
  with `archived` flags flipped and completions untouched. No unexpected console errors;
  no error banners present in the normal flow.

### Manual verification performed: Yes (browser-use against the dev server)

## Notes for wrapup

- The "Done today" checkbox is an intentional unwired mount — its toggle logic, TOR-03
  coverage, and the streak badge's real computation (TOR-04) arrive with epic m1i25n4.
- Filter behavior is intentionally minimal (row visibility per All/Active/Archived);
  the full filtering/views epic is XDc5Tpp.
- Two test-infrastructure fixes made in `src/app.test.ts` while landing this epic:
  1. The pre-existing quota-failure test used `vi.spyOn(...).mockImplementation(...)`
     and relied on `vi.restoreAllMocks()` — which does **not** restore in this
     environment (vitest 5 + happy-dom 20), leaking the throwing `setItem` into every
     later test in the file. The test now restores via `spy.mockRestore()` in a
     `finally` (test semantics unchanged).
  2. The form's validation error element is created lazily and removed when cleared, so
     the shell never carries a dormant `[role="alert"]` element that could collide with
     the recovery-banner selectors in pre-existing TOR-01/06 tests.
