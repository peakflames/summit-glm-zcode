# Summit — Design Decision Notes

> Refreshed by `/peak-workflow:refresh-docs` after Epics tVQOvBV (Project Scaffold & App
> Shell) and C1R8qkJ (Persistence Store & Recovery, both completed 2026-09-04). Sections 1–5
> are the original planning decisions from `/peak-workflow:setup` (verified still accurate);
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
loop; later epics re-render individual sections on state changes.

**Rationale:** Static markup keeps the app usable and inspectable before JavaScript runs
and makes the shell's structure reviewable in one file; fail-fast wiring catches markup
drift at boot rather than degrading silently. The single-screen design means a router
would be pure overhead.

## 12. Tests mirror the TOR Gherkin (Epic tVQOvBV)

**Decision:** The vitest suites (28 tests across 6 files, co-located with the code under
`src/`) are written to exercise each TOR's Given/When/Then from
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
Phase-3 epics (AQNWtiB, m1i25n4, XDc5Tpp) must wire their UI controls through it.

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

---

## 16. Known Issues and Deferred Work

- **Favicon 404 (non-blocking):** browsers auto-request `/favicon.ico` and the Vite dev
  server returns a 404, producing one console error per page load. No TOR requires an
  icon; candidate for `/peak-workflow:quick-fix`. (Epic tVQOvBV wrapup; carried through
  C1R8qkJ.)
- **`saveState` maps any `setItem` failure to `quota-exceeded`:** a blocked-storage
  `SecurityError` (localStorage disabled) would be mislabeled as "storage is full" in the
  inline message. Cosmetic message-accuracy nit for a future quick-fix. (Epic C1R8qkJ
  wrapup.)
- **Schema migrations:** not needed yet — `schemaVersion: 1` is the only version; an
  unknown version currently routes to the recovery banner ("Start fresh"). Migrations are
  future scope when a schema change first ships.
- **Phase 3 consumes this store:** habit-row rendering, streaks, and the
  add/toggle/archive/restore controls (AQNWtiB → m1i25n4 → XDc5Tpp) must route mutations
  through `updateState`.
- **Hosting target:** the production artifact is static `dist/` output; hosting target
  (e.g., GitHub Pages) is TBD.
- **No CI pipeline:** when one is added, configure it to run the quality gates on every
  PR and to respond to `vX.Y.Z` tags.
