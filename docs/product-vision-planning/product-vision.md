# Summit — Product Vision & Brief

**Document Version:** 1.0
**Date:** 2026-09-04
**Status:** Draft

---

## 1. Product Name

**Summit** — *"Track habits. Build streaks. Nothing else."*

The name plays on the streak metaphor: every checked day is one more step of the climb.
The tagline states the product's defining constraint, which doubles as its quality bar —
Summit is the public reference example for the `peak-workflow` plugin, and its smallness
is deliberate.

## 2. Problem Statement

Most habit trackers demand an account, a network connection, and patience. The typical
flow is: create an account, consent to sync, learn a dashboard, wade through reminders,
social feeds, gamification layers, and subscription prompts — before recording the one
bit of information that actually matters: *did I do the thing today?*

The core loop of habit building is tiny. A person picks a small repeatable behavior,
performs it, and wants credit for it — plus the number that keeps them coming back
tomorrow: their streak. Tools that answer "did I do it today, and how long have I kept
it going?" in five seconds barely exist, and the ones that do still upload that data to
someone else's server. Habit data is personal routine data; there is no good reason it
needs to leave the device.

**Current pain points:**

- Sign-up walls before the first check-in can be recorded
- Cloud dependency: no offline use, and personal routine data leaves the device
- Feature bloat (reminders, social, gamification, analytics) burying the streak
- Paywalls or subscriptions gating basic tracking
- Heavyweight UI for what should be a one-tap daily act

## 3. Target Users

| User group | Primary need | Notes |
|---|---|---|
| Daily habit-builder | Record "done today" in one tap and see the streak grow | Primary end user; values speed over features |
| Privacy/offline-conscious user | Data stays in the browser; works with no network and no account | Served by architecture, not settings — there is no server to trust |
| Peak-workflow learner (developer) | A small, readable reference showing the full vision → requirements → epics → verified-code lifecycle | Secondary audience, but central to this repo's purpose as the plugin's public example |

## 4. Vision Statement

Summit lets anyone track daily habits in seconds: open the page, add a habit, tap done,
watch the streak climb. No account, no server, no network — every byte lives in the
user's browser. As the public reference example for the `peak-workflow` plugin, Summit
stays deliberately small, readable, and lifecycle-complete: its success is measured less
by feature breadth than by how cleanly a newcomer can follow the entire workflow from
product vision to independently verified epics.

## 5. Goals & Success Criteria (MVP)

| # | Goal | Success criterion |
|---|---|---|
| G1 | Add a habit | New habit appears in the list immediately and survives a page reload |
| G2 | Mark done for today | One click on the row's "Done today" checkbox; state persists across reload/restart |
| G3 | See streaks | Each row shows its current streak; checking today off updates it immediately |
| G4 | Filter active/archived | Filter control switches between Active / Archived / All; archived habits are restorable |
| G5 | Local persistence | All state lives in `localStorage`; the app makes zero network calls; works fully offline |
| G6 | Zero setup | Opens to a usable app with no account and no configuration |
| G7 | Reference clarity | A newcomer can follow the peak-workflow lifecycle end-to-end through this repo's docs and git history |

## 6. MVP Scope Summary

### Habit Management
- Add a habit by name (the only required field)
- Archive a habit (removes it from the daily list, keeps its history)
- Restore an archived habit
- *Not in MVP:* renaming, permanent deletion (see §7 and §11)

### Daily Check-in
- Per-row "Done today" checkbox for the current local calendar day
- The checkbox is a toggle — an accidental check-off can be undone, and the streak
  recomputes

### Streaks
- Current streak badge shown on every habit row
- Streak recomputes from completion history on every change

**Streak rule (normative for requirements):** a habit's *current streak* is the count of
consecutive local calendar days with a completion, ending **today** if today is completed,
otherwise ending **yesterday** (an unchecked day still shows the streak until the day
truly ends). If neither today nor yesterday is completed, the streak is **0**.

### List & Filtering
- Single habit list on one screen
- Filter control with three segments: **All | Active | Archived**; default view is **Active**
- Archived rows in the All view are visually tagged
- Clear empty states for each filter ("No habits yet", "No active habits", "No archived habits")

### Cross-cutting Concerns
- Versioned `localStorage` schema (`summit.habits.v1`, `schemaVersion` field)
- App version visible in the footer, sourced from `package.json#version`
- Startup console line `[INFO] Summit vX.Y.Z starting`
- User-facing errors name the problem AND the next action; the one degradation path in
  MVP is unreadable saved data, which shows a banner offering "Start fresh"

