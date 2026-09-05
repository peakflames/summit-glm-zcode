# Epic NZK8kqE: PeakFlames Design System — Complete

**Completed:** 2026-09-04
**Verified by:** Independent review via `/peak-workflow:wrapup-epic NZK8kqE`

## What Was Built

Summit now renders visibly as a PeakFlames product: the 11 PeakFlames Design System token
CSS files are vendored byte-identical into `src/styles/peakflames/`, `src/styles.css`
imports that layer first and keeps only retokenized Summit layout, and `.pf-*` classes
are added alongside every existing class name — no DOM element, attribute, or copy
changes. The change is strictly additive and visual: the 99 pre-existing tests pass
unmodified (102 total with 3 new design-system contract tests), which was the epic's
primary regression signal. Independent live verification confirmed all six visual TORs
against the running app.

## Key Files

| File | Purpose |
|------|---------|
| `src/styles/peakflames/styles.css` + `src/styles/peakflames/tokens/{fonts,colors,typography,spacing,radius,elevation,motion,semantic,base,components}.css` | 11 vendored token CSS files, byte-identical (`diff -r` verified against the sibling `summit` repo's copy of design project `11ea476f-926c-40ea-8d34-91522c12d907`) |
| `src/styles.css` | `@import url('./styles/peakflames/styles.css')` first; `:root` light palette removed; all Summit classes retokenized |
| `index.html` | `preconnect` links for Google Fonts; `pf-input` on `#habit-name`; `pf-btn pf-btn--primary pf-btn--md` on `#add-habit` (the one hot element) |
| `src/ui/filter-bar.ts` | `pf-tabs` on the bar, `pf-tab` on segments, `pf-tab--active` toggled together with `is-selected` |
| `src/ui/habit-row.ts` | `pf-card` on rows, `pf-btn pf-btn--secondary` on the archive/restore action |
| `src/ui/habit-list.ts` | `pf-hint` on the empty-state paragraph |
| `src/ui/habit-form.ts` | `pf-error` on the lazy validation error (mechanism unchanged) |
| `src/ui/error-banner.ts` | `pf-alert pf-alert--danger` on banners, `pf-btn pf-btn--secondary pf-btn--sm` on the banner action (all original class names kept) |
| `src/ui/design-system.test.ts` | 3 unit tests pinning the class-level contract (ember-gradient toggle, pf-card/secondary row, single primary control) |
| `docs/architecture.md`, `docs/design-notes.md`, `CHANGELOG.md`, `AGENTS.md` | Styling architecture section, decision note 28, changelog bullets, tech-stack row + reference pointer |

## Key Decisions

- **Strictly additive classes.** Every pre-existing class name stays on its element;
  `.pf-*` classes are added alongside. The test suite and all 37 pre-existing TORs
  depend on the original class names.
- **One hot element per view (TOR-07-EXjNoVz).** The `pf-btn--primary` flame treatment
  lives only on the static Add button; dynamic sources are pinned by a unit test that
  greps all UI source files; the done-checkbox checked state uses success green, not
  flame.
- **Ember gradient owned by `pf-tab--active` (TOR-07-o4sphQD).** `is-selected` keeps a
  neutral emphasis treatment so exactly one ember treatment exists; `pf-tab--active`
  is always toggled together with `is-selected`, never replacing it.
- **Streak prominence keeps its own class (TOR-07-pa7ak24).** `.streak-badge` gets the
  amber treatment directly (display face, `--text-h3`, bold, `--text-accent`) instead
  of `pf-label`, which is mono/micro/muted and would defeat the prominence requirement.
- **Webfonts via Google Fonts `@import`** with system-font fallback stacks in the
  `--font-*` variables (TOR-07-ywpamQm pins the degradation path); swap for local
  `@font-face` if licensed font files ever become available.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-07-xFBFuj6 | 07-visual-design.feature.md | PASS | Live browser pass + `src/ui/design-system.test.ts` |
| TOR-07-EXjNoVz | 07-visual-design.feature.md | PASS | src/ui/design-system.test.ts:101 + live pass |
| TOR-07-c3lKxoV | 07-visual-design.feature.md | PASS | Live keyboard pass + tokens/base.css `:focus-visible` |
| TOR-07-o4sphQD | 07-visual-design.feature.md | PASS | src/ui/design-system.test.ts:55 + live pass |
| TOR-07-ywpamQm | 07-visual-design.feature.md | PASS | Live pass with font CDN blocked |
| TOR-07-pa7ak24 | 07-visual-design.feature.md | PASS | Live computed-style pass, src/styles.css:137 |

## Verification Summary

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS
- Tests: 102 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-07-xFBFuj6 — live: body `rgb(6,17,27)` = `--obsidian-1000`; h1 Archivo, body IBM Plex Sans; `document.fonts` reports all three brand families loaded
- ✅ TOR-07-EXjNoVz — live: exactly 1 `.pf-btn--primary` ("Add"); unit test pins the single-primary contract across index.html and all five dynamic UI sources
- ✅ TOR-07-o4sphQD — live: ember gradient `::after` present only on the selected segment and moves Active → Archived → Active; unit test pins the class toggle
- ✅ TOR-07-c3lKxoV — live keyboard pass: input, filter segments, checkbox, action button all match `:focus-visible` with a visible ring while focused
- ✅ TOR-07-ywpamQm — live with Google Fonts blocked: zero brand FontFace records (system fallback render), and add / check-in / filter / archive / persistence all functional
- ✅ TOR-07-pa7ak24 — live: streak badge 22px/700 Archivo amber vs habit name 16px/500 on the same row

### Conclusion
Every TOR's Given/When/Then was independently demonstrated against the live app (dev
server + Playwright), the static implementation matches the vendored token layer, and
the vendored CSS is byte-identical to the sibling reference repo (`diff -r` clean).
The class-level contract tests pin the dynamic-render TORs the DOM test environment
cannot style. All 37 pre-existing TORs remain covered by the unmodified passing suite.

### Manual verification performed: Yes
The user performed a visual review of the PeakFlames restyle in their own browser
(obsidian canvas, flame Add button, ember gradient, streak prominence).

## Known Issues / Follow-ups

- Pre-existing favicon 404 on first page load (carried from earlier epics; cosmetic) —
  candidate for `/peak-workflow:quick-fix`.
- The vendored `tokens/fonts.css` fetches the brand webfonts from Google Fonts on first
  load (per ConOps §6; TOR-07-ywpamQm pins the fallback path). If licensed font files
  ever become available, swap the `@import` for local `@font-face` rules per the file's
  own substitution note.
