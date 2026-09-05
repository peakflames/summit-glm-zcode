# Summit — Design Decision Notes

> Refreshed by `/peak-workflow:refresh-docs` after Epics tVQOvBV (Project Scaffold & App
> Shell), C1R8qkJ (Persistence Store & Recovery), AQNWtiB (Habit Management UI),
> m1i25n4 (Daily Check-in & Streaks — all completed 2026-09-04), XDc5Tpp
> (Filtering, Views & Offline Verification — completed 2026-09-05), NZK8kqE
> (PeakFlames Design System — completed 2026-09-04), and lfstJmm (Row UI Parity —
> completed 2026-09-05). Sections 1–5 are the
> original planning decisions from `/peak-workflow:setup` (verified still accurate);
> section 6+ are as-built decisions consolidated from the epics' session handoffs.

---

These notes capture design decisions and rationale that complement the Architecture Document.

---

## 1. Client-only SPA

**Decision:** No backend, no server, no network calls — all logic runs in the browser.

**Rationale:** Keeps the reference example for the peak-workflow plugin minimal and
self-contained; the whole workflow lifecycle can be walked end to end with zero
infrastructure.

## 2. localStorage as sole persistence

**Decision:** Habits and completion history are persisted to `localStorage` under a
namespaced key with a schema version.

**Rationale:** The natural persistence for a client-only app; schema versioning keeps
future migrations possible without a backend.

## 3. Vite + TypeScript + npm, no UI framework

**Decision:** Hand-rolled DOM/TypeScript on a Vite scaffold, managed with npm.

**Rationale:** Fewer moving parts keeps the end-to-end lifecycle walkthrough readable;
a framework would add a decision the project doesn't need at this size.

## 4. Version from package.json

**Decision:** `package.json#version` is the single source of truth; the app footer and the
startup console line read from it.

**Rationale:** One place to bump; Vite's define mechanism wires it into the app without a
second definition to keep in sync.

## 5. Reference-example quality bar

**Decision:** Favor clarity and a clean peak-workflow lifecycle walkthrough over feature
breadth; no new dependency without an explicit recorded decision.

**Rationale:** The repo's audience is people learning the peak-workflow workflow, not
end users needing features.

---

## 6. Version flows through exactly one path (Epic tVQOvBV)

**Decision:** The version travels `package.json#version` → Vite `define`
(`__APP_VERSION__`) → `src/lib/version.ts` (`APP_NAME`/`APP_VERSION`) → footer and startup
stamp. `vite.config.ts` and `vitest.config.ts` both read `package.json` and inject the same
define, so tests see the identical value. No other module may hardcode a version string.

**Rationale:** A single, greppable flow makes the "single source of truth" rule verifiable —
`package.json#version` is the only version literal in the repo (confirmed during wrapup).

## 7. Startup stamp is the first console record (Epic tVQOvBV)

**Decision:** `log.info("Summit vX.Y.Z starting")` is the first statement of the boot
sequence in `src/main.ts`, before `renderApp()` and before any module can log. A test spies
on all four console methods before importing `main.ts` and asserts the first record is the
stamp at the `info` level (TOR-01-WqWceSw).

**Rationale:** The startup stamp is the browser-side analog of process-startup version
stamping (AGENTS.md tool hygiene); ordering it first guarantees diagnostic context is
available from the very first log line, even if later boot steps fail.

## 8. Plain-text `[LEVEL] message` logger (Epic tVQOvBV)

**Decision:** `src/lib/logger.ts` exposes `log.debug/info/warn/error`, each emitting one
human-readable line `[LEVEL] message` through the matching console method
(`console.debug/info/warn/error`).

**Rationale:** Matches the AGENTS.md logging convention exactly; keeping the format
trivially parseable and the level-to-console-method mapping 1:1 makes log assertions in
tests and console filtering in the browser both straightforward.

## 9. Namespaced storage key with schemaVersion; full store as built (Epic tVQOvBV, C1R8qkJ)

