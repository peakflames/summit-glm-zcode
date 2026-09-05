# Summit — Architecture Document

> Refreshed to the as-built state by `/peak-workflow:refresh-docs` after Epics tVQOvBV
> (Project Scaffold & App Shell), C1R8qkJ (Persistence Store & Recovery), AQNWtiB
> (Habit Management UI), and m1i25n4 (Daily Check-in & Streaks — all completed
> 2026-09-04). Re-run that command after further epics to keep this document aligned
> with the code.

---

## 1. System Overview

Summit is a client-only single-page habit tracker: users add habits, mark them done for
today, watch per-habit streak counts, and filter by active/archived. All state lives in the
browser (`localStorage`) — there is no backend, no server, and no deployment beyond static
hosting of the Vite build output. It serves as the public reference example for the
`peak-workflow` plugin.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript (strict) | ^5.5.4 | All application code |
| Build tool / dev server | Vite | ^8.2.2 (installed 8.2.2) | Dev server, bundling, production build |
| App type | Client-only SPA | — | Runs entirely in the browser — no backend |
| Persistence | `localStorage` | — | Habits and completion history |
| Package manager | npm | — | Dependencies and scripts |
| Test runner | Vitest + happy-dom | ^5.0.0 / ^20.14.0 | Unit tests in a DOM-simulating environment (`npm run test`) |
| Linter | ESLint + typescript-eslint (flat config) | ^9.9.0 / ^8.5.0 | Static analysis (`npm run lint`) |

There are **no runtime dependencies** — everything above is dev-only. Every added
dependency is a reference-example liability (see AGENTS.md).

---

## 3. Data Sources

| Source | Kind | Purpose |
|--------|------|---------|
| Browser `localStorage` | Local key-value store | Sole persistence: habits, completion history, schema version |

No external APIs, databases, or network calls — the app is fully offline-capable.

---

## 4. API Design

N/A — client-only SPA with no server. (If this ever changes, it is a scope decision for
`/peak-workflow:discover` or `/peak-workflow:triage`, not an epic-level change.)

---

## 5. Backend Architecture

N/A — no backend. Application code is organized as ES modules under `src/`:

```
src/
├── main.ts              Boot sequence (entry point)
├── app.ts               Shell render + wiring (filter, list, boot load / recovery)
├── styles.css           Shell, habit list/form, and banner styling
├── vite-env.d.ts        Ambient declaration for __APP_VERSION__
├── ui/
│   ├── error-banner.ts  Recovery banner + inline errors (role="alert")
│   ├── habit-form.ts    Add-habit form: submit paths + inline validation errors
│   └── habit-row.ts     Habit row rendering (name, streak badge, checkbox, action)
└── lib/
    ├── version.ts       APP_NAME / APP_VERSION (build-time define)
    ├── logger.ts        [LEVEL] message logger (DEBUG/INFO/WARN/ERROR)
    ├── types.ts         Stored-document types (Habit, AppState)
    ├── habits.ts        Store actions: addHabit / archiveHabit / restoreHabit / toggleToday
    ├── streaks.ts       Pure streak engine: localDateKey / todayLocalDate / addDays / currentStreak
    └── storage.ts       Full store: loadState / saveState / updateState
```

Co-located `*.test.ts` files (9 files, 77 tests) mirror the TOR Gherkin from
`docs/requirements/`.

---

## 6. Frontend Architecture

### Entry point and boot sequence

`index.html` loads `/src/main.ts` as a module. `main.ts` is the boot sequence, in order:

1. Import `styles.css`, `logger`, `version`, and `app` (module graph loads first).
2. Emit the startup stamp — **the first console record the app produces** — via
   `log.info("Summit v<version> starting")` (TOR-01-WqWceSw).
3. Call `renderApp()` exactly once.

### Rendering approach

No UI framework. `index.html` holds the semantic shell markup (header, add-habit section
`.add-habit` with the `#habit-name` input + `#add-habit` button, error region, filter
section, habit-list section, footer). `renderApp()` in `src/app.ts` hydrates that static
markup once at boot:

