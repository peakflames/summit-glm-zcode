# Epic NZK8kqE: PeakFlames Design System — Implemented

**Implemented:** 2026-09-04
**Branch:** `feature/epic-NZK8kqE-peakflames-design-system`

## What Was Built

Summit now renders visibly as a PeakFlames product: the 11 PeakFlames Design System
token CSS files are vendored byte-identical into `src/styles/peakflames/` (source: the
sibling `summit` repo's verified copy of design project
`11ea476f-926c-40ea-8d34-91522c12d907`), `src/styles.css` imports that layer first and
keeps only retokenized Summit layout, and `.pf-*` classes are added alongside every
existing class name — no DOM element, attribute, or copy changes. The change is
strictly additive and visual: all 99 pre-existing tests pass unmodified (102 total with
3 new design-system contract tests), which was the epic's primary regression signal.

## Key Files

| File | Purpose |
|------|---------|
| `src/styles/peakflames/styles.css` + `src/styles/peakflames/tokens/{fonts,colors,typography,spacing,radius,elevation,motion,semantic,base,components}.css` | 11 vendored token CSS files, byte-identical (`diff -r` verified) |
| `src/styles.css` | `@import url('./styles/peakflames/styles.css')` first; `:root` light palette removed; all Summit classes retokenized (`.shell`, `.add-habit`, `.error-banner` + variants, `.filter-bar`/`.filter-segment`, `.habit-row`, `.streak-badge` amber prominence, `.habit-done` checkbox, `.archived-tag`, `.empty-state`, `.form-error`, `.shell-footer`) |
| `index.html` | `preconnect` links for fonts.googleapis.com / fonts.gstatic.com; `pf-input` on `#habit-name`; `pf-btn pf-btn--primary pf-btn--md` on `#add-habit` (the one hot element) |
| `src/ui/filter-bar.ts` | `pf-tabs` on the bar, `pf-tab` on segments, `pf-tab--active` toggled together with `is-selected` |
| `src/ui/habit-row.ts` | `pf-card` on rows, `pf-btn pf-btn--secondary` on the archive/restore action |
| `src/ui/habit-list.ts` | `pf-hint` on the empty-state paragraph |
| `src/ui/habit-form.ts` | `pf-error` on the lazy validation error (mechanism unchanged) |
| `src/ui/error-banner.ts` | `pf-alert pf-alert--danger` on banners, `pf-btn pf-btn--secondary pf-btn--sm` on the banner action (all original class names kept) |
| `src/ui/design-system.test.ts` | New: 3 unit tests pinning the class-level contract (ember-gradient toggle, pf-card/secondary row, single primary control) |
| `docs/architecture.md`, `docs/design-notes.md`, `CHANGELOG.md`, `AGENTS.md` | Styling architecture section, decision note 28, changelog bullets, tech-stack row + reference pointer |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|------------|----------------|--------|
| — (Key Components) | `src/styles.css` line 1: `@import './peakflames/styles.css';` | `@import url('./styles/peakflames/styles.css');` | The cited path resolves to `src/peakflames/` from `src/styles.css`, but the vendored location is `src/styles/peakflames/`; Vite 8/rolldown (unlike the sibling's Vite 5) also required the `url(...)` form. File locations follow the spec's Key Components exactly. |
| — (Key Components) | `.streak-badge` gets `pf-label` | `.streak-badge` keeps only its own class with the amber treatment (display face, `--text-h3`, bold, `--text-accent`) | `pf-label` is mono/micro/muted and would defeat TOR-07-pa7ak24 prominence; the spec's own styles.css bullet ("amber treatment, keeping TOR-07-pa7ak24 prominence") is authoritative. |
| — (Key Components) | `pf-btn pf-btn--secondary` on "the done and archive/restore buttons" | The done control is a checkbox in this repo; it keeps `.habit-done` semantics (no DOM change) and gets a pf-check-style CSS treatment, checked state in success green (`--status-success`) | A checkbox cannot take `pf-btn` classes without a DOM/semantics change, which the epic forbids; the spec's "done must NOT carry the flame accent" note is honored via the non-flame success treatment (mirrors the sibling's done-state green). |