**Decision:** All persistence lives under the single key `summit.habits.v1`
(`STORAGE_KEY`), holding one JSON document with a `schemaVersion` field
(`SCHEMA_VERSION = 1`). Epic tVQOvBV built the read path (absent key → clean empty state,
TOR-06-7l9Trjh); Epic C1R8qkJ completed the store: `loadState` (validated, typed load
result), `saveState` (immediate whole-document write), and `updateState` (canonical
mutation path). See sections 13–15 for the C1R8qkJ decisions.

**Rationale:** Namespacing + schema versioning make future migrations possible without a
backend (decision 2). Building the read path first let the app shell render an honest empty
state end to end before any mutation logic existed, and keeping each epic's scope small kept
it independently verifiable.

## 10. Dev-only dependencies, zero runtime dependencies (Epic tVQOvBV)

**Decision:** All dependencies are devDependencies: `vite`, `typescript`, `vitest`,
`happy-dom`, `eslint`, `typescript-eslint`, `@eslint/js`, `@types/node`. Nothing ships to
the browser from `node_modules`.

**Rationale:** A client-only hand-rolled DOM app needs no runtime libraries; keeping the
dependency list dev-only preserves the reference-example quality bar (decision 5). Lesson
recorded from this epic: happy-dom 15 paired with vitest 2 dropped
`window.localStorage`; the resolved current majors (happy-dom 20.14.0, vitest 5.0.0)
fixed it — avoid downgrading those two packages independently.

## 11. Static semantic shell, hydrated once, fail-fast (Epic tVQOvBV)

**Decision:** `index.html` carries the full semantic shell markup (header, add-habit
input + Add button, filter/list/footer sections). `renderApp()` in `src/app.ts` runs
exactly once at boot: it queries the five anchor elements and, if any is missing, logs an
error and throws instead of rendering a partial UI. There is no router and no re-render
loop; later epics re-render individual sections on state changes. *(As of Epic AQNWtiB:
`renderApp()` queries four anchors — `#filter`, `#habit-list`, `#footer`, `#error-region` —
with the add-habit form's three anchors fail-fast-checked by `initHabitForm()`, and the
habit list does re-render on every mutation and filter change; see decisions 18 and 20.)*

**Rationale:** Static markup keeps the app usable and inspectable before JavaScript runs
and makes the shell's structure reviewable in one file; fail-fast wiring catches markup
drift at boot rather than degrading silently. The single-screen design means a router
would be pure overhead.

## 12. Tests mirror the TOR Gherkin (Epic tVQOvBV)

**Decision:** The vitest suites (28 tests across 6 files at Epic tVQOvBV's close; 49
tests across 8 files after Epic AQNWtiB; 77 tests across 9 files after Epic m1i25n4;
99 tests across 11 files after Epic XDc5Tpp; 102 tests across 12 files after Epic
NZK8kqE, which added `src/ui/design-system.test.ts` — 3 design-system contract tests —
with all 99 pre-existing tests passing unmodified; 110 tests across the same 12 files
after Epic lfstJmm, which retargeted the checkbox selections to the toggle button and
added the help-hint / DAY-STREAK-caption tests,
co-located with the code under `src/`) are
written to exercise each TOR's Given/When/Then from
`docs/requirements/*.feature.md`, and the handoff's TOR Coverage table maps every TOR ID to
its test reference.

**Rationale:** Tracing tests directly to TOR IDs makes `npm run test` a repeatable
verification of the requirements baseline, and makes gaps visible at a glance during
wrapup.

## 13. `updateState` is the one canonical mutation path (Epic C1R8qkJ)

