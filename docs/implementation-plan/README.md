# Summit — Implementation Plan

## Quick Start for New Session

1. Run `/peak-workflow:status` for the live cross-phase dashboard (includes Requirements Coverage)
2. Run `/peak-workflow:start-epic <id>` to begin an epic (use the 7-character alphanumeric ID from the phase index)
3. The agent reads the epic spec, loads TOR requirements from feature files, enters plan mode, and creates tasks (one task per TOR ID or TOR group — these are user stories)
4. When implementation is done, open a new session: `/peak-workflow:wrapup-epic <id>`
5. If stopping early: `/peak-workflow:pause`

## Epic Lifecycle

```
Not Started → In Progress → Implemented → Complete
                  ^              ^             ^
    /peak-workflow:start-epic  /peak-workflow:start-epic  /peak-workflow:wrapup-epic
          (begins)           (finishes)      (independent review)
```

Each epic's status sidecar includes a `requirements:` field listing the TOR IDs the epic covers.
`/peak-workflow:status` uses these fields to compute the Requirements Coverage dashboard.

## Plan Shape

- **Phase 1 — Foundation:** scaffold, version wiring, logger, app shell (Epic tVQOvBV)
- **Phase 2 — Data Layer:** versioned localStorage store, write-on-mutation, recovery (Epic C1R8qkJ)
- **Phase 3 — Frontend:** habit management (AQNWtiB), check-in & streaks (m1i25n4), filtering & offline E2E (XDc5Tpp)

The dependency path is strictly linear: tVQOvBV → C1R8qkJ → AQNWtiB → m1i25n4 → XDc5Tpp.
This mirrors the project's reference-example goal: the git history reads as a walkthrough.