## 7. Out of Scope for MVP

- Accounts, authentication, or user profiles
- Any backend, server, or API — including "just a tiny one"
- Multi-device or cloud sync
- Reminders and notifications
- Renaming habits after creation
- Permanently deleting habits (archive/restore only)
- Manually backfilling completions for past days
- History views or charts beyond the current-streak badge
- UI frameworks (hand-rolled DOM + TypeScript)
- Themes / dark mode
- Import/export of data
- PWA install / app-store packaging

## 8. Key Business Scenarios

1. **First habit, first streak** — A first-time visitor opens Summit, is greeted by an
   empty list, adds "Read 20 minutes" through the Add habit input, checks "Done today",
   and watches the streak badge go 0 → 1. Reloading confirms the habit and streak
   survived. *(Actor: first-time visitor; Trigger: opens Summit; Goal: start tracking;
   Outcome: first persisted habit with a live streak.)*
2. **Daily check-in** — A returning user opens Summit the next day, sees yesterday's
   habit with streak 1 and today unchecked, clicks "Done today", and the badge updates
   to 2 instantly. *(Actor: returning user; Trigger: new day; Goal: record today;
   Outcome: streak grows, state persists.)*
3. **Missed day, honest reset** — A user who last completed a habit two days ago opens
   Summit and sees the streak badge at 0. Checking "Done today" starts a fresh streak
   at 1. *(Actor: returning user; Trigger: gap in completions; Goal: resume tracking;
   Outcome: streak truthfully reset, no guilt mechanics.)*
4. **Archive a dropped habit** — A user decides to stop a habit, clicks Archive on its
   row, and the habit leaves the Active list while its history remains reachable under
   the Archived filter. *(Actor: user dropping a habit; Trigger: decision to stop;
   Goal: declutter without losing history; Outcome: habit hidden but retained.)*
5. **Restore an archived habit** — A user resumes a previously dropped habit: filter to
   Archived, click Restore, and the habit returns to the Active list with its completion
   history and streak logic intact. *(Actor: user resuming a habit; Trigger: decision to
   restart; Goal: pick up where they left off; Outcome: habit back in rotation, no data
   loss.)*

## 9. Design Direction

- One screen, no navigation: input on top, list below, footer at the bottom — the whole
  product fits a single view
- The streak number is the visual hero of each row; everything else is subordinate
- Instant feedback: every action updates the UI and persisted state immediately, no
  reloads or spinners
- Plain semantic HTML and CSS, hand-rolled DOM via TypeScript — no framework, no CSS
  system to learn
- Version always visible in the footer (`Summit vX.Y.Z`)
- Inline error messages that name the problem and the next action — never console-only,
  never vague

## 10. Data Strategy

Summit has exactly one data source: the browser's `localStorage`, under a single namespaced
key `summit.habits.v1`. The stored document is JSON with a `schemaVersion` integer and a
`habits` array; each habit carries an `id`, `name`, `createdAt`, `archived` flag, and a
`completions` array of local dates (`YYYY-MM-DD`). Every mutation (add, toggle, archive,
restore) serializes the in-memory state and writes it back immediately — there is no save
button, no debounce, and no background process.

There is no network I/O at any point: the app is fully functional offline after first
load, and habit data never leaves the device. Freshness is therefore trivially immediate —
the UI reads and writes the same in-memory state that is persisted on every change.

Accepted risks, surfaced rather than hidden: browsers may evict `localStorage` (storage
pressure, private-mode expiry, or the user clearing site data). Summit treats unreadable
saved data as a first-class state — a banner names the problem and offers "Start fresh" —
rather than silently showing an empty app. The `schemaVersion` field exists so a future
release can migrate stored data instead of discarding it.

## 11. Backlog / Future Vision

Deferred items, in rough priority order — each is a candidate for a future discovery
cycle, not an MVP commitment:

- **Rename habit** — small edit affordance on each row
- **Permanent delete with confirmation** — for habits whose history is truly unwanted
- **Manual backfill** — mark completions for past days (travel, illness, late entries)
- **Weekly history view** — last-7-days grid per habit, complementing the streak badge
- **JSON import/export** — manual backup and migration between browsers
- **Dark mode** — prefers-color-scheme first, toggle later
- **PWA / offline install** — manifest + service worker so Summit sits on a home screen
- **Multiple habit lists** — grouping (e.g., morning/evening routines)

---

*Companion document: [concept-of-operations.md](concept-of-operations.md) — operational
scenarios, system interfaces, and constraints.*
