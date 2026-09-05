// Habit list rendering (Epic XDc5Tpp): per-filter row contents and the
// per-filter empty states. The list is a pure function of (state, filter) —
// every render derives rows and messages from the stored document with no
// special cases.

import type { AppState, Habit } from '../lib/storage';
import { renderHabitRow } from './habit-row';
import type { HabitRowCallbacks } from './habit-row';
import type { FilterValue } from './filter-bar';

export function visibleHabits(state: AppState, filter: FilterValue): Habit[] {
  switch (filter) {
    case 'active':
      return state.habits.filter((habit) => !habit.archived);
    case 'archived':
      return state.habits.filter((habit) => habit.archived);
    case 'all':
      return state.habits;
  }
}

// TOR-05-0maiBlC: each filter with no rows renders its own friendly message.
// The Active message distinguishes "nothing yet" (point at the add form)
// from "everything is archived".
export function emptyStateMessage(state: AppState, filter: FilterValue): string {
  switch (filter) {
    case 'active':
      return state.habits.length === 0
        ? 'No habits yet. Add your first habit above.'
        : 'No active habits.';
    case 'archived':
      return 'No archived habits.';
    case 'all':
      return 'No habits yet. Add your first habit above.';
  }
}

// TOR-04-HiRBSAa (Epic lfstJmm): the Active view teaches the streak rule with
// a one-line hint above the list; it disappears on the Archived (and All)
// views. Exact wording is pinned by the TOR's Then clause.
const HELP_HINT_TEXT =
  'Mark done tomorrow to continue a streak — a missed day resets it to 1.';

export function renderHabitList(
  listEl: HTMLElement,
  state: AppState,
  filter: FilterValue,
  callbacks: HabitRowCallbacks,
): void {
  const habits = visibleHabits(state, filter);
  listEl.replaceChildren();
  if (filter === 'active') {
    const hint = document.createElement('p');
    hint.className = 'habit-help-hint pf-hint';
    hint.textContent = HELP_HINT_TEXT;
    listEl.append(hint);
  }
  if (habits.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state pf-hint';
    empty.textContent = emptyStateMessage(state, filter);
    listEl.append(empty);
    return;
  }
  // Quick-fix row-ui-mobile-parity: rows live in a semantic <ul> (each row is
  // an <li> from renderHabitRow). The hint and empty state stay outside the
  // list as siblings — a <ul> may not contain <p> children.
  const rows = document.createElement('ul');
  rows.className = 'habit-rows';
  rows.append(...habits.map((habit) => renderHabitRow(habit, callbacks)));
  listEl.append(rows);
}
