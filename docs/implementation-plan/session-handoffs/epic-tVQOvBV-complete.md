# Epic tVQOvBV: Project Scaffold & App Shell — Complete

**Completed:** 2026-09-04
**Verified by:** Independent review via `/peak-workflow:wrapup-epic tVQOvBV`

## What Was Built

The Vite + TypeScript (strict) scaffold for Summit and its single-screen app shell: header,
"Add habit" input with Add button, All/Active/Archived filter control, habit list area, and a
version footer. Version plumbing reads `package.json#version` at build time via a Vite
`define` and feeds both the footer (`Summit vX.Y.Z`) and the first-console-record startup
stamp (`[INFO] Summit vX.Y.Z starting`); a four-level plain-text logger and a read-only
storage skeleton (absent key → clean empty state) round out the boot path.

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Vite + TS scaffold; `version: 0.1.0` is the single source of truth |
| `vite.config.ts` / `vitest.config.ts` | Inject `__APP_VERSION__` from `package.json#version` |
| `index.html` | Semantic shell markup (header, add form, filter, list, footer) |
| `src/main.ts` | Boot sequence; startup stamp is the first console record |
| `src/app.ts` | Shell render + wiring, empty-state list, version footer |
| `src/lib/version.ts` | `APP_NAME`/`APP_VERSION` from the build-time define |
| `src/lib/logger.ts` | DEBUG/INFO/WARN/ERROR `[LEVEL] message` logger |
| `src/lib/storage.ts` | Read-only skeleton; absent key → empty state (completed by Epic C1R8qkJ) |
| `src/*.test.ts`, `src/lib/*.test.ts` | 11 vitest tests mirroring the TOR Gherkin |

## Key Decisions

- Dev-only dependencies added with plan approval: `vite`, `typescript`, `vitest`,
  `happy-dom`, `eslint`, `typescript-eslint`, `@eslint/js`, `@types/node`. No runtime
  dependencies. (happy-dom 15 / vitest 2 were initially pinned but that combination dropped
  `window.localStorage`; the current majors resolved it.)
- Version flows through exactly one path: `package.json#version` → Vite `define`
  (`__APP_VERSION__`) → `src/lib/version.ts` → footer and startup stamp. No other module may
  hardcode a version string.
- `src/lib/storage.ts` is deliberately read-only in this epic; write path, unreadable-data
  recovery banner, and migrations belong to Epic C1R8qkJ.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-01-9FydwtZ | `docs/requirements/01-app-shell.feature.md` | PASS | src/app.test.ts:50 |
| TOR-01-WqWceSw | `docs/requirements/01-app-shell.feature.md` | PASS | src/main.test.ts:9 |
| TOR-01-QdBg1u6 | `docs/requirements/01-app-shell.feature.md` | PASS | src/lib/version.test.ts:11 |
| TOR-01-LWNJkRM | `docs/requirements/01-app-shell.feature.md` | PASS | src/lib/logger.test.ts:13 |
| TOR-01-UBs4L4y | `docs/requirements/01-app-shell.feature.md` | PASS | src/app.test.ts:32 |
| TOR-06-7l9Trjh | `docs/requirements/06-persistence.feature.md` | PASS | src/lib/storage.test.ts:14 |

## Verification Summary

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 5/5 PASS (lint, build, tests, browser check, console check)
- Tests: 11 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-01-9FydwtZ — footer renders `Summit v0.1.0` in the real browser, matching `package.json#version` (src/app.test.ts:50, src/app.ts:45)
- ✅ TOR-01-WqWceSw — independently confirmed via playwright-cli console history: the first console record is `[INFO] Summit v0.1.0 starting` at the info level — stronger than the vitest-harness-only check available to the implementer (src/main.test.ts:9, src/main.ts:8)
- ✅ TOR-01-QdBg1u6 — `package.json#version` is the only version literal in the repo; single flow through the Vite define (vite.config.ts:12 → src/lib/version.ts → footer + stamp)
- ✅ TOR-01-UBs4L4y — live browser: full shell renders and the Add habit input accepted typing immediately with no setup step (src/app.test.ts:32, src/app.ts:51)
- ✅ TOR-06-7l9Trjh — live browser: absent storage key → "No habits yet", no error banner or `[role=alert]` (src/lib/storage.test.ts:14, src/lib/storage.ts:28)

### Conclusion
Every TOR's Given/When/Then is exercised by a test that faithfully mirrors the Gherkin, all 11
tests pass, all quality gates pass, and the reviewer independently confirmed the UI behaviors
in a live browser against the running dev server. Verification is sufficient.

### Manual verification performed: No

## Known Issues / Follow-ups

- Non-blocking: browsers auto-request `/favicon.ico` and Vite returns a 404 (one console
  error per page load). No TOR requires an icon; candidate for `/peak-workflow:quick-fix`.
- `docs/architecture.md` as-built section is still a stub — refreshed by wrapup Step 4.
- Unreadable-data recovery (corrupt JSON, unknown schemaVersion → "Start fresh" banner) is
  Epic C1R8qkJ's scope, intentionally not implemented here.
