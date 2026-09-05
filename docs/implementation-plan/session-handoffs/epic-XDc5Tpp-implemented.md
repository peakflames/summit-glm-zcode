# Epic XDc5Tpp: Filtering, Views & Offline Verification — Implemented

**Implemented:** 2026-09-04
**Branch:** `feature/epic-XDc5Tpp-filtering-views-offline-verification`

## What Was Built

The UI surface is complete: a three-segment All / Active / Archived filter control
(radiogroup of buttons, Active selected by default) replaces the epic-AQNWtiB scaffolding
`<select>`; each view lists exactly its rows with archived rows carrying a visible
"Archived" tag and a Restore action in the All view; and each filter renders its own
friendly empty state per the TOR-05-0maiBlC message table. The MVP closes with the
end-to-end offline verification: every capability (add, check-in, archive, restore,
filter) was exercised live against the dev server with zero outgoing network requests,
and state survived reload.

## Key Files

| File | Purpose |
|------|---------|
| `src/ui/filter-bar.ts` | **New.** Three-segment radiogroup (All / Active / Archived); selected segment derived per render via `aria-checked` + `.is-selected` |
| `src/ui/habit-list.ts` | **New.** `visibleHabits` per-filter row filtering (moved from `app.ts`) and the TOR-05-0maiBlC empty-state message table |
| `src/ui/habit-row.ts` | "Archived" tag rendered on archived rows (All-view distinction); Archive/Restore swap unchanged |
| `src/app.ts` | Select-based scaffold removed; `filter` state defaults to `'active'`; render goes through `renderFilterBar` + `renderHabitList` |
| `src/ui/filter-bar.test.ts` | **New.** Segment labels/roles, Active-by-default selection, onChange wiring |
| `src/ui/habit-list.test.ts` | **New.** View filtering, empty-state message table, row/action/tag assertions per view |
| `src/app.test.ts` | Regression: `#habit-filter` select helper replaced with segment clicks; new app-level blocks for filter/views and per-filter empty states |
| `src/styles.css` | `.filter-bar` / `.filter-segment` segmented styles; `.archived-tag` pill; `.filter` rule removed |

## Spec Deviations

| TOR ID | As-Written | As-Implemented | Reason |
|--------|------------|----------------|--------|
| TOR-01-0d73l6K | "the network goes offline and the user performs … actions" | Offline simulated in-page: all app-initiated network APIs are absent from the code (static check), and the append-only `performance` resource timeline stayed flat (15 → 15 entries) across the entire action session; the post-action reload was served by the local Vite dev server | A dev-server page cannot refetch its own shell with the network cut; the requirement's substance — zero requests for the actions, full offline functionality, persisted state after reload — was demonstrated |

## TOR Coverage

| TOR ID | Verdict | Test Reference | Impl Reference |
|--------|---------|----------------|----------------|
| TOR-05-GjGNESQ | PASS | src/ui/filter-bar.test.ts:34, src/app.test.ts:46 | src/ui/filter-bar.ts:26 |
| TOR-05-PrNhHoE | PASS | src/ui/filter-bar.test.ts:50, src/app.test.ts:774 | src/app.ts:45 |
| TOR-05-sAMxFFs | PASS | src/ui/habit-list.test.ts:96, src/app.test.ts:785 | src/ui/habit-list.ts:11, src/ui/habit-row.ts:47 |
| TOR-05-qD4GGzl | PASS | src/ui/habit-list.test.ts:127, src/app.test.ts:802 | src/ui/habit-row.ts:40 |
| TOR-05-0maiBlC | PASS | src/ui/habit-list.test.ts:60, src/app.test.ts:839–877 | src/ui/habit-list.ts:25 |
| TOR-01-0d73l6K | PASS | live browser pass (below); no network APIs in `src/` | src/lib/storage.ts (localStorage only) |

## Verification Results

### Counts
- TOR Requirements: 6/6 PASS, 0 CANNOT VERIFY
- Quality Gates: 4/4 PASS (lint clean; tsc + vite build clean; 99/99 tests; live browser pass with clean console)

### Live Browser Verification (TOR-01-0d73l6K and the TOR-05 views)
- Boot: three segments rendered, **Active selected by default**, empty state
  "No habits yet. Add your first habit above." (dev server, fresh storage)
- Offline session (network-API simulation + resource-timeline measurement):
  add "Run" and "Read" → check in Run (badge 0→1, stored `["2026-09-04"]` local-date
  key while UTC was already 2026-09-05) → archive Read → filter to Archived
  (exactly Read with Restore + badge) → filter to All (both rows; Read tagged
  "Archived" with Restore) → restore Read from All → archive both ("No active
  habits.") → restore both. **Zero outgoing network requests: 15 resource entries
  before, 15 after.**
- Reload: state persisted (Run checked, badge 1), Active default re-selected
- Empty states visually confirmed by screenshot: "No active habits." and
  "No archived habits."; All-view archived tag confirmed by screenshot
- Console: no errors or warnings during the interaction session

### Tooling note
The in-app browser's synthetic input delivery (Playwright locator clicks, DOM-CUA and
coordinate clicks) did not reach the page in this environment, so interactions were
driven by page-side DOM `.click()`/`.value` calls through `evaluate` — real DOM events
through the app's own listeners, indistinguishable at the application layer.

### Manual verification performed: Yes
(Live browser pass against `npm run dev`, described above.)

## Known Issues / Follow-ups

- Pre-existing favicon 404 on first page load (noted in AQNWtiB/m1i25n4 handoffs) —
  cosmetic; a first-load item, out of scope for the offline TOR ("after first load").
- `docs/architecture.md` / `docs/design-notes.md` Frontend Architecture sections to be
  refreshed with the as-built filter/list modules via `/peak-workflow:refresh-docs` at
  wrapup.
