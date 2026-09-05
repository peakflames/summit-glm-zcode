# Epic m1i25n4: Daily Check-in & Streaks — Complete

**Completed:** 2026-09-04
**Verified by:** Independent review via `/peak-workflow:wrapup-epic m1i25n4`

## What Was Built

Summit's daily ritual is now live: the "Done today" checkbox records and undoes today's
completion through an idempotent, local-date-keyed store action, and every habit row
renders a real current-streak badge computed from its completion history by a pure
streak engine implementing the normative PV §6 rule (consecutive days ending today,
yesterday-grace, else 0). Badges update instantly on toggle without a reload and
recompute correctly after an archive/restore round-trip.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/streaks.ts` | **New.** Pure streak engine: `localDateKey`, `todayLocalDate`, `addDays`, `currentStreak(completions, today?)` — the PV §6 rule as a pure, testable function |
| `src/lib/streaks.test.ts` | **New.** 12 pure unit tests: TOR-04 rule table verbatim, yesterday grace, zero clauses, local-date keying, addDays boundary rolls |
| `src/lib/habits.ts` | `toggleToday(id)` — idempotent add/remove of today's local date, persisted via `updateState`; reuses `HabitActionResult` error paths |
| `src/lib/habits.test.ts` | Store-level tests: record, undo, idempotence across reloads, local-date keying under fake timers, unknown-habit |
| `src/ui/habit-row.ts` | Checkbox reflects `completions.includes(today)` and fires `onToggle`; badge renders `currentStreak(habit.completions)` |
| `src/app.ts` | `onToggle` wired to `toggleToday` through the existing `runAction` re-render path — no reload |
| `src/app.test.ts` | UI-level tests: badge on every row, rule table from history, grace/zero renders, toggle record/undo/idempotence, same-element instant update, restored-habit recompute, duplicate-row independence |

## Key Decisions

- **Pure streak engine with injected `today`:** `currentStreak` accepts `today` as an
  optional parameter so every clause of the PV §6 rule is unit-testable without DOM,
  storage, or a global clock read.
- **Local-date keying via local `Date` fields, never `toISOString()`** — the stored key
  follows the user's wall calendar regardless of UTC offset (TOR-03-albP5kN).
- **Idempotence by membership check:** `toggleToday` filters on today's key inside the
  `updateState` mutation, so repeated toggles and reloads can never duplicate an entry.
- **Test-environment neutrality for the late-evening scenario:** the 23:30 local-time
  test pins local wall-clock fields and asserts the local key instead of a specific UTC
  offset, keeping the suite correct on any CI machine.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-03-WUQGIE9 | 03-daily-checkin.feature.md | PASS | src/lib/habits.test.ts:204, src/app.test.ts:574 |
| TOR-03-M5RmMBx | 03-daily-checkin.feature.md | PASS | src/lib/habits.test.ts:220, src/app.test.ts:590 |
| TOR-03-zr7VepE | 03-daily-checkin.feature.md | PASS | src/lib/habits.test.ts:240, src/app.test.ts:603 |
| TOR-03-albP5kN | 03-daily-checkin.feature.md | PASS | src/lib/streaks.test.ts:54, src/lib/habits.test.ts:257 |
| TOR-04-5xu6Aag | 04-streaks.feature.md | PASS | src/app.test.ts:490 |
| TOR-04-cS2CaLm | 04-streaks.feature.md | PASS | src/lib/streaks.test.ts:15, src/app.test.ts:501 |
| TOR-04-ixZC5y3 | 04-streaks.feature.md | PASS | src/lib/streaks.test.ts:30, src/app.test.ts:537 |
| TOR-04-Dzlhzul | 04-streaks.feature.md | PASS | src/lib/streaks.test.ts:38, src/app.test.ts:552 |
| TOR-04-Ft8iQbI | 04-streaks.feature.md | PASS | src/app.test.ts:621 |
| TOR-04-GN2fJoI | 04-streaks.feature.md | PASS | src/app.test.ts:686, src/app.test.ts:703 |

## Verification Summary

### Counts
- TOR Requirements: 10/10 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 77 passed, 0 skipped, 0 failed

### Highlights
- ✅ Live browser verification landed in the TOR-03-albP5kN edge case organically — local
  date 2026-09-04 while the UTC instant was already 2026-09-05; the stored completion was
  exactly `["2026-09-04"]` (src/lib/streaks.ts:12)
- ✅ Full toggle lifecycle with real clicks: check → badge 0→1 instantly on the same
  rendered page, persisted, survived reload; uncheck → badge recomputed to
  yesterday-anchored 0; reload → off/on → exactly one entry (TOR-03-WUQGIE9/M5RmMBx/
  zr7VepE, TOR-04-Ft8iQbI)
- ✅ Rule table rendered verbatim from seeded history: 4 / 2 (gap resets) / 3
  (yesterday-grace, unchecked) / 0 (stale) (TOR-04-cS2CaLm/ixZC5y3/Dzlhzul)
- ✅ Archive → restore recompute verified in-browser: badge 3 recomputed from preserved
  history after the round-trip (TOR-04-GN2fJoI)
- ✅ Quality gates re-run independently: lint clean, build (tsc + vite) clean, 77/77
  tests passing; console clean on final load (first-load favicon 404 is the pre-existing
  item noted in the AQNWtiB handoff)

### Conclusion
Every TOR's Given/When/Then was independently confirmed twice: once through unit/UI tests
that faithfully mirror the Gherkin structure, and once through live browser interactions
against the dev server with real clicks and real localStorage. The implementation
realizes the normative streak rule as a pure module exactly as the spec requires, and the
one documented deviation (test-environment neutrality for TOR-03-albP5kN) preserves the
scenario's substance.

### Manual verification performed: No
(Only automated gates and the reviewer's live in-app-browser pass were run.)

## Known Issues / Follow-ups

- Pre-existing favicon 404 on first page load (noted in the AQNWtiB handoff) — cosmetic;
  fix in a quick-fix or fold into a later epic.
- `docs/architecture.md` and `docs/design-notes.md` still describe the checkbox/badge as
  "unwired mounts landing in epic m1i25n4" — refreshed as part of this wrapup's doc-sync
  step.
