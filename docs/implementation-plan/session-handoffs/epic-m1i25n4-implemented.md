# Epic m1i25n4: Daily Check-in & Streaks — Implemented

**Date:** 2026-09-04
**Branch:** `feature/epic-m1i25n4-daily-checkin-streaks`

## What Was Built

Summit's daily ritual: the "Done today" checkbox is now wired — clicking it records
today's completion through `toggleToday`, clicking again undoes it, and the membership
check makes the operation idempotent so repeated toggles and reloads can never duplicate
an entry — all keyed on the user's **local** calendar date (YYYY-MM-DD), never UTC.
The streak badge is no longer a hardcoded 0: a new pure engine (`streaks.ts`) implements
the normative PV §6 rule (consecutive days ending today, yesterday-grace, else 0) and
every row renders its badge from real history, updating instantly on toggle without a
reload, including after an archive/restore round-trip.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/streaks.ts` | **New.** Pure streak engine: `localDateKey` (local-field YYYY-MM-DD formatting), `todayLocalDate`, `addDays` (month/year-safe key arithmetic), `currentStreak(completions, today?)` — the PV §6 rule as a pure function |
| `src/lib/streaks.test.ts` | **New.** 12 pure unit tests: TOR-04 rule table verbatim, yesterday grace, zero clauses, local-date keying, addDays boundary rolls |
| `src/lib/habits.ts` | `toggleToday(id)` — add/remove today's local date, idempotent, persists through `updateState`; reuses existing `HabitActionResult` error paths |
| `src/lib/habits.test.ts` | 5 new store-level tests: record, undo, idempotence across reloads, local-date keying (fake timers at 2026-09-04 23:30), unknown-habit |
| `src/ui/habit-row.ts` | Checkbox now reflects `completions.includes(today)` and fires `onToggle`; badge renders `currentStreak(habit.completions)` |
| `src/app.ts` | `onToggle: (id) => runAction(toggleToday(id))` — the existing re-render path recomputes all badges with no reload |
| `src/app.test.ts` | 10 new UI-level tests: badge on every row, rule table rendered from history, grace/zero renders, toggle record/undo/idempotence, instant badge update (same list element), restored-habit recompute, duplicate-row interaction independence |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|----------------|--------|
| TOR-03-albP5kN | "local time is 2026-09-04 23:30 while the UTC date is already 2026-09-05" | Unit test asserts `localDateKey(new Date(2026, 8, 4, 23, 30))` === `"2026-09-04"` and the store test asserts the stored string is `"2026-09-04"` under `vi.setSystemTime(new Date(2026, 8, 4, 23, 30))` | No deviation in substance: the tests pin the local wall-clock fields and assert the **local** date key, independent of whichever UTC offset the CI machine has — pinning a specific UTC offset (e.g. UTC+X) would make the suite environment-dependent, which the scenario's contract ("local, not UTC") does not require |

No other deviations — all nine remaining TORs implemented exactly as written.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference | Impl Reference |
|--------|--------------|---------|----------------|----------------|
| TOR-03-WUQGIE9 | `docs/requirements/03-daily-checkin.feature.md` | PASS | `src/lib/habits.test.ts:178` (store), `src/app.test.ts:574` (UI) | `src/lib/habits.ts:70`, `src/ui/habit-row.ts:25` |
| TOR-03-M5RmMBx | `docs/requirements/03-daily-checkin.feature.md` | PASS | `src/lib/habits.test.ts:216` (store), `src/app.test.ts:590` (UI) | `src/lib/habits.ts:70` |
| TOR-03-zr7VepE | `docs/requirements/03-daily-checkin.feature.md` | PASS | `src/lib/habits.test.ts:234` (store), `src/app.test.ts:603` (UI) | `src/lib/habits.ts:74-84` (membership check; `updateState` re-reads storage each call, covering the reload case by construction) |
| TOR-03-albP5kN | `docs/requirements/03-daily-checkin.feature.md` | PASS | `src/lib/streaks.test.ts:49` (pure), `src/lib/habits.test.ts:251` (store, fake timers) | `src/lib/streaks.ts:12-17` (local fields, never `toISOString`) |
| TOR-04-5xu6Aag | `docs/requirements/04-streaks.feature.md` | PASS | `src/app.test.ts:490` | `src/ui/habit-row.ts:35-40` |
| TOR-04-cS2CaLm | `docs/requirements/04-streaks.feature.md` | PASS | `src/lib/streaks.test.ts:10` (rule table verbatim), `src/app.test.ts:501` (rendered from history) | `src/lib/streaks.ts:36-50` |
| TOR-04-ixZC5y3 | `docs/requirements/04-streaks.feature.md` | PASS | `src/lib/streaks.test.ts:26`, `src/app.test.ts:537` | `src/lib/streaks.ts:41` (yesterday anchor) |
| TOR-04-Dzlhzul | `docs/requirements/04-streaks.feature.md` | PASS | `src/lib/streaks.test.ts:35`, `src/app.test.ts:552` | `src/lib/streaks.ts:42` |
| TOR-04-Ft8iQbI | `docs/requirements/04-streaks.feature.md` | PASS | `src/app.test.ts:621` (asserts same `#habit-list` element identity, i.e. no reload) | `src/app.ts:107` + `runAction` re-render path (`src/app.ts:114-121`) |
| TOR-04-GN2fJoI | `docs/requirements/04-streaks.feature.md` | PASS | `src/app.test.ts:686`, `src/app.test.ts:703` | `src/ui/habit-row.ts:35` (row is a pure function of the habit — restore needs no special casing) |

## Verification Results

### Counts
- TOR Requirements: 10/10 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 77 passed, 0 skipped, 0 failed (23 new in this epic)

### Highlights
- ✅ Quality gates — `npm run lint` (0 errors), `npm run build` (tsc + vite, no type
  errors), `npm test` (77/77), visual check via in-app browser screenshot (layout,
  badges, checkboxes all correct)
- ✅ Live browser verification against `npm run dev` exercised every scenario with real
  interactions: add → check (badge 0→1 instantly, storage `["2026-09-04"]`, survives
  reload) → uncheck (badge recomputes, today removed) → toggle off/on across reload
  (exactly one entry); rule-table seeds rendered 4 / 2 (gap resets) / 3 (yesterday
  grace, unchecked) / 0 (stale); stale row check → badge 1 with no reload; archive →
  restore recompute (badge 3 preserved through the round-trip)
- ✅ Console clean apart from the pre-existing favicon 404 noted in the AQNWtiB handoff
- ✅ AQNWtiB follow-up closed: duplicate-row independence re-verified at the interaction
  level (`src/app.test.ts:637`)

### Manual verification performed: No
(User was away from the desk; verification was performed by the automated suite plus a
live in-app-browser pass driving every TOR scenario with real clicks against the dev
server.)