No TOR-level deviations: every TOR was implemented exactly as its Given/When/Then
specifies.

## TOR Coverage

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-07-xFBFuj6 | `docs/requirements/07-visual-design.feature.md` | PASS | Live browser pass: body `rgb(6,17,27)` (obsidian-1000); h1 Archivo, body IBM Plex Sans; `document.fonts` reports all three families loaded. Impl: `src/styles/peakflames/tokens/{fonts,base}.css`, `src/styles.css` |
| TOR-07-EXjNoVz | `docs/requirements/07-visual-design.feature.md` | PASS | `src/ui/design-system.test.ts:88` (single `pf-btn--primary` in markup + none in dynamic sources); live pass: exactly 1 `.pf-btn--primary` ("Add"), checkbox checked state success-green. Impl: `index.html:24`, `src/styles.css:169` |
| TOR-07-c3lKxoV | `docs/requirements/07-visual-design.feature.md` | PASS | Live keyboard pass: Tab through input, filter segments, checkbox, action button — each shows the `--ring-focus` ring (obsidian+flame) or the `pf-input` accent ring, persistent while focused. Impl: `src/styles/peakflames/tokens/base.css` (`:focus-visible`), `pf-btn`/`pf-tab`/`pf-check` focus rules |
| TOR-07-o4sphQD | `docs/requirements/07-visual-design.feature.md` | PASS | `src/ui/design-system.test.ts:52` (pf-tab--active moves with selection, never on two segments); live pass: ember gradient `::after` present on selected segment only, moves Active → Archived → Active. Impl: `src/ui/filter-bar.ts:44`, `tokens/components.css` (`.pf-tab--active::after`) |
| TOR-07-ywpamQm | `docs/requirements/07-visual-design.feature.md` | PASS | Live pass with fonts.googleapis.com/gstatic.com blocked (route 404): zero brand FontFace records, canvas measurement proves `Archivo` renders at system-ui metrics; add/check-in/filter/archive/restore/persistence all exercised and working |
| TOR-07-pa7ak24 | `docs/requirements/07-visual-design.feature.md` | PASS | Live pass: `.streak-badge` 22px/700 Archivo amber vs `.habit-name` 16px/500 on the same row. Impl: `src/styles.css:131` (`.streak-badge`), `src/styles.css:141` (`.habit-name`) |

## Verification Results

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 102 passed (99 pre-existing unmodified + 3 new), 0 skipped, 0 failed

### Quality Gates
- ✅ `npm run lint` (eslint) — clean
- ✅ `npm run build` (tsc --noEmit + vite build) — clean, 22.1 kB CSS bundle
- ✅ `npm test` (vitest) — 102/102; `git diff` confirms zero modifications to existing test files
- ✅ Browser verification — all six TORs demonstrated live (details in TOR Coverage);
  console clean after load (0 errors, 0 warnings, startup stamp only); screenshots at
  375px and 1280px confirm the obsidian canvas, one flame Add button, ember gradient,
  card rows, and amber streak prominence

### Manual verification performed: No
All verification was automated (unit tests) or tool-driven (Playwright browser pass);
the user has not yet reviewed the visuals in their own session.

## Known Issues / Follow-ups

- Pre-existing favicon 404 on first page load (carried from earlier epics; cosmetic,
  not console-visible in this session's pass) — candidate for `/peak-workflow:quick-fix`.
- The vendored `tokens/fonts.css` fetches the brand webfonts from Google Fonts on first
  load (per ConOps §6 and the epic spec); TOR-07-ywpamQm pins the fallback path. If
  licensed font files ever become available, swap the `@import` for local `@font-face`
  rules per the file's own substitution note.