**Decision:** Every state mutation goes through `updateState(fn)` in `src/lib/storage.ts`:
load → mutate → save immediately. There is no save button and no delay — writes hit
`localStorage` on the same tick as the mutation (TOR-06-OcAYtZQ). `updateState` refuses to
write when the stored document is unreadable (`reason: 'unreadable-storage'`), so v1 never
rewrites a document it does not understand; recovery ("Start fresh") has to happen first.
As built, the AQNWtiB habit actions (`addHabit` / `archiveHabit` / `restoreHabit`, see
decisions 16–17) and the m1i25n4 `toggleToday` (decision 22) route through it; the
XDc5Tpp UI (filter switching, row actions) reuses the same wired path — all mutations
flow through `updateState`.

**Rationale:** A single write-through choke point makes "is the data saved?" trivially
answerable, eliminates lost-update classes of bugs, and gives the unreadable-data invariant
one enforcement point instead of one per UI control. Refusing to overwrite unreadable data
protects a document v1 can't parse from being destroyed by a blind empty-state write.

## 14. `loadState` returns a typed result; unreadable data is never silently empty (Epic C1R8qkJ)

**Decision:** `loadState()` returns `{ status: 'ok', state }` or
`{ status: 'unreadable', reason }` with reasons `invalid-json` (corrupt JSON),
`unknown-schema-version` (a `schemaVersion` other than 1), or `invalid-shape`. Structural
validation is enforced: a document claiming `schemaVersion: 1` but carrying malformed
habits is `invalid-shape`, not trusted. Only an absent key yields a clean empty state
(TOR-06-7l9Trjh preserved — the old `readState()` was replaced and its test updated).

**Rationale:** Silently returning an empty state on unreadable data would destroy the
user's history the moment any mutation wrote through. The typed result forces the boot
code to branch on recoverability explicitly, and structural validation means a
half-written or hand-edited v1 document is treated as suspect rather than trusted.

## 15. In-page recovery banner and inline errors (Epic C1R8qkJ)