- Queries `#filter`, `#habit-list`, `#footer`, and `#error-region`. If any element is
  missing it logs an error and throws — fail-fast rather than a silent partial render.
  (`initHabitForm()` in `src/ui/habit-form.ts` performs the same fail-fast check for the
  form's own anchors: `#habit-name`, `#add-habit`, and the `.add-habit` root.)
- Renders the All/Active/Archived filter `<select>` (`#habit-filter`, with an
  `aria-label`) into `#filter`.
- Loads state via `loadState()`. On a valid load it renders the list area: a per-filter
  empty state ("No habits yet" for All/Active, "No archived habits" for Archived) when
  nothing matches the current filter, otherwise one habit row per visible habit via
  `renderHabitRow()`. On an unreadable load it renders the recovery banner into
  `#error-region` instead — unreadable data is never silently treated as an empty state.
- Wires the add-habit form via `initHabitForm()` (see below) and renders the version
  footer (`Summit vX.Y.Z`) into `#footer`.

There is no router. The list section re-renders from an in-memory state mirror on every
mutation and filter change: successful store actions update the mirror and re-render, and
the filter `change` event re-renders from the selected filter value.

### Habit rows (Epic AQNWtiB, wired in Epic m1i25n4)

Each row (`.habit-row`, keyed by `data-habit-id`) carries a "Done today" checkbox
(`aria-label` per habit), the habit name (`.habit-name`), a streak badge
(`.streak-badge`, with a `Current streak: N` aria-label), and one action button —
**Archive** for active habits, **Restore** for archived ones. The row is a pure function
of the habit (`src/ui/habit-row.ts`): the checkbox reflects
`habit.completions.includes(todayLocalDate())` and fires the row's `onToggle` callback on
change; the badge renders `currentStreak(habit.completions)` from the streak engine —
every render (initial, post-toggle, post-restore) is derived from the stored history with
no special cases.

### Streak engine and local dates (Epic m1i25n4)

`src/lib/streaks.ts` is a pure module — no DOM, no storage, no global clock read when
`today` is passed explicitly. Completion history is keyed on the user's **local**
calendar date: `localDateKey()` formats a `Date`'s local fields as `YYYY-MM-DD`
(deliberately not `toISOString()`, which is UTC and would shift the day boundary for
users far from UTC — TOR-03-albP5kN), `addDays()` does month/year-safe key arithmetic by
parsing keys to local midnight, and `currentStreak(completions, today?)` implements the
PV §6 rule: the streak is the count of consecutive completed local days ending today if
today is completed, otherwise ending yesterday, otherwise 0.

### Add-habit form (Epic AQNWtiB)

`initHabitForm()` in `src/ui/habit-form.ts` wires the static input + Add button. Both the
button click and Enter in the input submit through one shared `submit()` path, which calls
`addHabit()`, clears the input, and re-renders via the `onChanged` callback on success.
Validation errors (empty name, name over 80 characters) render inline next to the input as
a lazily created `role="alert"` element (`.form-error`) naming the problem AND the next
action; the element is removed when cleared so the shell never carries a dormant
`[role="alert"]` that recovery-banner selectors could mistake for a real alert. Any input
clears a stale error. Store-level refusals (quota, unreadable storage) are delegated to
the app's save-failure handler (see Recovery below).

### Version plumbing

Exactly one path, in one direction:

```
package.json#version
  → Vite define __APP_VERSION__ (vite.config.ts; mirrored in vitest.config.ts for tests)
  → src/lib/version.ts (APP_NAME / APP_VERSION)
  → footer (src/app.ts) and startup stamp (src/main.ts)
```

No other module may hardcode a version string; `package.json#version` is the only version
literal in the repo.

### localStorage access patterns

All persistence goes through `src/lib/storage.ts`:

- **Namespaced key:** `summit.habits.v1` (`STORAGE_KEY`), holding one JSON document with a
  `schemaVersion` field (`SCHEMA_VERSION = 1`) so future migrations are possible. The stored
  document is `{ schemaVersion: 1, habits: Habit[] }` (`src/lib/types.ts`), where each
  `Habit` carries `id`, `name`, `createdAt` (ISO instant), `archived`, and `completions`
  (local `YYYY-MM-DD` dates).
- **Load path:** `loadState()` returns a typed result. An absent key is a clean first run —
  `{ status: 'ok', state: emptyState() }`, no throw, no console error (TOR-06-7l9Trjh). A
  present-but-unreadable document returns `{ status: 'unreadable', reason }` with reasons
  `invalid-json` (corrupt JSON), `unknown-schema-version` (a `schemaVersion` other than 1),
  or `invalid-shape` (structural validation: a v1 document with malformed habits is not
  trusted). A valid document returns `{ status: 'ok', state }`.
- **Write path:** `saveState()` writes the whole document immediately via `setItem`; a
  failure (e.g., quota exceeded) is surfaced to the caller as
  `{ ok: false, reason: 'quota-exceeded' }` so the UI can render it — never console-only.
- **Mutation path (canonical):** `updateState(fn)` is load → mutate → save immediately —
  no save button, no delay (TOR-06-OcAYtZQ). It refuses to write when the stored document is
  unreadable (`{ ok: false, reason: 'unreadable-storage' }`), so v1 never rewrites a document
  it does not understand; recovery ("Start fresh") has to happen first.
- **Habit actions (Epic AQNWtiB):** `src/lib/habits.ts` builds on that path with
  `addHabit(name)` (trims, validates non-empty and ≤ `MAX_HABIT_NAME_LENGTH` = 80
  characters — duplicates deliberately allowed per PV §6 — then appends a new `Habit` with
  a `crypto.randomUUID()` id, ISO `createdAt`, `archived: false`, empty `completions`) and
  `archiveHabit(id)` / `restoreHabit(id)` (flip the `archived` flag, `completions`
  untouched). Each returns a typed result: `{ ok: true, state, habit }` or
  `{ ok: false, reason }` with reasons `empty-name`, `name-too-long`, `unknown-habit`,
  `quota-exceeded`, `unreadable-storage`. `toggleToday(id)` (Epic m1i25n4) joins this
  path: it computes `todayLocalDate()` once, then inside the `updateState` mutation
  removes today's key from the habit's `completions` if present or appends it if not —
  the membership check makes the toggle idempotent, so repeated toggles and reloads can
  never duplicate an entry. Unknown ids return `unknown-habit`; storage refusals reuse
  the same error reasons.

### Recovery & user-facing errors

Unreadable stored data is a first-class boot state, handled by `src/ui/error-banner.ts`:

- `showRecoveryBanner()` renders a `role="alert"` banner naming the problem (message varies
  by reason — corrupted data vs. data written by a newer version) and offering a
  **"Start fresh"** button (TOR-06-PlcuFFf, TOR-06-CStJTf4). `renderApp()` in `src/app.ts`
  wires `onReset` to `startFresh()`, which saves a clean empty v1 document, dismisses the
  banner, and shows the normal empty state (TOR-06-I9rZxQC).
- `showInlineError()` renders a problem + next-action message for failures that do not offer
  a reset, e.g. a save refused because browser storage is full
  ("Couldn't save your changes… Remove archived habits to free space." — TOR-01-yNjDWrJ).
- `dismissBanner()` clears the message region.
- **Mid-session save failures (Epic AQNWtiB):** a refused save from any habit action
  (`addHabit` / `archiveHabit` / `restoreHabit` / `toggleToday`) routes to one handler in
  `src/app.ts`
  (`handleSaveFailure`), which re-checks `loadState()`: an unreadable document gets the
  recovery banner (data became unreadable mid-session), otherwise the inline
  "storage is full" message renders. Form validation errors use their own lazily created
  `role="alert"` element next to the input rather than `#error-region` (see the Add-habit
  form section above).

All user-facing errors render in the page (`#error-region` in `index.html`), naming the
problem AND the next action — never console-only, per the error-message standard in
`AGENTS.md`.

**Not yet built:** schema migrations (only `schemaVersion: 1` exists; `unknown-schema-version`
currently routes to the recovery banner).

### Logging

`src/lib/logger.ts` exposes `log.debug/info/warn/error`, each emitting a single
human-readable plain-text line `[LEVEL] message` via the matching console method
(`console.debug/info/warn/error`).

---

## 7. Background Services

None — a client-only SPA has no background services. Any recurring client-side work
(e.g., date rollover handling) will be documented under Frontend Architecture.

---

## 8. Container / Infrastructure

No container image — the production artifact is the static output of `npm run build`
(`tsc --noEmit && vite build`), emitted to `dist/`. Deployment is static hosting of
`dist/` (target TBD, e.g., GitHub Pages). There is no server, no CI pipeline yet (when one
is added it should run the quality gates on every PR and respond to `vX.Y.Z` tags).

---

## 9. Security & Access

No authentication or authorization — the app is entirely local to the user's browser. No
secrets are handled. The Security Baseline in `AGENTS.md` applies to all implementation.
