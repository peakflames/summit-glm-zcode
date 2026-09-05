# Summit — Concept of Operations (ConOps)

**Document Version:** 1.1
**Date:** 2026-09-04
**Status:** Draft

---

## 1. Purpose & Scope

This document describes how Summit operates in practice: who uses it, the scenarios it
must support, the interfaces it exposes, the data it touches, and the constraints it
operates under. It is the operational companion to
[product-vision.md](product-vision.md) (which carries the "why" and the MVP boundaries);
together the two documents are the input to `/peak-workflow:capture-requirements`.

Scope: the Summit MVP — a client-only single-page habit tracker with add, check-in,
streak, and archive/filter capabilities. Anything requiring a server is out of scope by
definition (see §8).

## 2. Current State ("As-Is")

Summit is greenfield — there is no prior system. The "as-is" state is the set of methods
a habit-builder uses today, each with its own friction:

| Current method | Limitations |
|---|---|
| Pen-and-paper tracker | No automatic streak math; not always at hand at check-in time; no archive/history |
| Spreadsheet | Streak formulas are fiddly; unpleasant on mobile; still no offline-first polish |
| Habit apps (accounts + cloud) | Sign-up wall, network dependency, personal routine data leaves the device, feature bloat, subscriptions |
| Memory / "mental tracking" | Streaks get invented; misses get forgiven; no honest feedback loop |

**Core pain points (numbered, referenced by scenarios):**

1. Recording a check-in takes more than a few seconds on existing tools.
2. Streak visibility — the motivating number — is buried under dashboards and feeds.
3. Offline use is an afterthought; cloud trackers fail on planes, subways, cabin trips.
4. Routine data (a surprisingly intimate behavioral record) is stored server-side by default.
5. Honest reset semantics (a missed day genuinely resets the streak) are rare; gamified
   apps sell "streak freezes" instead.

## 3. Proposed System ("To-Be")

Summit is a single-page application that loads once and then never touches the network
again. The entire product is one screen: an "Add habit" input at the top, a filter
control (**All | Active | Archived**, defaulting to Active), a list of habit rows, and a
footer showing the app version. Each row carries the habit's name, its current-streak
badge, a "Done today" checkbox for the current local calendar day, and an Archive action
(archived rows show Restore instead).

Checking "Done today" writes today's local date into the habit's completion history and
recomputes the streak badge instantly; unchecking removes it. The current-streak rule is
normative: consecutive completion days ending today if today is completed, otherwise
ending yesterday; 0 if neither. A missed day therefore resets the streak honestly, and
an unchecked day doesn't punish the user before the day is over.

All state lives in the browser's `localStorage` under a single versioned key
(`summit.habits.v1`). Every mutation serializes in-memory state and writes it back
immediately; boot reads, validates, and hydrates from the same key, then prints
`[INFO] Summit vX.Y.Z starting` to the console. There is no account, no server, no sync —
privacy and offline capability are properties of the architecture, not settings.

Visually, Summit is a PeakFlames product. The PeakFlames Design System's token CSS is
vendored byte-identical into the repo and imported as the base stylesheet layer: a
dark-first obsidian canvas, the flame/ember/amber accent ramp, and the brand type ramp
(Archivo for display, IBM Plex Sans for body, JetBrains Mono for numeric detail). The
Summit-specific stylesheet layers only layout on top, and components add the system's
`.pf-*` classes alongside their existing class names — additive only, so DOM structure,
copy, and behavior are untouched. The system's discipline rules apply: exactly one
element per view carries the flame accent (the Add habit button, the one control
guaranteed present regardless of habit count), the selected filter segment wears the
ember gradient treatment, and every interactive control shows a visible keyboard focus
ring.

## 4. User Roles & Profiles

| Role | Description | Questions they bring to the app |
|---|---|---|
| Daily habit-builder (primary) | Anyone running a handful of personal habits; opens Summit once or twice a day, often on a phone browser | "What's left to do today?" · "How long is my streak?" · "Which habits have I quietly dropped?" |
| Peak-workflow learner (secondary) | A developer studying this repo as the plugin's public reference example | "How does a peak-workflow project go from vision to verified epics?" · "What does a clean, minimal implementation of each workflow stage look like?" |

## 5. Operational Scenarios

### Scenario 1: First habit, first streak
**Actor:** First-time visitor
**Trigger:** Opens Summit in a browser for the first time
**Goal:** Start tracking a habit and get credit for doing it today

**Steps:**
1. User opens the Summit URL (dev: `http://localhost:5173`; prod: static host).
2. App boots; the console prints `[INFO] Summit vX.Y.Z starting`; the page shows the
   "Summit" header, the "Add habit" input with an "Add" button, the filter control on
   **Active**, an empty list with "No habits yet. Add your first habit above.", and the
   footer "Summit vX.Y.Z".
