# Epic XDc5Tpp: Filtering, Views & Offline Verification

**Phase:** 3 — Frontend
**Status:** Complete — 2026-09-05
**Dependencies:** Epic AQNWtiB (Habit Management UI — active and archived habits exist), Epic m1i25n4 (Daily Check-in & Streaks — badges render on rows)

> **Brand:** Use the project's brand guidelines skill for the filter control, archived-row tag, and empty states if one is configured.

---

## Description

This epic completes the UI surface — the All/Active/Archived filter control (defaulting to
Active), per-view row contents with archived rows tagged in All, and the distinct empty
states per view — and then closes the MVP with the end-to-end offline verification: with the
network cut, every capability (add, check-in, archive, restore, filter) works and state
survives reload with zero network requests. This is the epic that makes Summit feel whole:
nothing the user did is ever out of reach, and the app demonstrably needs no server (PV
Goals G4 and G5, ConOps §6's zero-network flow).

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
| TOR-05-GjGNESQ | `docs/requirements/05-filtering.feature.md` | The application shall offer a three-segment filter control labeled "All", "Active", and "Archived" |
| TOR-05-PrNhHoE | `docs/requirements/05-filtering.feature.md` | The application shall open with the Active filter selected by default |
| TOR-05-sAMxFFs | `docs/requirements/05-filtering.feature.md` | The application shall show only active habits in the Active view and only archived habits in the Archived view |
| TOR-05-qD4GGzl | `docs/requirements/05-filtering.feature.md` | The application shall show every habit in the All view with archived rows visually distinguished |
| TOR-05-0maiBlC | `docs/requirements/05-filtering.feature.md` | The application shall show a distinct, friendly empty state for each filter that has no rows |
| TOR-01-0d73l6K | `docs/requirements/01-app-shell.feature.md` | The application shall make zero network requests and remain fully functional offline after first load |

## Key Components

- `src/ui/filter-bar.ts` — three-segment filter control (All / Active / Archived), Active selected by default
- `src/ui/habit-list.ts` — per-filter row filtering, archived tag in All view, per-filter empty states
- `src/ui/habit-row.ts` — Archive vs Restore affordance swap by view context
- `src/styles.css` — filter segments, archived tag, empty-state styling
- `docs/architecture.md` — update Frontend Architecture section with the as-built view/module structure (per `AGENTS.md`, refreshed via `/peak-workflow:refresh-docs` at wrapup)
