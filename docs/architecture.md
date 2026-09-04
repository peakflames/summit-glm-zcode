# Summit — Architecture Document

> Refreshed to the as-built state by `/peak-workflow:refresh-docs` after Epic tVQOvBV
> (Project Scaffold & App Shell, completed 2026-09-04). Re-run that command after further
> epics to keep this document aligned with the code.

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
├── app.ts               Shell render + wiring
├── styles.css           Single-screen layout
├── vite-env.d.ts        Ambient declaration for __APP_VERSION__
└── lib/
    ├── version.ts       APP_NAME / APP_VERSION (build-time define)
    ├── logger.ts        [LEVEL] message logger (DEBUG/INFO/WARN/ERROR)
    └── storage.ts       localStorage read path (write path: Epic C1R8qkJ)
```

Co-located `*.test.ts` files (5 files, 11 tests) mirror the TOR Gherkin from
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

No UI framework. `index.html` holds the semantic shell markup (header, add-habit input +
Add button, filter section, habit-list section, footer). `renderApp()` in `src/app.ts`
hydrates that static markup once at boot:

- Queries `#filter`, `#habit-list`, `#footer`, `#habit-name`, `#add-habit`. If any element
  is missing it logs an error and throws — fail-fast rather than a silent partial render.
- Renders the All/Active/Archived filter `<select>` into `#filter`.
- Reads state via `readState()` and renders the list area: an empty state ("No habits yet")
  when `state.habits.length === 0`; habit rows arrive in a later epic.
- Renders the version footer (`Summit vX.Y.Z`) into `#footer`.

There is no router and no re-render loop — the shell is rendered once; later epics will
re-render individual sections (e.g., the habit list) on state changes.

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
  `schemaVersion` field (`SCHEMA_VERSION = 1`) so future migrations are possible.
- **Read path (as built):** `readState()` returns a clean empty state
  (`{ schemaVersion: 1, habits: [] }`) when the key is absent — no throw, no console error
  (TOR-06-7l9Trjh).
- **Not yet built:** the write path, unreadable-data recovery banner (corrupt JSON /
  unknown schemaVersion → "Start fresh"), and migrations are Epic C1R8qkJ's scope. Until
  then `readState()` returns the empty state for any key content.

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
