# Epic AQNWtiB: Habit Management UI

**Phase:** 3 — Frontend
**Status:** Implemented — 2026-09-04
**Dependencies:** Epic tVQOvBV (Project Scaffold & App Shell — shell and form markup), Epic C1R8qkJ (Persistence Store & Recovery — mutations persist immediately)

> **Brand:** Use the project's brand guidelines skill for the habit rows and inline validation errors if one is configured.

---

## Description

This epic builds the habit lifecycle on top of the store: adding habits by name through the
"Add habit" input (Add button or Enter), the validation rules around that input, and the
archive/restore lifecycle that lets users retire habits without ever destroying history.
Validation errors are the second live demonstration of the error-message standard — inline,
naming the problem and the next action. Duplicates are deliberately allowed (a recorded
decision in PV §6); the only name constraints are non-empty and ≤ 80 characters. This epic
serves PV Goal G1 and G4 and ConOps scenarios S1, S4, and S5.

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
| TOR-02-XOoULU3 | `docs/requirements/02-habit-management.feature.md` | The application shall add a new habit by name through the "Add habit" input and Add button, showing it immediately in the habit list |
| TOR-02-w9nrh1o | `docs/requirements/02-habit-management.feature.md` | The application shall submit the "Add habit" input when the user presses Enter, behaving identically to clicking Add |
| TOR-02-G8b7pmU | `docs/requirements/02-habit-management.feature.md` | The application shall persist a newly added habit so that it survives a page reload |
| TOR-02-flxKIoM | `docs/requirements/02-habit-management.feature.md` | The application shall reject an empty or whitespace-only habit name with an inline error that names the problem and the next user action |
| TOR-02-lMWubKc | `docs/requirements/02-habit-management.feature.md` | The application shall enforce a maximum habit-name length of 80 characters, accepting a name of exactly 80 characters and rejecting 81 or more |
| TOR-02-f9diV8o | `docs/requirements/02-habit-management.feature.md` | The application shall allow duplicate habit names, creating a second independent habit row |
| TOR-02-c7UnNH0 | `docs/requirements/02-habit-management.feature.md` | The application shall archive a habit on demand, removing it from the Active view while preserving its completion history |
| TOR-02-E0o3IbX | `docs/requirements/02-habit-management.feature.md` | The application shall restore an archived habit on demand, returning it to the Active view with its completion history intact |

## Key Components

- `src/lib/habits.ts` — store actions: `addHabit`, `archiveHabit`, `restoreHabit` (each mutates state and persists through `storage.ts`)
- `src/ui/habit-form.ts` — Add-habit input + Add button + Enter submit; inline validation errors (empty, over 80 chars)
- `src/ui/habit-row.ts` — row rendering: name, streak badge mount, "Done today" checkbox mount, Archive/Restore action
- `src/app.ts` — wire form and list to store state; re-render on mutation
- `src/styles.css` — row and validation-error styles
