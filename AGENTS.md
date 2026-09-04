# AGENTS.md — Summit

> **ZCode adaptation:** This repo uses `AGENTS.md` wherever peak-workflow skills say
> `CLAUDE.md`. ZCode loads this file automatically every session, so the conventions and
> quality gates below apply to all future epic work in this repo.

**Summit** is a single-page habit tracker: add a habit, mark it done for today, see a streak
count per habit, and filter by active/archived. It is the **public reference example for the
`peak-workflow` plugin** — favor clarity and a clean end-to-end lifecycle walkthrough over
feature breadth.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript (strict) | All application code |
| Build tool / dev server | Vite | Dev server, bundling, production build |
| App type | Client-only SPA | Runs entirely in the browser — no backend |
| Persistence | `localStorage` | Habits and completion history |
| Package manager | npm | Dependencies and scripts |

No UI framework — hand-rolled DOM/TypeScript unless `/peak-workflow:discover` decides
otherwise. Keep dependencies minimal; every added dependency is a reference-example liability.

## Local Environment

Web app project — **frontend only, no backend.**

- Install: `npm install`
- Dev server: `npm run dev` → http://localhost:5173
- Production build: `npm run build`
- Backend: **N/A** — client-only SPA. There is no API and no server-side state.
- Live data vs mocking: **N/A** — all state is local (`localStorage`); there is nothing to mock.

## Tool Hygiene & Operability

This section declares the project's conventions for the load-bearing tool-hygiene practices.
Each line is a baseline TOR requirement source — `/peak-workflow:capture-requirements` will
ensure at least one TOR exists per active line, written in the form appropriate to the
declared mechanism. Lines marked `N/A` are skipped.

**Project type:** Web app (client-only SPA — no server component).

**Version exposure:** The app version is visible in the UI footer, rendered from a version
constant sourced from `package.json#version` (wired through Vite). There is no `/version`
endpoint — there is no server.

**Version stamped at log startup:** On app bootstrap, the browser console receives a first
log line naming the app and semantic version (e.g., `Summit v0.1.0 starting`). This is the
browser-side analog of process-startup stamping.

**Version single source of truth:** `package.json#version` — defined in exactly one place,
read everywhere else.

**Logging convention:**
- Levels: DEBUG / INFO / WARN / ERROR (via `console.debug` / `console.info` / `console.warn` / `console.error`)
- Format: human-readable plain text, `[LEVEL] message`
- Configured at: a small logger module under `src/lib/` (introduced by the first epic that needs logging)

**Exit code convention:** N/A — not a CLI.

**stdout / stderr discipline:** N/A — no server process; browser console only.

**Error message standard:** User-facing errors name the problem AND the next user action,
and are rendered in the UI — never console-only. Example: `Couldn't save your habit:
localStorage is full. Remove archived habits to free space.`

## Security Baseline

These are coding-standard reminders that apply to every epic. They are NOT requirements —
TORs verify positive observable behavior, and "do not X" invariants are hard to express as
Given/When/Then. They MUST be respected during implementation and reviewed during
`/peak-workflow:wrapup-epic`.

**No `shell=True` / `eval` with user input.**
Never pass user-supplied data to a shell interpreter without escaping. In Python, prefer
`subprocess.run([...])` with a list; never `subprocess.run(cmd, shell=True)` on user input.
In Node.js, prefer `child_process.execFile` over `exec`. In any language, never use `eval`
or `Function()` constructors on user input.

**Do not log secrets or PII.**
Tokens, passwords, API keys, session IDs, and personally identifiable information must
never appear in logs. The structured logger should redact known-sensitive keys
(`password`, `token`, `secret`, `api_key`, `authorization`, `cookie`, etc.). Review log
output during `/peak-workflow:wrapup-epic` for accidental leakage.

**No secrets committed to the repo.**
`.env`, credential files, private keys, and any configuration containing real secrets must
be in `.gitignore`. Use environment variables, secret managers, or encrypted files (e.g.,
`sops`, `age`) for sensitive configuration.

`/peak-workflow:wrapup-epic` includes these as default review items unless the project type
makes them inapplicable.

## Peak Workflow

This project runs on the peak-workflow plugin. Commands:

| Command | Purpose |
|---------|---------|
| `/peak-workflow:discover` | Establish/update the product vision + ConOps |
| `/peak-workflow:capture-requirements` | Derive the TOR requirements baseline |
| `/peak-workflow:plan-project` | Derive phases/epics from the TOR IDs |
| `/peak-workflow:add` | Add new epic(s) to the plan |
| `/peak-workflow:triage` | Route an incoming request (HEAVY / EPIC / TRIVIAL) |
| `/peak-workflow:start-epic <id>` | Implement an epic |
| `/peak-workflow:wrapup-epic <id>` | Independent verification of a completed epic |
| `/peak-workflow:pause` | Save a mid-epic handoff |
| `/peak-workflow:quick-fix` | Trivial fixes (~2 hours or less) |
| `/peak-workflow:refresh-docs` | Sync architecture/design docs with the as-built code |
| `/peak-workflow:status` | Project status dashboard |
| `/peak-workflow:setup` | Audit this file + documentation stubs |

- Requirements baseline: `docs/requirements/` (Gherkin `.feature.md` TOR files)
- Implementation plan: `docs/implementation-plan/` (dashboard via `/peak-workflow:status`)

