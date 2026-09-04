# Epic tVQOvBV: Project Scaffold & App Shell

**Phase:** 1 — Foundation
**Status:** Complete — 2026-09-04
**Dependencies:** —

> **Brand:** Use the project's brand guidelines skill for the app shell layout and footer if one is configured.

---

## Description

This epic stands up the Vite + TypeScript project and the boot-time behavior every later epic
depends on: a single-screen app shell (header, "Add habit" input with Add button, filter
control, list area, footer) that renders with zero setup, plus the cross-cutting version and
diagnostics plumbing. The version shown in the footer and stamped into the startup console
line both derive from `package.json#version` — the single source of truth declared in the
Tool Hygiene & Operability section of `AGENTS.md`. It also covers the clean first-run
behavior when no saved data exists yet (reading the storage key through the persistence
module's read path, which Epic C1R8qkJ completes). This epic serves PV Goal G6 (zero setup),
G7's transparency intent, and the baseline tool-hygiene TORs.

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
| TOR-01-9FydwtZ | `docs/requirements/01-app-shell.feature.md` | The application footer shall display the application name and semantic version in the format "Summit vX.Y.Z", sourced from package.json#version |
| TOR-01-WqWceSw | `docs/requirements/01-app-shell.feature.md` | The application shall emit a startup log line containing its name and semantic version at INFO level as the first console record on boot |
| TOR-01-QdBg1u6 | `docs/requirements/01-app-shell.feature.md` | The application shall define its semantic version in exactly one source, package.json#version, such that a change there changes both the footer and the startup log line |
| TOR-01-LWNJkRM | `docs/requirements/01-app-shell.feature.md` | The application logger shall emit records at the DEBUG, INFO, WARN, and ERROR levels in human-readable plain-text format "[LEVEL] message" via the corresponding console methods |
| TOR-01-UBs4L4y | `docs/requirements/01-app-shell.feature.md` | The application shall boot directly into a usable single-screen interface with no account, configuration, or setup step |
| TOR-06-7l9Trjh | `docs/requirements/06-persistence.feature.md` | The application shall start cleanly with an empty state and no error when the storage key is absent |

## Key Components

- `package.json` — Vite + TypeScript (strict) scaffold; `version` field is the single source of truth; `dev`, `build`, and (if chosen during epic planning) `lint` scripts
- `vite.config.ts` — inject `package.json#version` into the app (e.g., via `define`)
- `index.html` — semantic shell markup: header, Add-habit input + button, filter control mount, list area, version footer
- `src/main.ts` — entry point: boot sequence, startup console stamp
- `src/app.ts` — shell render and wiring
- `src/lib/version.ts` — version constant read from the Vite define
- `src/lib/logger.ts` — DEBUG/INFO/WARN/ERROR logger with `[LEVEL] message` plain-text format
- `src/lib/storage.ts` — read-only skeleton (absent key → empty state); completed by Epic C1R8qkJ
- `src/styles.css` — minimal single-screen layout styles
