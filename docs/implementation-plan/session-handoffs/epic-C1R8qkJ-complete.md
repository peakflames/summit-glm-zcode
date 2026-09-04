# Epic C1R8qkJ: Persistence Store & Recovery — Complete

**Completed:** 2026-09-04
**Verified by:** Independent review via `/peak-workflow:wrapup-epic C1R8qkJ`

## What Was Built

The application's entire persistence story: a versioned JSON document under the single
`localStorage` key `summit.habits.v1` (`schemaVersion: 1`), written immediately on every
mutation through the canonical `updateState` path, and hydrated on boot. Unreadable stored
data (corrupt JSON, unknown schemaVersion, invalid shape) is a first-class boot state: an
in-page `role="alert"` recovery banner names the problem and offers "Start fresh", which
resets to a clean empty v1 document. Refused saves (storage full) render an in-page message
naming the problem and the next action, per the error-message standard.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | `Habit` (with `completions: string[]`) and `AppState` stored-document types |
| `src/lib/storage.ts` | `loadState` (typed ok/unreadable result), `saveState` (immediate whole-document write, quota surfaced), `updateState` (canonical write-through mutation path) |
| `src/ui/error-banner.ts` | `showRecoveryBanner` (problem + "Start fresh" action), `showInlineError`, `dismissBanner` |
| `src/app.ts` | Boot: load → valid renders / unreadable shows recovery banner → "Start fresh" resets |
| `src/lib/storage.test.ts`, `src/ui/error-banner.test.ts`, `src/app.test.ts`, `src/main.test.ts` | vitest suites mirroring the TOR Gherkin (28 tests total) |

## Key Decisions

- **`updateState(fn)` is the canonical mutation path** — load → mutate → save immediately,
  no save button, no delay. It refuses to write when the stored document is unreadable, so
  v1 never rewrites a document it does not understand. Phase-3 epics (AQNWtiB, m1i25n4,
  XDc5Tpp) must wire their UI controls through it.
- **`loadState` returns a typed result** (`{ status: 'ok', state }` |
  `{ status: 'unreadable', reason }` with reasons `invalid-json` / `unknown-schema-version`
  / `invalid-shape`) instead of silently returning an empty state. Absent key still yields a
  clean empty state (TOR-06-7l9Trjh).
- **Structural validation:** a document with `schemaVersion: 1` but malformed habits is
  treated as unreadable (`invalid-shape`) rather than trusted.
- **Banner message varies by reason** (corrupted vs. newer version) but is the same recovery
  banner with the same "Start fresh" action.
- No new dependencies; test runner remains vitest + happy-dom.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-06-anYR3mD | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:72 |
| TOR-06-OcAYtZQ | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:109 |
| TOR-06-OQbS0LR | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:163 + src/app.test.ts:109 |
| TOR-01-yNjDWrJ | `docs/requirements/01-app-shell.feature.md` | PASS | src/ui/error-banner.test.ts:74 + src/app.test.ts:215 |
| TOR-06-PlcuFFf | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:201 + src/app.test.ts:109 |
| TOR-06-CStJTf4 | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:212 + src/app.test.ts:124 |
| TOR-06-I9rZxQC | `docs/requirements/06-persistence.feature.md` | PASS | src/app.test.ts:170 |

## Verification Summary

### Counts
- TOR Requirements: 7/7 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint, build, tests, browser check)
- Tests: 28 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-06-anYR3mD — stored document schema verified: single key `summit.habits.v1`,
  `schemaVersion: 1`, habits array with id/name/createdAt/archived/completions
  (src/lib/storage.test.ts:72, src/lib/storage.ts:75); confirmed live in-browser ("Start
  fresh" wrote `{"schemaVersion":1,"habits":[]}`).
- ✅ TOR-06-OcAYtZQ — write-through verified for all four mutation types with no reload or
  explicit save (src/lib/storage.test.ts:109, src/lib/storage.ts:89); `updateState` refuses
  to overwrite unreadable data, preserving the v1-must-not-rewrite invariant.
- ✅ TOR-06-PlcuFFf / TOR-06-CStJTf4 — recovery verified live: corrupt JSON produced the
  `role="alert"` banner naming the problem with "Start fresh" and did not silently render
  the empty state; `schemaVersion: 99` produced the same banner naming a newer version
  (src/lib/storage.test.ts:201/212, src/app.test.ts:109/124, src/app.ts:84-91).
- ✅ TOR-06-I9rZxQC — "Start fresh" click in a real browser dismissed the banner, showed
  "No habits yet", and rewrote storage to a fresh empty v1 document (src/app.test.ts:170,
  src/app.ts:55).
- ✅ TOR-01-yNjDWrJ — errors render in-page naming problem AND next action
  (src/ui/error-banner.ts:45, src/app.ts:18); quota-refused save produces the full
  "Couldn't save… Remove archived habits to free space." message in the DOM.
- ⚠️ TOR-06-OQbS0LR — hydration verified at state level (src/lib/storage.test.ts:163,
  src/lib/storage.ts:40) and live (valid 2-habit document accepted on reload with no
  banner); row/streak/filter rendering is Phase-3 scope per the recorded deviation.

### Conclusion
Every TOR's Given/When/Then is realized by both a faithful test and independently inspected
implementation code, and the recovery/reboot behaviors were additionally exercised in a real
browser against real `localStorage`. The two store-level rather than UI-level verifications
are the consequence of deliberate phase decomposition, explicitly recorded in the
implemented handoff — sufficient for this epic's scope.

### Manual verification performed: No

## Known Issues / Follow-ups

- Favicon 404 console error on first load (carried over from Epic tVQOvBV — quick-fix
  candidate).
- Minor: `saveState` maps any `setItem` failure to `quota-exceeded`; a blocked-storage
  `SecurityError` (localStorage disabled) would be mislabeled as "storage is full" in the
  inline message. Cosmetic message-accuracy nit for a future quick-fix.
- Habit-row rendering, streaks, and the add/toggle/archive/restore controls consume this
  store in Phase 3 (AQNWtiB → m1i25n4 → XDc5Tpp); `updateState` is the write path they must
  use.
