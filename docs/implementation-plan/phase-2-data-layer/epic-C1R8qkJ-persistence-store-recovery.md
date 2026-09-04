# Epic C1R8qkJ: Persistence Store & Recovery

**Phase:** 2 — Data Layer
**Status:** Implemented — 2026-09-04
**Dependencies:** Epic tVQOvBV (Project Scaffold & App Shell — shell, logger, storage read skeleton)

> **Brand:** Use the project's brand guidelines skill for the recovery banner styling if one is configured.

---

## Description

This epic implements the application's entire persistence story: a versioned JSON document
under the single `localStorage` key `summit.habits.v1`, written immediately on every
mutation, hydrated on boot, and recoverable when unreadable. Recovery is a first-class state,
not an afterthought — invalid JSON or a future `schemaVersion` shows an in-page banner that
names the problem and offers "Start fresh", which is also the canonical demonstration of the
error-message standard TOR anchored here. Privacy and offline capability are properties of
this layer: data never leaves the browser (PV §10, Goal G5). With this epic complete, habit
state is durable across reloads and safe against corruption.

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
| TOR-06-anYR3mD | `docs/requirements/06-persistence.feature.md` | The application shall persist all state under the single localStorage key "summit.habits.v1" as a JSON document with schemaVersion 1 and a habits array |
| TOR-06-OcAYtZQ | `docs/requirements/06-persistence.feature.md` | The application shall write state to localStorage immediately upon every mutation, with no save button or delay |
| TOR-06-OQbS0LR | `docs/requirements/06-persistence.feature.md` | The application shall hydrate its state from localStorage on boot so that habits, streaks, archived flags, and today's check-ins all survive a reload |
| TOR-01-yNjDWrJ | `docs/requirements/01-app-shell.feature.md` | The application shall display user-facing error messages in the page that name the problem AND the next user action, never console-only |
| TOR-06-PlcuFFf | `docs/requirements/06-persistence.feature.md` | The application shall surface unreadable saved data with an in-page banner that names the problem and offers a "Start fresh" action, rather than silently showing an empty list |
| TOR-06-CStJTf4 | `docs/requirements/06-persistence.feature.md` | The application shall treat a stored schemaVersion it does not understand as unreadable data and show the same recovery banner |
| TOR-06-I9rZxQC | `docs/requirements/06-persistence.feature.md` | The application shall reset to a clean empty state when the user chooses "Start fresh" |

## Key Components

- `src/lib/types.ts` — `Habit` and stored-document types (`schemaVersion`, `habits[]` with `id`, `name`, `createdAt`, `archived`, `completions`)
- `src/lib/storage.ts` — full store: `load` (validate schemaVersion, parse or flag unreadable), `save` (serialize whole document on every mutation), storage-quota error surfaced per the error standard
- `src/ui/error-banner.ts` — inline banner component rendering problem + action messages; "Start fresh" action
- `src/app.ts` — boot: load → valid state renders / unreadable shows banner → "Start fresh" resets to fresh empty v1 document
- Unit tests for validation and save/load round-trip (test runner chosen during epic planning; `AGENTS.md` quality gates updated accordingly)
