# Summit — Design Decision Notes

> Refreshed by `/peak-workflow:refresh-docs` after Epic tVQOvBV (Project Scaffold & App
> Shell, completed 2026-09-04). Sections 1–5 are the original planning decisions from
> `/peak-workflow:setup` (verified still accurate); sections 6+ are as-built decisions
> consolidated from the epic's session handoffs.

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

## 9. Namespaced storage key with schemaVersion; read path first (Epic tVQOvBV)

**Decision:** All persistence lives under the single key `summit.habits.v1`
(`STORAGE_KEY`), holding one JSON document with a `schemaVersion` field
(`SCHEMA_VERSION = 1`). Epic tVQOvBV implemented only the read path: `readState()` returns
a clean empty state when the key is absent — no throw, no console error (TOR-06-7l9Trjh).
The write path, unreadable-data recovery banner, and migrations are deliberately deferred
to Epic C1R8qkJ.

**Rationale:** Namespacing + schema versioning make future migrations possible without a
backend (decision 2). Building the read path first lets the app shell render an honest
empty state end to end before any mutation logic exists, and keeps each epic's scope
small and independently verifiable.

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

**Decision:** The 11 vitest tests (5 files, co-located with the code under `src/`) are
written to exercise each TOR's Given/When/Then from `docs/requirements/*.feature.md`, and
the handoff's TOR Coverage table maps every TOR ID to its test reference.

**Rationale:** Tracing tests directly to TOR IDs makes `npm run test` a repeatable
verification of the requirements baseline, and makes gaps visible at a glance during
wrapup.

---

## 13. Known Issues and Deferred Work

- **Favicon 404 (non-blocking):** browsers auto-request `/favicon.ico` and the Vite dev
  server returns a 404, producing one console error per page load. No TOR requires an
  icon; candidate for `/peak-workflow:quick-fix`. (Epic tVQOvBV wrapup)
- **Storage write path, recovery banner, migrations:** intentionally not implemented in
  Epic tVQOvBV — Epic C1R8qkJ's scope (corrupt JSON / unknown schemaVersion → "Start
  fresh" banner). Until then `readState()` returns the empty state for any key content.
- **Hosting target:** the production artifact is static `dist/` output; hosting target
  (e.g., GitHub Pages) is TBD.
- **No CI pipeline:** when one is added, configure it to run the quality gates on every
  PR and to respond to `vX.Y.Z` tags.
