# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- Row UI parity (Epic lfstJmm): the daily check-in is a "Done today" / "Done ✓"
  toggle button, every streak badge carries a "DAY STREAK" caption beneath the
  number, and the Active view shows a help hint teaching the streak rule.

### Changed

- Habit rows match the reference implementation: semantic `<ul>`/`<li>` list
  structure with the name first and controls right, quiet success-green done
  treatment, `pf-btn--md` button sizing, and a 480px reflow that drops the
  habit name to its own line on narrow screens (quick-fix
  `row-ui-mobile-parity`).
- App shell widened to 45rem to match the reference column width.

### Fixed

---

## [0.3.0] — 05-Sep-2026

### Added

- Deployed Summit to GitHub Pages via a GitHub Actions workflow that lints, tests, and
  builds on every push to `main`, publishing the result automatically.
- App favicon, sourced from the PeakFlames logo at peakflames.org.

### Changed

- README: added a "Built with Peak-Workflow" section highlighting Summit as the
  peak-workflow reference example, with a ZCode/GLM usage snapshot.

### Fixed

---

## [0.2.0] — 05-Sep-2026

### Added
- PeakFlames Design System adoption (Epic NZK8kqE): 11 token CSS files vendored
  byte-identical into `src/styles/peakflames/`; `.pf-*` component classes added
  alongside every existing class name; design-system TOR baseline
  `docs/requirements/07-visual-design.feature.md`.

### Changed
- The UI now renders on the PeakFlames dark obsidian canvas with the brand type ramp
  (Archivo / IBM Plex Sans / JetBrains Mono via Google Fonts + preconnect, system-font
  fallback), a single flame-accented primary action (the Add button), ember-gradient
  filter selection, visible `:focus-visible` rings, and an amber streak badge more
  prominent than the habit name. Strictly visual: all pre-existing behavior and tests
  pass unmodified.

### Fixed

---

## [0.1.0] — 04-Sep-2026

Initial development.

### Added

- Three-segment filter control (All / Active / Archived) replacing the scaffold
  dropdown; the Active view is selected by default on every load (epic XDc5Tpp).
- Per-view habit list: the Active and Archived views list only their rows, and the
  All view shows every habit with archived rows carrying a visible "Archived" tag
  and a Restore action (epic XDc5Tpp).
- Distinct friendly empty state per filter, including "No habits yet. Add your first
  habit above." and "No active habits." (epic XDc5Tpp).
- End-to-end offline verification: the app makes zero app-initiated network requests
  for add, check-in, archive, restore, and filter actions, and state persists across
  reload via `localStorage` (epic XDc5Tpp).