3. User types `Read 20 minutes` into the "Add habit" input.
4. User clicks "Add" (or presses Enter in the input).
5. The list shows one row: name `Read 20 minutes`, streak badge `0`, unchecked
   "Done today" checkbox, "Archive" action.
6. User clicks the row's "Done today" checkbox.
7. The streak badge updates `0 → 1` immediately; the checkbox is checked; today's date
   is in the habit's completions.
8. User reloads the page.
9. The row persists exactly: same name, streak `1`, today checked.

**Outcome:** A first habit is tracked, its first streak is live, and the data survived a
reload — the user has proof the app "sticks".

### Scenario 2: Daily check-in
**Actor:** Returning user
**Trigger:** Opens Summit the day after completing a habit
**Goal:** Record today's completion and see the streak grow

**Steps:**
1. User opens Summit (offline is fine — the app needs no network after first load).
2. The Active list shows `Read 20 minutes` with streak badge `1`; today's "Done today"
   checkbox is unchecked (yesterday's completion is history, not today's state).
3. User clicks "Done today".
4. The streak badge updates `1 → 2` immediately.
5. The footer confirms the running version ("Summit vX.Y.Z").
6. User reloads; streak `2` and today's check persist.

**Outcome:** Today is recorded, the streak grew, and the state persisted — the loop that
brings the user back tomorrow is working.

### Scenario 3: Missed day, honest reset
**Actor:** Returning user who skipped days
**Trigger:** Last completion is older than yesterday
**Goal:** Resume tracking without guilt mechanics

**Steps:**
1. User's last completion for `Read 20 minutes` is Monday's date.
2. User opens Summit on Thursday (Tuesday and Wednesday have no completions).
3. The streak badge reads `0` — the last completion is neither today nor yesterday.
4. User clicks "Done today".
5. The streak badge updates `0 → 1`; a new streak has begun.

**Outcome:** The streak told the truth (the old one died), and resuming is one click.
No "streak freeze" purchases, no shame — just an honest number.

### Scenario 4: Archive a dropped habit
**Actor:** User dropping a habit
**Trigger:** Decides a habit is no longer part of their routine
**Goal:** Get it out of the daily view without losing its history

**Steps:**
1. User opens Summit; the Active list shows `Gym — streak 4`.
2. User clicks the "Archive" action on the Gym row.
3. Gym disappears from the Active list (if it was the only habit, the "No active habits"
   empty state appears).
4. User clicks the "Archived" segment of the filter control.
5. Gym appears in the Archived view with its final streak badge (`4`) and a "Restore"
   action.
6. Under the hood, the habit's `archived` flag is `true` in `localStorage` and its
   completions array is untouched.

**Outcome:** The habit is out of sight but not destroyed — history is intact and one
click away.

### Scenario 5: Restore an archived habit
**Actor:** User resuming a dropped habit
**Trigger:** Decides to restart a previously archived habit
**Goal:** Put the habit back into the daily rotation with its history

**Steps:**
1. User opens Summit and clicks the "Archived" filter segment.
2. The Archived view shows `Gym` (streak badge `4` from its last active period).
3. User clicks "Restore" on the Gym row.
4. Gym leaves the Archived view (empty state "No archived habits." if it was the only one).
5. User clicks "Active"; Gym reappears with its streak recomputed from history
   (`0` if the last completion is stale, its alive value otherwise).
6. User clicks "Done today"; the badge updates accordingly and today's date joins the
   completions.

**Outcome:** The habit is back in rotation with zero data loss — old completions feed
the streak rule exactly as before.

## 6. System Interfaces & Data Flows

**External interfaces:** the browser UI, two diagnostic surfaces (the console startup
line and the footer version string), and one read-only fetch target: the PeakFlames
brand webfonts (Archivo / IBM Plex Sans / JetBrains Mono) are loaded from Google Fonts
via the vendored token CSS `@import` plus `<link rel="preconnect">` hints. Summit has no
API and no telemetry, and habit data never touches the network. The font fetch happens
on first load and is served from cache afterwards; if it fails (fully offline, blocked
CDN), the app renders with system-font fallbacks and remains fully functional.

**Data source:**

| Source | Kind | Purpose |
|---|---|---|
| `localStorage["summit.habits.v1"]` | Browser key-value store | Sole persistence for all app data |
| Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) | Static asset CDN (read-only) | PeakFlames brand webfonts; system-font fallback if unreachable |

**Stored document (draft schema):**

```json
{
  "schemaVersion": 1,
  "habits": [
    {
      "id": "b3f9c2e1",
      "name": "Read 20 minutes",
      "createdAt": "2026-09-04",
      "archived": false,
      "completions": ["2026-09-04"]
    }
  ]
}
```

