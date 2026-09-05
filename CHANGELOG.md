# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
### Changed
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
