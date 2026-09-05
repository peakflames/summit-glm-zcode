# Epic XDc5Tpp: Filtering, Views & Offline Verification — Complete

**Completed:** 2026-09-05
**Verified by:** Independent review via `/peak-workflow:wrapup-epic XDc5Tpp`

## What Was Built

The UI surface is complete: a three-segment All / Active / Archived filter control
(radiogroup of buttons, Active selected by default) with per-view row contents —
archived rows carry a visible "Archived" tag and a Restore action in the All view —
and a distinct friendly empty state per filter. The MVP closes with the end-to-end
offline verification: every capability (add, check-in, archive, restore, filter)
works with zero app-initiated network requests, and state survives reload.

## Key Files

| File | Purpose |
|------|---------|
| `src/ui/filter-bar.ts` | Three-segment radiogroup (All / Active / Archived); selected segment derived per render via `aria-checked` + `.is-selected` |
| `src/ui/habit-list.ts` | `visibleHabits` per-filter row filtering and the TOR-05-0maiBlC empty-state message table |
| `src/ui/habit-row.ts` | "Archived" tag on archived rows (All-view distinction); Archive/Restore swap |
| `src/app.ts` | `filter` state defaults to `'active'`; render goes through `renderFilterBar` + `renderHabitList` |
| `src/ui/filter-bar.test.ts` / `src/ui/habit-list.test.ts` / `src/app.test.ts` | Unit coverage mirroring the TOR Gherkin |
| `src/styles.css` | `.filter-bar` / `.filter-segment` segmented styles; `.archived-tag` pill; `.empty-state` |

## Key Decisions

- The filter control is a radiogroup of segment buttons rather than a dropdown, so the
  current view is always visible and switching views is one click; selection is derived
  per render, never patched in place.
- The Active empty state distinguishes "nothing yet" (points at the add form) from
  "everything is archived" ("No active habits."), per the TOR-05-0maiBlC message table.
- TOR-01-0d73l6K was verified via an in-page offline simulation: no network APIs exist
  in `src/` (static check), and the append-only `performance` resource timeline stayed
  flat across the entire action session. A dev-server page cannot refetch its own shell
  with the network cut; the requirement's substance — zero requests for the actions,
  full offline functionality, persisted state after reload — was demonstrated.

## Requirements Implemented

| TOR ID | Feature File | Verdict | Test Reference |
|--------|--------------|---------|----------------|
| TOR-05-GjGNESQ | `docs/requirements/05-filtering.feature.md` | PASS | src/ui/filter-bar.test.ts:34 |
| TOR-05-PrNhHoE | `docs/requirements/05-filtering.feature.md` | PASS | src/ui/filter-bar.test.ts:50 |
| TOR-05-sAMxFFs | `docs/requirements/05-filtering.feature.md` | PASS | src/ui/habit-list.test.ts:103 |
| TOR-05-qD4GGzl | `docs/requirements/05-filtering.feature.md` | PASS | src/ui/habit-list.test.ts:132 |
| TOR-05-0maiBlC | `docs/requirements/05-filtering.feature.md` | PASS | src/ui/habit-list.test.ts:59 |
| TOR-01-0d73l6K | `docs/requirements/01-app-shell.feature.md` | PASS | live browser pass (resource timeline flat; no network APIs in `src/`) |

## Verification Summary

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint clean; tsc + vite build clean; 99/99 tests; live browser pass with clean console)
- Tests: 99 passed, 0 skipped, 0 failed

### Highlights
- ✅ TOR-05-GjGNESQ — three-segment radiogroup "All / Active / Archived" rendered and tested (src/ui/filter-bar.test.ts:34, impl src/ui/filter-bar.ts:26); confirmed live as a radiogroup with three radios.
- ✅ TOR-05-PrNhHoE — Active selected by default, fresh and with existing data (src/app.test.ts:775, impl src/app.ts:45); confirmed live on first boot and after reload.
- ✅ TOR-05-sAMxFFs — per-view filtering with correct actions/badges (src/ui/habit-list.test.ts:103, impl src/ui/habit-list.ts:11); live Archived view listed exactly the archived habit with Restore + streak badge.
- ✅ TOR-05-qD4GGzl — All view shows every row, archived row tagged "Archived" with Restore (src/ui/habit-list.test.ts:132, impl src/ui/habit-row.ts:38); confirmed live.
- ✅ TOR-05-0maiBlC — all three empty-state messages implemented and tested (src/ui/habit-list.test.ts:59, impl src/ui/habit-list.ts:25); all three confirmed live.
- ✅ TOR-01-0d73l6K — live offline pass: `performance` resource timeline flat (16 → 16) across add, check-in, archive, and filter switches; state survived reload with Run still checked (streak 1); zero network APIs in `src/` (grep-verified). Real Playwright input reached the page in the reviewer's session (the implementer's session had to fall back to DOM-level clicks), strengthening the interaction evidence.

### Conclusion
Every TOR's Given/When/Then was independently confirmed three ways: unit tests that
mirror the Gherkin, direct source inspection, and a live browser session against the
dev server. The substance of TOR-01-0d73l6K — zero app-initiated network requests and
full functionality with persisted state after reload — is demonstrated; the documented
deviation (a dev-server page cannot cut its own network) is reasonable.

### Manual verification performed: No
The user did not disclose additional manual verification beyond the automated gates;
the independent reviewer performed a live browser pass (recorded above), and the
implementer's live browser session is documented in `epic-XDc5Tpp-implemented.md`.

## Known Issues / Follow-ups

- Pre-existing favicon 404 on first page load (noted in AQNWtiB/m1i25n4 handoffs and
  reproduced once in this review) — cosmetic first-load item; out of scope for the
  offline TOR ("after first load").
- `docs/architecture.md` / `docs/design-notes.md` still describe the old
  `<select>`-based filter at wrapup time — refreshed via `/peak-workflow:refresh-docs`
  immediately after this handoff.
