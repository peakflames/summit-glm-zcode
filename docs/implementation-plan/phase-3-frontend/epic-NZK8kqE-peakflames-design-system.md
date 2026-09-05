# Epic NZK8kqE: PeakFlames Design System

**Phase:** 3 — Frontend
**Status:** Complete — 2026-09-04
**Dependencies:** Epic AQNWtiB (Habit Management UI), Epic m1i25n4 (Daily Check-in & Streaks), Epic XDc5Tpp (Filtering, Views & Offline Verification) — this epic restyles the components those epics built and must not regress their behavior or DOM structure

> **Brand:** Adopt the PeakFlames Design System (the shared PeakFlames brand language) — vendor its token CSS and apply its `.pf-*` component classes across the UI.

---

## Description

This epic makes Summit visibly a PeakFlames product by adopting the PeakFlames Design
System's real tokens and component classes — a dark-first obsidian canvas, the
flame/ember/amber accent ramp, and the brand type ramp (Archivo / IBM Plex Sans /
JetBrains Mono) — replacing the current hand-rolled, neutral light palette in
`src/styles.css`. It exists because `docs/product-vision-planning/product-vision.md` §9
was amended (2026-09-04, v1.1) to specify PeakFlames Design System adoption as Summit's
visual direction, and `docs/requirements/07-visual-design.feature.md` was authored to
formalize that direction as TOR requirements. This mirrors the sibling `summit` repo's
epic R5e7z3Y playbook (the reference implementation for this change).

The change is **strictly additive and visual**: the 11 token CSS files are vendored
byte-identical into `src/styles/peakflames/` (source: the sibling repo's verified copy
of design project `11ea476f-926c-40ea-8d34-91522c12d907` — no DesignSync access in this
environment), `src/styles.css` is rewritten to import that layer first and keep only
Summit-specific layout on top, and `.pf-*` classes are added alongside every existing
class name in the touched files. No DOM element, attribute, or copy changes — the
existing test suite and all 37 pre-existing TORs must pass unmodified, which is the
epic's primary regression signal per AGENTS.md's Verification Before Commit rule.

Note: unlike the reference implementation, this repo lints with eslint only (no
prettier `--check`), so no `.prettierignore` entry is needed for the vendored files.

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
| TOR-07-xFBFuj6 | `docs/requirements/07-visual-design.feature.md` | The web application shall render its interface on a dark, obsidian-toned canvas using the PeakFlames Design System's brand type ramp |
| TOR-07-EXjNoVz | `docs/requirements/07-visual-design.feature.md` | The web application shall render exactly one flame-accented "hot" element per view, reserved for the primary action |
| TOR-07-c3lKxoV | `docs/requirements/07-visual-design.feature.md` | The web application shall display a visible focus ring on any interactive control when it receives keyboard focus |
| TOR-07-o4sphQD | `docs/requirements/07-visual-design.feature.md` | The web application shall indicate the currently selected Active/Archived filter using the PeakFlames Design System's ember gradient treatment |
| TOR-07-ywpamQm | `docs/requirements/07-visual-design.feature.md` | The web application shall render with system-font fallback and remain fully functional when the PeakFlames brand webfonts cannot be fetched |
| TOR-07-pa7ak24 | `docs/requirements/07-visual-design.feature.md` | The application shall render the streak number more visually prominent than the habit name on every habit row |

**Also must keep passing unchanged** (all 37 pre-existing TORs this restyle must not
regress). Especially watch: `TOR-01-0d73l6K` (zero network requests offline after first
load — the webfont fetch happens on first load only; TOR-07-ywpamQm pins the fallback),
`TOR-01-yNjDWrJ` (error messages name problem + next action), `TOR-04-*` (streak badge
behavior), `TOR-05-*` (filter states and empty states), and the app-shell structure TORs.

## Key Components

### Frontend

- `src/styles/peakflames/styles.css` and `src/styles/peakflames/tokens/*.css` (fonts,
  colors, typography, spacing, radius, elevation, motion, semantic, base, components) —
  11 files vendored byte-identical from the sibling repo
  (`/Users/schaveyt/github/peakflames/summit/src/styles/peakflames/`), new
- `src/styles.css` — `@import './peakflames/styles.css';` as line 1; remove the `:root`
  font-family/color/background declarations and the light-palette hex values (now owned
  by the token layer); retokenize `.shell`, `.add-habit`, `.error-banner` and variants,
  `.filter-bar`, `.filter-segment` (selection treatment comes from `pf-tab--active`),
  `.habit-row`, `.streak-badge` (amber treatment, keeping TOR-07-pa7ak24 prominence),
  `.habit-action`, `.empty-state`, `.form-error`, `.archived-tag`, and `.shell-footer`
- `src/ui/habit-form.ts` — add `pf-input` (input), `pf-btn pf-btn--primary pf-btn--md`
  (Add button — the sole flame-accented "hot" element per TOR-07-EXjNoVz),
  `pf-error` (form-error paragraph, keeping the `hidden`/empty mechanism)
- `src/ui/filter-bar.ts` — add `pf-tabs` (bar), `pf-tab` (each segment), and toggle
  `pf-tab--active` alongside the existing `is-selected` toggle (never replacing it)
- `src/ui/habit-row.ts` — add `pf-card` (row), `pf-btn pf-btn--secondary` treatment for
  the done and archive/restore buttons (done must NOT carry the flame accent — the Add
  button is the one hot element), `pf-label` (streak badge)
- `src/ui/habit-list.ts` — add `pf-hint` (empty-state paragraph)
- `src/ui/error-banner.ts` — add appropriate `.pf-*` classes (e.g. `pf-error`) to the
  banner, message, and action elements while keeping all existing class names
- `index.html` — add classes for the static input/button if not handled in
  `habit-form.ts`, plus `<link rel="preconnect">` for `fonts.googleapis.com` /
  `fonts.gstatic.com` (brand webfonts per TOR-07-xFBFuj6 / TOR-07-ywpamQm)
- `docs/architecture.md`, `docs/design-notes.md`, `CHANGELOG.md`, `AGENTS.md`
  (Reference Materials) — documentation updates per the plan (CSS architecture decision,
  tech stack styling row, changelog bullets, design-system reference pointer)

### Verification

- `npm run lint` (eslint), `npm run build` (tsc + vite), `npm test` (vitest) — all must
  pass with zero test modifications
- Browser verification: computed-style checks for each TOR (obsidian body background,
  Archivo/IBM Plex Sans via `document.fonts`, exactly one flame element, `:focus-visible`
  rings, ember gradient moving between filter segments), plus the webfont-fallback path
  (block `fonts.googleapis.com`/`fonts.gstatic.com`, confirm system-font render and full
  functionality) and 375px / 1280px screenshots
