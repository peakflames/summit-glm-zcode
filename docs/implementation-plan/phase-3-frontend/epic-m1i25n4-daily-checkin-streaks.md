# Epic m1i25n4: Daily Check-in & Streaks

**Phase:** 3 — Frontend
**Status:** Implemented — 2026-09-04
**Dependencies:** Epic C1R8qkJ (Persistence Store & Recovery — completions persist per mutation), Epic AQNWtiB (Habit Management UI — habit rows exist to check off)

> **Brand:** Use the project's brand guidelines skill for the "Done today" checkbox and streak badge if one is configured.

---

## Description

This epic implements Summit's daily ritual and the number that motivates it: the "Done
today" toggle (record, undo, idempotence, local-date keying) and the current-streak engine.
The streak rule is normative and comes verbatim from PV §6 — consecutive completion days
ending today if today is completed, otherwise ending yesterday, 0 if neither — so it lands
as a pure, individually tested module (`streaks.ts`) rather than UI logic. Toggling updates
the badge instantly in the rendered page. This epic serves PV Goals G2 and G3 and ConOps
scenarios S1 (check-in), S2 (daily return), and S3 (honest reset).

## Requirements Anchors

> The TOR requirement IDs listed below are the acceptance criteria and verification baseline for
> this epic. Each ID maps to a Gherkin scenario in the referenced feature file.
> `/peak-workflow:start-epic` reads each TOR's Given/When/Then to drive implementation and tests.
> `/peak-workflow:wrapup-epic` independently verifies each TOR's Given/When/Then is satisfied.
> If a feature file has been updated since this spec was written and a scenario no longer matches
> its cited TOR ID, stop and surface the discrepancy to the user before proceeding — do not
> silently implement against stale requirements.

| TOR ID | Feature File | Scenario Title |
|--------|--------------|----------------|
| TOR-03-WUQGIE9 | `docs/requirements/03-daily-checkin.feature.md` | The application shall record today's completion when the "Done today" checkbox is clicked |
| TOR-03-M5RmMBx | `docs/requirements/03-daily-checkin.feature.md` | The application shall remove today's completion when an already-checked "Done today" checkbox is clicked again |
| TOR-03-zr7VepE | `docs/requirements/03-daily-checkin.feature.md` | The application shall record at most one completion per habit per local calendar day, regardless of repeated clicks or reloads |
| TOR-03-albP5kN | `docs/requirements/03-daily-checkin.feature.md` | The application shall record completions as local calendar dates (YYYY-MM-DD) in the user's timezone, not UTC dates |
| TOR-04-5xu6Aag | `docs/requirements/04-streaks.feature.md` | The application shall display a current-streak badge on every habit row |
| TOR-04-cS2CaLm | `docs/requirements/04-streaks.feature.md` | The application shall compute the current streak as the count of consecutive completed local calendar days ending today, when today is completed |
| TOR-04-ixZC5y3 | `docs/requirements/04-streaks.feature.md` | The application shall keep the streak visible without reset when today is not yet completed but yesterday is |
| TOR-04-Dzlhzul | `docs/requirements/04-streaks.feature.md` | The application shall display a streak of 0 when neither today nor yesterday is completed |
| TOR-04-Ft8iQbI | `docs/requirements/04-streaks.feature.md` | The application shall update the streak badge immediately when "Done today" is toggled, without a page reload |
| TOR-04-GN2fJoI | `docs/requirements/04-streaks.feature.md` | The application shall recompute a restored habit's streak from its preserved completion history |

## Key Components

- `src/lib/streaks.ts` — pure streak computation (today-anchored, yesterday-grace, zero clauses); unit-testable without the DOM
- `src/lib/habits.ts` — `toggleToday(habit)` action: add/remove today's local date, idempotent, persists
- `src/ui/habit-row.ts` — "Done today" checkbox toggle wiring; streak badge renders from `streaks.ts` and updates on mutation without reload
- Unit tests for the streak rule table (TOR-04-cS2CaLm's data table) and local-date keying