**Decision:** `src/ui/error-banner.ts` renders all user-facing errors into the static
`#error-region` in `index.html` — never console-only, per the error-message standard.
`showRecoveryBanner()` is the unreadable-data path: a `role="alert"` banner whose message
varies by reason (corrupted data vs. data written by a newer version) but always names the
problem and offers the same **"Start fresh"** action, which resets to a clean empty v1
document (TOR-06-PlcuFFf, TOR-06-CStJTf4, TOR-06-I9rZxQC). `showInlineError()` covers
failures without a reset, e.g. a quota-refused save ("Couldn't save your changes… Remove
archived habits to free space." — TOR-01-yNjDWrJ); `dismissBanner()` clears the region.

**Rationale:** Unreadable storage is a first-class boot state, not an edge case — an
in-page, screen-reader-announced (`role="alert"`) banner is the only honest surface for
it. One banner component with a reason-keyed message keeps the recovery UX identical
across failure modes while still telling the user what actually happened. The static
`#error-region` matches the static-shell, hydrated-once pattern (decision 11).

## 16. Duplicate names are deliberate; the only name constraints are non-empty + ≤80 characters (Epic AQNWtiB)

**Decision:** `addHabit(name)` in `src/lib/habits.ts` rejects whitespace-only input
(`empty-name`) and names longer than `MAX_HABIT_NAME_LENGTH` (80) characters
(`name-too-long`) — with surrounding whitespace trimmed before both the length check and
storage, so exactly 80 visible characters is accepted and 81 is not. Duplicate habit names
are deliberately allowed per the PV §6 recorded decision: each add creates an independent
`Habit` (distinct `crypto.randomUUID()` id, own `completions` array), rendered as its own
row.

**Rationale:** Duplicates-as-independent-rows is a product decision recorded in the
product vision (§6), so a uniqueness constraint would be an unrequested feature. The
duplicate TOR (TOR-02-f9diV8o) verifies the *independence* of the rows, checked at the
state level (`src/lib/habits.test.ts:81`) — and the interaction-level re-check landed
with the toggle in epic m1i25n4 and passed: duplicate rows stay independent when both
are checked and unchecked (`src/app.test.ts:635`).

## 17. Habit store actions return a typed result; one mid-session save-failure handler (Epic AQNWtiB)

**Decision:** `addHabit` / `archiveHabit` / `restoreHabit` each return a
`HabitActionResult` — `{ ok: true, state, habit }` or `{ ok: false, reason }` with reasons
`empty-name`, `name-too-long`, `unknown-habit`, `quota-exceeded`, `unreadable-storage`.
Store-level refusals (quota, unreadable storage) are delegated upward: the form's
callbacks expose `onSaveFailed`, and `src/app.ts` funnels every refusal into one
`handleSaveFailure()` that re-checks `loadState()` — an unreadable document gets the
recovery banner, anything else gets the inline save-failed message.

**Rationale:** Mirrors the `loadState` typed-result pattern (decision 14) and keeps the
store modules DOM-free. Branching "recovery banner vs. inline error" in exactly one place
means a refused save is interpreted the same way regardless of which control triggered it,
and the re-check (rather than trusting the error reason) means a mid-session corruption is
caught by the same code path as boot-time corruption.

## 18. Add button and Enter submit through one shared path (Epic AQNWtiB)

**Decision:** `initHabitForm()` in `src/ui/habit-form.ts` wires both the Add button click
and Enter-in-input to the same `submit()` function, which calls `addHabit`, clears the
input, clears any validation error, and re-renders via the `onChanged` callback on
success (TOR-02-XOoULU3, TOR-02-w9nrh1o).

**Rationale:** Two entry points into one function cannot drift — one validation behavior,
one error surface, one input-clearing rule — instead of two event handlers that must be
kept in sync by convention.

## 19. Validation errors are lazy `role="alert"` elements, removed when cleared (Epic AQNWtiB)

**Decision:** The add-habit form's inline validation error is a `.form-error`
`<p role="alert">` created only when an error occurs and removed (`errorEl.remove()`)
when cleared; any new input clears a stale error immediately. The static shell never
carries a dormant `[role="alert"]` element.

**Rationale:** The recovery-banner logic and the pre-existing TOR-01/06 test suites key on
alert elements in the page; a permanently-present empty `role="alert"` would collide with
those selectors and mis-announce to screen readers. Lazy creation keeps the static shell
free of live-region markup while errors still get announced when they actually appear
(TOR-02-flxKIoM, TOR-02-lMWubKc).

## 20. Minimal filter behavior (Epic AQNWtiB); superseded by the full filter epic (XDc5Tpp)

**Decision:** At AQNWtiB the All/Active/Archived filter was minimal row visibility with
per-filter empty-state messages, hosted by a scaffold `<select>`; in AQNWtiB the "Done
today" checkbox rendered as an unchecked, unwired mount and the streak badge rendered a
hardcoded `0` (`src/ui/habit-row.ts`). Both deferrals are closed: the checkbox/badge
were wired and made history-derived in Epic m1i25n4 (decisions 21–23), and the full
filtering/views epic shipped as XDc5Tpp (decision 26), replacing the select with the
three-segment control.

**Rationale:** Phase decomposition, same precedent as C1R8qkJ's row-rendering deferral:
the full filtering/views epic is XDc5Tpp. The minimal filter exists so the Archived view
can host the restore flow (TOR-02-E0o3IbX). Deferring the check-in toggle let AQNWtiB
ship an independently verifiable slice; badge value 0 was correct for every habit the UI
could create at the time — no UI path could produce a completion yet.

---

## 21. Pure streak engine with an injectable `today`; local-date keying, never UTC (Epic m1i25n4)

**Decision:** `src/lib/streaks.ts` holds the normative PV §6 rule — the current streak is
the count of consecutive completed local calendar days ending today if today is
completed, otherwise ending yesterday, otherwise 0 — as a pure function
`currentStreak(completions, today?)`. `today` is an optional parameter defaulting to
`todayLocalDate()`, so every clause of the rule is unit-testable without DOM, storage, or
a global clock read. Completion keys are formatted from the `Date`'s **local** fields
(`localDateKey`), deliberately never `toISOString()`, which is UTC and would shift the
day boundary for users far from UTC (TOR-03-albP5kN). `addDays()` parses keys to local
midnight so month/year boundary rolls stay on the user's own calendar.

**Rationale:** The streak rule is the app's core business logic, so it lives in a pure,
dependency-free module that the rule table from the requirement file can be transcribed
into verbatim (`src/lib/streaks.test.ts`). Local-field keying was confirmed live during
verification: a check-in at local 2026-09-04 while the UTC instant was already
2026-09-05 stored exactly `["2026-09-04"]`.

## 22. `toggleToday` is idempotent by membership check inside the canonical mutation path (Epic m1i25n4)

**Decision:** `toggleToday(id)` in `src/lib/habits.ts` computes `todayLocalDate()` once,
then inside the `updateState` mutation removes today's key from the habit's
`completions` if present, or appends it if not. The membership check — not a UI flag —
makes the toggle idempotent: repeated toggles and reloads can never produce a duplicate
entry (TOR-03-zr7VepE). It reuses the existing `HabitActionResult` error paths
(`unknown-habit`, `quota-exceeded`, `unreadable-storage`) rather than introducing a new
result type.

**Rationale:** Idempotence at the data layer survives any UI bug, double-fired event, or
stale render; enforcing it inside the mutation means the state in storage can never hold
two copies of a date. Reusing the typed result keeps the store's error surface at
exactly five reasons and lets the toggle ride the same mid-session save-failure handler
as every other habit action (decision 17).

## 23. The row is a pure function of the habit; badges update through the existing re-render path (Epic m1i25n4)

**Decision:** `renderHabitRow` derives everything from the habit: the done control's
state (`checked` on the m1i25n4 checkbox; `aria-pressed` on the lfstJmm toggle button,
decision 29) is `completions.includes(today)` and the badge is
`currentStreak(completions)`. `src/app.ts` wires
`onToggle: (id) => runAction(toggleToday(id))` — the same in-memory-mirror re-render path
as archive/restore — so a toggle updates the badge in place on the same `#habit-list`
element with no reload (TOR-04-Ft8iQbI), and an archive → restore round-trip recomputes
the badge from preserved history with no special casing (TOR-04-GN2fJoI).

**Rationale:** With no per-widget imperative updates to keep in sync, a rendered row
cannot drift from the stored history — every render is history-derived. Routing the
toggle through the existing `runAction` path means there is exactly one state-→-render
flow for every mutation, and the same-element re-render keeps focus and scroll position
stable while the badge updates instantly.

## 24. Test-environment neutrality for the late-evening local-date scenario (Epic m1i25n4 spec deviation)

**Decision:** TOR-03-albP5kN as written names a specific scenario ("local time is
2026-09-04 23:30 while the UTC date is already 2026-09-05"). The tests pin the local
wall-clock fields (`new Date(2026, 8, 4, 23, 30)`, `vi.setSystemTime`) and assert the
**local** key `"2026-09-04"` instead of pinning a specific UTC offset. The wrapup judged
this no deviation in substance: the scenario's contract is "local, not UTC," which the
tests verify exactly (`src/lib/streaks.test.ts:49`, `src/lib/habits.test.ts:251`).

**Rationale:** Pinning a UTC offset would make the suite environment-dependent — failing
on CI machines in other timezones — while asserting less than the contract actually
requires. Asserting the local key under fake timers tests the invariant itself.

---

## 25. Three-segment radiogroup with derived selection, not a dropdown (Epic XDc5Tpp)

**Decision:** The All/Active/Archived filter is a `role="radiogroup"` of three segment
buttons (`src/ui/filter-bar.ts`), each `role="radio"` with `aria-checked` and
`.is-selected` on the selected one, replacing the AQNWtiB scaffold `<select>`. The app
holds `filter` state defaulting to `'active'` (TOR-05-PrNhHoE); the selected segment is
re-derived from that state on every render — never patched in place — and a segment
click re-renders the bar and list together (TOR-05-GjGNESQ).

**Rationale:** With the current view always visible and one click to switch, the daily
list stays uncluttered without hiding where you are. Deriving selection per render keeps
the bar a pure function of state like every other rendered region — there is no
selection-mutation code path to drift — and radiogroup semantics give assistive tech the
"exactly one of three selected" contract for free.

## 26. Per-view rows and empty states as a pure message table (Epic XDc5Tpp)

**Decision:** Row visibility lives in `visibleHabits(state, filter)` and empty-state
copy in `emptyStateMessage(state, filter)` (both in `src/ui/habit-list.ts`) — each a
pure `switch` over the filter. The Active empty state distinguishes "nothing yet"
("No habits yet. Add your first habit above.") from "everything is archived"
("No active habits."), matching the TOR-05-0maiBlC message table verbatim. Archived
rows carry a visible `.archived-tag` and offer Restore rather than Archive
(`src/ui/habit-row.ts`), which visually distinguishes them in the shared All view
(TOR-05-sAMxFFs, TOR-05-qD4GGzl).

**Rationale:** A pure function of `(state, filter)` cannot render a row that doesn't
belong to the view, and transcribing the requirement's message table directly into code
makes the TOR test a verbatim transcription too. The "no habits yet" vs "no active
habits" split is the difference between pointing the user at the add form and telling
them their data is safe but filtered — one message for both cases would mislead one of
the two states.

## 27. Offline capability is architectural, verified by a flat resource timeline (Epic XDc5Tpp)

**Decision:** TOR-01-0d73l6K (zero network requests, fully functional offline) holds by
construction: no network API (`fetch`, `XMLHttpRequest`, WebSocket) exists anywhere in
`src/`, and all actions run locally against `localStorage` through the canonical
mutation path. Verification was an in-page simulation: a full live action session (add,
check-in, archive, restore, filter) with the append-only `performance` resource timeline
measured flat across it (15 → 15 entries in the implementer's session; 16 → 16 in the
independent reviewer's), plus a reload asserting persisted state. A dev-server page
cannot refetch its own shell with the network cut, so the substance — zero requests for
the actions, full functionality, persistence after reload — was demonstrated rather than
a literal network-off toggle.

**Rationale:** For a client-only SPA, "offline" is not a mode the code enters but a
property of what the code never does; a static no-network-APIs check plus a flat
resource timeline is a stronger, repeatable signal than one manual DevTools session.
The deviation is recorded in the epic handoff and judged no deviation in substance,
mirroring the TOR-03-albP5kN precedent (decision 24).

---

## 28. PeakFlames Design System adoption: vendored token CSS + strictly additive `.pf-*` classes (Epic NZK8kqE)

**Decision:** Summit's visual direction is the PeakFlames Design System (product vision
§9, v1.1; TOR baseline `07-visual-design.feature.md`). The 11 token CSS files are
vendored **byte-identical** into `src/styles/peakflames/` (source: the sibling `summit`
repo's verified copy of the design project — no DesignSync access in this environment);
`src/styles.css` imports that layer first and keeps only Summit-specific layout. The
restyle is **strictly additive and visual**: every original class name stays on its
element and `.pf-*` classes are added alongside (e.g. `habit-row pf-card`,
`filter-segment pf-tab`, `habit-action pf-btn pf-btn--secondary`), so no DOM element,
attribute, or copy changes and the entire pre-existing test suite passes unmodified —
the epic's primary regression signal.

**Rationale:** Byte-identical vendoring keeps the token layer upgradeable by re-copying
from the design source, and the additive-class constraint means the visual change can
never regress behavior the tests pin: tests select by the original class names, so any
accidental DOM change fails a test rather than silently shipping. Three spec-vs-repo
frictions were reconciled at implementation time: (1) the spec's literal
`@import './peakflames/styles.css'` line doesn't resolve from `src/styles.css` (the
vendored location is `src/styles/peakflames/`) — the import is
`./styles/peakflames/styles.css`; (2) this repo builds with Vite 8/rolldown, which
resolves CSS `@import` differently from the sibling's Vite 5, so the import uses the
`url(...)` form; and (3) the spec's `pf-label` on `.streak-badge` was rejected —
`pf-label` is mono/micro/muted and would defeat TOR-07-pa7ak24 prominence, so
`.streak-badge` keeps only its own class and takes the amber treatment directly
(display face, `--text-h3`, bold, `--text-accent`). Likewise, at NZK8kqE the done
control was a checkbox in this repo, keeping `.habit-done` semantics (no DOM change)
with a pf-check-style CSS treatment whose checked state was success green
(`--status-success`), not flame — honoring the spec's "done must NOT carry the flame
accent" note. *(Superseded in Epic lfstJmm: the done control is now an `aria-pressed`
toggle button — decision 29 — carrying the same success-green done state over to
`.habit-done-btn[aria-pressed='true']`, and `.streak-badge` gained the
number + "DAY STREAK" caption structure of decision 30.)* The
one-hot-element rule (Add button is the sole `pf-btn--primary`), the ember-gradient
filter selection (`pf-tab--active` toggled with `is-selected`), and the amber
`.streak-badge` prominence treatment are recorded in architecture.md §6. Webfonts ride
the vendored `tokens/fonts.css` Google Fonts `@import` plus `preconnect` links in
`index.html`, with system-font fallback stacks in the `--font-*` variables
(TOR-07-ywpamQm pins the degradation path live with the CDN blocked).

---

## 29. The check-in control is an `aria-pressed` toggle button, not a checkbox (Epic lfstJmm)

**Decision:** Each habit row's done control is a `<button type="button" aria-pressed>`
labeled "Done today" (undone) / "Done ✓" (done) —
`habit-done-btn pf-btn pf-btn--secondary` for the neutral outlined at-rest treatment
(transparent background + `--border-strong`), with the done state as Summit CSS on
`.habit-done-btn[aria-pressed='true']`: success green (`--status-success` background and
border, obsidian text) — never `--accent` or `pf-btn--primary`
(TOR-03-WUQGIE9, TOR-03-M5RmMBx, TOR-07-OgGR571). It reuses the row's existing
`onToggle` callback path unchanged, and the pressed state is derived from
`habit.completions.includes(todayLocalDate())` exactly as the checkbox's `checked` state
was — so the row stays a pure function of the habit (decision 23) and the m1i25n4
toggle machinery (`toggleToday`, decision 22) is untouched. The obsolete `.habit-done`
checkbox rules were removed from `src/styles.css`.

**Rationale:** A pressed-state button reads as a deliberate daily action and gives
assistive tech the toggled state without checkbox semantics sitting next to the row's
action buttons. Keeping the derivation identical meant the store, streak engine, and
re-render path needed zero changes — the full suite staying green (110/110) was the
regression signal. The one-hot-element rule (decision 28, TOR-07-EXjNoVz) is preserved:
the Add button remains the sole flame-accented control, and the done state's success
green is the spec's "done must NOT carry the flame accent" note applied to the button.
(The ember tint observed mid-verification on the undone button was the vendored
`pf-btn--secondary:hover` rule with the pointer parked on it — at rest the undone state
is neutral.)

## 30. Streak badge = amber number over a mono "DAY STREAK" caption (Epic lfstJmm)

**Decision:** `.streak-badge` is restructured into two stacked spans: `.streak-number`
(the amber display-face hero number — unchanged TOR-07-pa7ak24 treatment, now with
`tabular-nums`) and `.streak-caption` ("DAY STREAK", mono caption ramp: `--font-mono`,
`--text-micro`, `--tracking-eyebrow`, uppercase, muted). Every badge on every row —
active and archived alike — carries the caption (TOR-04-rknaMfI); the badge's
`Current streak: N` aria-label is unchanged, and the number keeps its amber treatment
rather than adopting the rejected `pf-label` class (decision 28).

**Rationale:** A bare number next to a habit name is ambiguous; an eyebrow-style mono
caption names the metric without competing with the hero number, following the design
system's caption ramp (cf. `.pf-label` in the vendored token layer) directly rather
than reusing that muted class, which would defeat the prominence TOR. The badge keeps
its `Current streak: N` aria-label, so screen readers get the sentence, sighted users
get the label, and neither is worse off.

## 31. The Active view teaches the streak rule with a one-line help hint (Epic lfstJmm)

**Decision:** `renderHabitList()` in `src/ui/habit-list.ts` prepends a
`p.habit-help-hint.pf-hint` — "Mark done tomorrow to continue a streak — a missed day
resets it to 1." (exact TOR-04-HiRBSAa wording) — as the first element of the list
region on the Active filter only; it is absent on Archived and All, and the region is
cleared via `replaceChildren()` before each render, so the hint never duplicates or
lingers across filter switches. The hint renders before the rows or the empty state,
so it is present even when the Active list is empty.

**Rationale:** The streak rule's reset clause is the one behavior users discover only
by losing a streak; surfacing it exactly where the daily list is read teaches it before
it matters. Keying the hint to Active keeps the Archived audit view and the All
inventory view uncluttered, and deriving it per render from the filter (like everything
else in the list region) keeps the list a pure function of `(state, filter)`.

## 32. Known Issues and Deferred Work

- **Favicon 404 (non-blocking):** browsers auto-request `/favicon.ico` and the Vite dev
  server returns a 404, producing one console error per page load. No TOR requires an
  icon; candidate for `/peak-workflow:quick-fix`. (Epic tVQOvBV wrapup; carried through
  C1R8qkJ, AQNWtiB, m1i25n4, XDc5Tpp, NZK8kqE, and lfstJmm.)
- **Brand webfonts load from Google Fonts CDN:** the vendored `tokens/fonts.css`
  fetches the brand webfonts from Google Fonts on first load (per ConOps §6 and the
  epic spec); TOR-07-ywpamQm pins the system-fallback degradation path. If licensed
  font files ever become available, swap the `@import` for local `@font-face` rules per
  the file's own substitution note. (Epic NZK8kqE handoff.)
- **`saveState` maps any `setItem` failure to `quota-exceeded`:** a blocked-storage
  `SecurityError` (localStorage disabled) would be mislabeled as "storage is full" in the
  inline message. Cosmetic message-accuracy nit for a future quick-fix. (Epic C1R8qkJ
  wrapup.)
- **Schema migrations:** not needed yet — `schemaVersion: 1` is the only version; an
  unknown version currently routes to the recovery banner ("Start fresh"). Migrations are
  future scope when a schema change first ships.
- **Hosting target:** GitHub Pages — `.github/workflows/deploy-pages.yml` deploys `main`
  to `https://peakflames.github.io/summit-glm-zcode/` on every push (see AGENTS.md's
  Deployment section for the base-path gate).
- **CI pipeline:** the deploy workflow runs the quality gates (lint, tests, build) on
  pushes to `main`; per-PR gates and `vX.Y.Z` tag responses are still future work.

*(No new known issues from Epic lfstJmm. Closed in m1i25n4: the "unwired row mounts"
item — the "Done today" checkbox and streak badge are wired, TOR-03/TOR-04 coverage is in
place, and duplicate-row independence was re-verified at the interaction level, closing
the AQNWtiB follow-up from decision 16.
Closed in XDc5Tpp: the "minimal filter behavior" item — the full filtering/views epic
shipped the three-segment control, per-view rows with the archived tag, and the
TOR-05-0maiBlC empty states, closing the AQNWtiB deferral from decision 20.)*