- `completions` holds unique local dates (`YYYY-MM-DD`); toggling "Done today" adds or
  removes today's date.
- `schemaVersion` enables future migrations; v1 never rewrites someone else's shape.

**Data flow:**

```
                ┌─────────────────────────────────────┐
                │              Browser                │
 User ──input──▶│  UI (single page, no routing)       │
                │   ├─ Add habit input + Add button   │
                │   ├─ Filter: All | Active | Archived│
                │   ├─ Habit rows: name, streak badge,│
                │   │  "Done today" toggle, Archive / │
                │   │  Restore                        │
                │   └─ Footer: "Summit vX.Y.Z"        │
                │        │ every mutation             │
                │        ▼                            │
                │   In-memory app state               │
                │        │ serialize + write          │
                │        ▼                            │
                │   localStorage                      │
                │   ["summit.habits.v1"]              │
                └─────────────────────────────────────┘
 Boot: read key → validate/parse → hydrate state → render
       → console "[INFO] Summit vX.Y.Z starting"
 Unreadable data → banner: problem + "Start fresh" action.
 No app-level network I/O at any point. Webfonts (Google Fonts) are
 fetched on first load; offline renders with system-font fallback.
 Styles layering: vendored PeakFlames tokens (base) ← Summit layout (top).
```

## 7. Functional Summary

| Area | Capability | Notes |
|---|---|---|
| Habit management | Add habit | Name-only; non-empty after trim, ≤ 80 chars; duplicates allowed |
| Habit management | Archive / Restore | Hides from Active; completions preserved; restorable |
| Daily check-in | "Done today" toggle | Idempotent per local date; unchecking removes today's completion and recomputes the streak |
| Streaks | Current-streak badge | Consecutive days ending today-or-yesterday; `0` if neither (normative rule, PV §6) |
| List & filter | All / Active / Archived | Default Active; archived rows tagged in All; per-filter empty states |
| Cross-cutting | Persistence | Single versioned `localStorage` key; write on every mutation |
| Cross-cutting | Version display | Footer `Summit vX.Y.Z` + startup console line, both from `package.json#version` |
| Cross-cutting | Error standard | Inline messages name the problem and next action; unreadable saved data → "Start fresh" banner |

## 8. Operational Constraints & Assumptions

| Constraint | Detail |
|---|---|
| Deployment | Static hosting only; no server component now or later (scope rule) |
| Users | One human per browser profile; no multi-user, no sharing |
| Auth | None — there is nothing to authenticate to |
| Data locality | 100% `localStorage`; browser eviction or user clearing loses data (accepted risk, surfaced via the unreadable-data banner) |
| Network | No app-level network calls; the only fetch is the Google Fonts webfont request on first load (cached thereafter; system-font fallback keeps the app fully functional offline) |
| Browsers | Current evergreen Chrome / Firefox / Safari / Edge; JavaScript required |
| Language | English UI (v1) |
| Versioning | SemVer; single source of truth `package.json#version` |
| CI | None yet (setup audit); quality gates run locally before every commit |
| Streak semantics | Local calendar days in the user's timezone; no UTC day-boundary surprises |

## 9. Glossary

| Term | Definition |
|---|---|
| Habit | A named activity the user wants to repeat; the unit of tracking |
| Active habit | A habit with `archived: false`; appears in the default Active view |
| Archived habit | A habit retired from the daily list; history retained; restorable |
| Completion | One local calendar day on which a habit was marked done |
| Current streak | Count of consecutive completion days ending today (if today is completed) or yesterday; `0` if neither |
| Local date | Calendar date in the user's timezone, stored as `YYYY-MM-DD` |
| `summit.habits.v1` | The single `localStorage` key holding all app data |
| Schema version | Integer field inside the stored JSON enabling future migrations |
| Empty state | Friendly message shown when the current filter has no rows |
| PeakFlames Design System | The shared design language for PeakFlames products: dark obsidian canvas, flame/ember/amber accent ramp, Archivo / IBM Plex Sans / JetBrains Mono type ramp, `.pf-*` component classes |
| Token CSS | The design system's CSS custom-property files, vendored byte-identical into the repo and imported as the base stylesheet layer |
| Flame accent | The design system's bright primary accent (`--flame`); reserved for exactly one "hot" element per view |
| One hot element per view | Design-system rule: only one element per view may carry the flame accent — in Summit, the Add habit button |
| Ember gradient | The design system's gradient treatment marking the selected filter tab |
| `.pf-*` classes | Component classes from the design system (e.g. `pf-btn`, `pf-card`, `pf-tabs`), added additively alongside existing class names |
| SPA | Single-page application — one HTML page, no routing |

---

*Companion document: [product-vision.md](product-vision.md) — product name, problem,
goals, MVP scope, and future vision.*