## Design & Planning Documents

- [Product Vision](docs/product-vision-planning/product-vision.md)
- [Concept of Operations](docs/product-vision-planning/concept-of-operations.md)
- [Requirements Baseline](docs/requirements/) — TOR feature files and tracing sidecars
- [Implementation Plan](docs/implementation-plan/) — phases, epic specs, and status sidecars

## Verification & Quality Gates

Run all of these before marking an epic complete. *(Exact scripts to be confirmed once the
Vite scaffold exists — update this section before the first `/peak-workflow:start-epic`.)*

- **Build:** `npm run build` — must succeed with no type errors
- **Lint/format:** `npm run lint` — must pass with no errors
- **Visual/functional check:** load the app in a browser (manual or browser automation) and
  exercise the feature the epic changed
- **TOR verification:** every TOR's Given/When/Then in the epic spec demonstrated against
  the running app

## CRITICAL: Verification Before Commit Rule

**NEVER commit code changes before verification!**

A successful build (compile) does NOT equal working code. The workflow MUST be:

1. **Implement** — Make the code changes
2. **Lint** — Run `npm run lint` to verify formatting and static analysis
3. **Build** — Run `npm run build` to type-check and bundle
4. **Verify** — Load the app in a browser and confirm the changed behavior works
5. **Commit** — ONLY after verification passed

**Why this matters:**
- Compiled code ≠ correct behavior
- UI changes need visual verification
- Business logic (streak calculation, filtering) needs functional testing
- Committing untested code pollutes git history with potential bugs

## Key Architecture Decisions

1. **Client-only SPA.** No backend, no server, no network calls — all logic runs in the browser.
2. **`localStorage` is the only persistence.** Habits and completion history live under a
   namespaced key with a schema version so future migrations are possible.
3. **Vite + TypeScript + npm, no UI framework.** Hand-rolled DOM keeps the reference example
   readable end to end.
4. **Version from `package.json`.** Single source of truth, surfaced in the app footer and
   the startup console line.
5. **Reference-example quality bar.** Favor clarity and a clean peak-workflow lifecycle
   walkthrough over feature breadth.

## Important Reminders

- `AGENTS.md` (this file) is loaded automatically every session by zcode — keep it accurate.
- This repo is the **public reference example** for peak-workflow — clarity over feature
  breadth. Do not add dependencies without an explicit recorded decision.
- **No backend.** Any change that would require a server, API, or database is out of scope —
  raise it in `/peak-workflow:triage` or `/peak-workflow:discover` instead of implementing it.
- Feature files in `docs/requirements/` are **append-only**; TOR IDs are **immutable** once
  merged.
- `NEXT-STEPS.md` at the repo root is a session handoff, not a project document — delete it
  once its steps are all worked through.

## Reference Materials

- peak-workflow plugin skills: `~/.zcode/cli/plugins/cache/peakflames-plugins/peak-workflow/1.5.1/skills/`
- Vite documentation: https://vite.dev/
- TypeScript handbook: https://www.typescriptlang.org/docs/
- MDN — Window.localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Keep a Changelog: https://keepachangelog.com/
- Semantic Versioning: https://semver.org/

## Git Workflow

- **Long-lived branch:** `main` only — this reference project intentionally has no `develop`;
  all work merges to `main`.
- **Docs branches:** `docs/{task-short-name}` — product vision, requirements baseline, and
  implementation plan work (created by `/peak-workflow:discover`); merged to `main` with
  `--no-ff` as the approval signature for the baseline.
- **Epic branches:** `feature/epic-<id>-<short-name>` where `<id>` is either a legacy integer
  (e.g., `7` or `6.5`) or a 7-character alphanumeric ID (e.g., `a3f2K7p`), and `<short-name>`
  is derived from the epic spec filename (`epic-a3f2K7p-user-auth.md` →
  `feature/epic-a3f2K7p-user-auth`).
- **Quick-fix branches:** `hotfix/issue-<N>-<slug>` when tied to a GitHub issue, or
  `hotfix/<slug>` otherwise.
- **Merges:** always `--no-ff` to preserve history.
- **Pushes:** ask the user before pushing to origin.
- **Never commit:** `.env` / `.env.*`, `node_modules/`, `dist/`, OS files (`.DS_Store`),
  editor/IDE directories, or any file containing real secrets.

## Release Protocol

Single-branch adaptation — releases happen on `main` (there is no `develop` to merge from).

**Prerequisites:** On `main` with a clean working tree; all epic branches merged with `--no-ff`.

1. **Finalize CHANGELOG** — Change `## [X.Y.Z] — UNDER DEVELOPMENT` → `## [X.Y.Z] — DD-MMM-YYYY`
   in `CHANGELOG.md`. Commit: `chore: release vX.Y.Z`
2. **Tag the release** (on `main`):
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z — Brief description"
   ```
3. **Post-release version bump** (on `main`):
   - Bump `package.json#version` to the next version
   - Add a fresh `## [Unreleased]` section to `CHANGELOG.md`
   - Commit: `chore: bump version for next development cycle`
4. **Push** (ASK USER FIRST):
   ```bash
   git push origin main && git push origin vX.Y.Z
   ```

**Note:** No CI pipeline exists yet — when one is added, configure it to run the quality
gates on every PR and to respond to `vX.Y.Z` tags.
