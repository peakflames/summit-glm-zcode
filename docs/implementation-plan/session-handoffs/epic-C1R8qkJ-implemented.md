# Epic C1R8qkJ: Persistence Store & Recovery — Implemented

**Implemented:** 2026-09-04
**Branch:** `feature/epic-C1R8qkJ-persistence-store-recovery`

## What Was Built

The application's entire persistence story: a versioned JSON document under the single
`localStorage` key `summit.habits.v1` (`schemaVersion: 1`, habits carrying `id`, `name`,
`createdAt`, `archived`, `completions` as `YYYY-MM-DD` local dates), written immediately on
every mutation through the canonical `updateState` path, and hydrated on boot. Unreadable
stored data (corrupt JSON, unknown schemaVersion, invalid shape) is a first-class boot state:
an in-page `role="alert"` banner names the problem and offers "Start fresh", which resets to a
clean empty v1 document. A refused save (storage full) is surfaced as an in-page message
naming the problem and the next action, per the error-message standard.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | NEW — `Habit` (with `completions: string[]`) and `AppState` stored-document types |
| `src/lib/storage.ts` | Full store: `loadState` (validated, typed load result), `saveState` (whole-document immediate write, quota surfaced), `updateState` (canonical write-through mutation path) |
| `src/ui/error-banner.ts` | NEW — `showRecoveryBanner` (problem + "Start fresh" action), `showInlineError`, `dismissBanner` |
| `src/app.ts` | Boot: load → valid renders / unreadable shows recovery banner → "Start fresh" resets; save failure renders inline error |
| `index.html` | Added static `#error-region` message region (matches static-shell pattern) |
| `src/styles.css` | Recovery/inline banner styling consistent with the shell |
| `src/lib/storage.test.ts`, `src/ui/error-banner.test.ts`, `src/app.test.ts`, `src/main.test.ts` | 28 vitest tests mirroring the TOR Gherkin (11 → 28 total) |

## Key Decisions

- **`updateState(fn)` is the canonical mutation path** — load → mutate → save immediately, no
  save button, no delay (TOR-06-OcAYtZQ). It refuses to write when the stored document is
  unreadable, so v1 never rewrites a document it does not understand (TOR-06-CStJTf4 note).
  Phase-3 epics (AQNWtiB, m1i25n4) wire their UI controls through it.
- **`loadState` returns a typed result** (`{ status: 'ok', state }` |
  `{ status: 'unreadable', reason }` with reasons `invalid-json` /
  `unknown-schema-version` / `invalid-shape`) instead of silently returning an empty state.
  Absent key still yields a clean empty state (TOR-06-7l9Trjh preserved; the old `readState`
  was replaced and its test updated).
- **Structural validation added**: a document with `schemaVersion: 1` but malformed habits is
  treated as unreadable (`invalid-shape`) rather than trusted.
- **Banner message varies by reason** (corrupted vs. newer version) but is the same recovery
  banner with the same "Start fresh" action, per TOR-06-CStJTf4.
- No new dependencies; test runner remains vitest + happy-dom (resolving the spec's
  "chosen during epic planning" note). No brand-guidelines skill is configured, so banner
  styling follows existing `styles.css` conventions.

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|-----------|----------------|--------|
| TOR-06-OcAYtZQ | "the user performs each of: add a habit, toggle Done today, archive, restore" | Mechanism fully implemented and verified at store level (`updateState` writes after each mutation type); the clickable controls arrive with Epic AQNWtiB / m1i25n4 | Phase decomposition: this epic owns the data layer; the phase-3 epics anchor the UI-action TORs (02/03) |
| TOR-06-OQbS0LR | "the active habit renders with streak 2 and 'Done today' checked; the archived habit appears under the Archived filter" | Hydration fully implemented and verified at state level (habits, archived flags, completions survive boot); habit-row/streak/filter rendering arrives with AQNWtiB / m1i25n4 / XDc5Tpp | Same phase decomposition — rendering components do not exist yet in the as-built code |

## TOR Coverage

| TOR ID | Verdict | Test Reference | Implementation Reference |
|--------|---------|----------------|--------------------------|
| TOR-06-anYR3mD | PASS | src/lib/storage.test.ts:72 | src/lib/storage.ts:14,75 + src/lib/types.ts:6 |
| TOR-06-OcAYtZQ | PASS | src/lib/storage.test.ts:109 | src/lib/storage.ts:89 |
| TOR-06-OQbS0LR | PASS | src/lib/storage.test.ts:163 + src/app.test.ts:109 (boot) | src/lib/storage.ts:40 + src/app.ts:93 |
| TOR-01-yNjDWrJ | PASS | src/ui/error-banner.test.ts:74 + src/app.test.ts:215 | src/ui/error-banner.ts:45 + src/app.ts:18,58 |
| TOR-06-PlcuFFf | PASS | src/lib/storage.test.ts:201 + src/app.test.ts:109 | src/lib/storage.ts:51 + src/app.ts:88 + src/ui/error-banner.ts:20 |
| TOR-06-CStJTf4 | PASS | src/lib/storage.test.ts:212 + src/app.test.ts:124 | src/lib/storage.ts:62 + src/app.ts:88 |
| TOR-06-I9rZxQC | PASS | src/app.test.ts:170 | src/app.ts:55 |

All 28 tests pass (6 files). Regression check: the 11 pre-existing tests were updated where
they touched the replaced `readState` API (behavior unchanged, TOR-06-7l9Trjh still covered at
src/lib/storage.test.ts:43 and src/app.test.ts:67).

## Verification Results

### Quality Gates
- **Lint:** PASS — `npm run lint` clean
- **Build:** PASS — `npm run build` (tsc --noEmit + vite build), 4.52 kB bundle
- **Tests:** PASS — 28/28 (6 files)
- **Browser check:** PASS — verified live against the dev server via playwright-cli:
  - Clean profile: "No habits yet", no banner, startup stamp is the first console record
  - Corrupt JSON seed + reload: alert banner ("couldn't read your saved data") with Start
    fresh; no silent empty state
  - `schemaVersion: 99` seed + reload: same banner naming a newer version, Start fresh offered
  - "Start fresh" click: banner dismissed, "No habits yet", storage holds
    `{"schemaVersion":1,"habits":[]}`
  - Valid 2-habit seed + reload: list area not empty (hydration reaches the renderer)
  - Console errors: none on all loads except the pre-existing favicon 404 (known follow-up)
- **TOR verification:** 7/7 PASS (see TOR Coverage)

### Manual verification performed: No (browser automation via playwright-cli)

## Known Issues / Follow-ups

- Favicon 404 console error on first load (carried over from Epic tVQOvBV — quick-fix candidate).
- Habit-row rendering, streaks, and the add/toggle/archive/restore controls consume this store
  in Phase 3 (AQNWtiB → m1i25n4 → XDc5Tpp); `updateState` is the write path they must use.
