# Epic lfstJmm: Row UI Parity — Done Toggle, Streak Caption & Help Hint

**Phase:** 3 — Frontend
**Status:** Implemented — 2026-09-05
**Dependencies:** Epic m1i25n4 (Daily Check-in & Streaks — checkbox wiring, store toggle, streak engine), Epic NZK8kqE (PeakFlames Design System — vendored token CSS, `.pf-*` classes)

> **Brand:** Use the project's brand guidelines skill for the check-in button treatments, streak caption typography, and help-hint styling if one is configured. This repo vendors the PeakFlames Design System token CSS under `src/styles/peakflames/` — use it; do not introduce a UI framework.

---

## Description

Adopt the sibling Summit implementation's row UI so the daily check-in feels like a deliberate button instead of a bare checkbox: the per-row control becomes a "Done today" / "Done ✓" toggle button (success green when done), every streak badge gains a "DAY STREAK" caption beneath the number, and a one-line help hint above the Active list teaches the streak-continuation and honest-reset rule. Behavior, data model, and dependencies are unchanged — `toggleToday`, the streak engine, and persistence are untouched. This epic is the implementation side of an approved requirements change-control event (row-UI parity discovery, 2026-09-05): the TOR-03 scenarios were rewritten from checkbox to toggle-button terms, and three new TORs pin the caption, the hint, and the button treatment.

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
| TOR-03-WUQGIE9 | `docs/requirements/03-daily-checkin.feature.md` | The application shall record today's completion when the "Done today" toggle button is clicked |
| TOR-03-M5RmMBx | `docs/requirements/03-daily-checkin.feature.md` | The application shall remove today's completion when an already-done "Done today" toggle button is clicked again |
| TOR-02-XOoULU3 | `docs/requirements/02-habit-management.feature.md` | The application shall add a new habit by name through the "Add habit" input and Add button, showing it immediately in the habit list |
| TOR-04-Ft8iQbI | `docs/requirements/04-streaks.feature.md` | The application shall update the streak badge immediately when "Done today" is toggled, without a page reload |
| TOR-04-rknaMfI | `docs/requirements/04-streaks.feature.md` | The application shall display a "DAY STREAK" caption beneath the streak number in every habit row's streak badge |
| TOR-04-HiRBSAa | `docs/requirements/04-streaks.feature.md` | The application shall display a help hint above the habit list on the Active view explaining streak continuation and the honest reset, and shall not display it on the Archived view |
| TOR-07-OgGR571 | `docs/requirements/07-visual-design.feature.md` | The web application shall render the check-in control as a toggle button whose undone state reads "Done today" in a neutral outlined treatment and whose done state reads "Done ✓" in the design system's success green, with neither state carrying the flame accent |

**Shared ownership note:** TOR-02-XOoULU3 and TOR-04-Ft8iQbI remain in Epics AQNWtiB / m1i25n4's
sidecars too — this epic re-verifies their updated wording against the new control. TOR-03-zr7VepE
and TOR-03-albP5kN stay owned by m1i25n4 alone: their store-level behavior is untouched by this
swap, and the full test suite must stay green as the regression signal.

## Key Components

### Frontend

- `src/ui/habit-row.ts` — replace the `<input type="checkbox" class="habit-done">` with a
  `<button type="button" aria-pressed>` toggle labeled "Done today" (undone) / "Done ✓" (done);
  add the "DAY STREAK" caption span beneath the streak number. The row stays a pure function of
  the habit: pressed state derives from `habit.completions.includes(todayLocalDate())`, and the
  existing `onToggle` callback path is reused unchanged.
- `src/ui/habit-list.ts` (with `src/app.ts` wiring) — render the help hint above the list only
  when the Active filter is selected; absent on Archived (and per TOR-04-HiRBSAa verification, on
  the Archived view specifically).
- `index.html` — optionally host the static hint markup if the hint is rendered as part of the
  list region hydration; keep the static-shell, hydrated-once pattern (design decision 11).
- `src/styles.css` — `.streak-caption` (mono caption style per the design system's type ramp) and
  the done-button treatments: neutral outlined undone state, success green (`--status-success`)
  done state, never the flame accent — the Add button remains the sole `pf-btn--primary`
  (TOR-07-EXjNoVz). Additive class names only (design decision 28).
- Tests — update `src/app.test.ts` and `src/ui/habit-list.test.ts` selections from the checkbox to
  the toggle button, add caption/help-hint coverage in `src/ui/habit-list.test.ts`, and extend
  `src/ui/design-system.test.ts` for the TOR-07-OgGR571 treatment contract (no flame accent on
  either button state).
