# Requirements Baseline

This directory holds the formal Gherkin-style requirements (`.feature.md` files) and their
traceability sidecars (`.feature.tracing.json`), written by `/peak-workflow:capture-requirements`.

## Conventions

- Feature files are **append-only** — feature numbers are stable once assigned.
- TOR IDs (`TOR-NN-XXXXXXX`) are **immutable** once merged to develop — they are foreign keys
  referenced by epic specs, tests, and handoffs.
- Requirements changes go through a `docs/{task-short-name}` branch via
  `/peak-workflow:capture-requirements` (brownfield mode), reviewed and merged like any
  change to the requirements baseline.

## Lifecycle

1. Run `/peak-workflow:discover` to establish or update the product vision and ConOps.
2. Run `/peak-workflow:capture-requirements` to derive TOR requirements from the vision/ConOps.
3. Run `/peak-workflow:plan-project` to derive epics that implement the TOR requirements.
4. Run `/peak-workflow:start-epic <id>` to implement each epic — tests are derived from
   TOR Given/When/Then.
5. Run `/peak-workflow:wrapup-epic <id>` to independently verify each TOR requirement is satisfied.
