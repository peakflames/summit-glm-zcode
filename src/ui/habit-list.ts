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

export function renderHabitList(
  listEl: HTMLElement,
  state: AppState,
  filter: FilterValue,
  callbacks: HabitRowCallbacks,
): void {
  const habits = visibleHabits(state, filter);
  if (habits.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state pf-hint';
    empty.textContent = emptyStateMessage(state, filter);
    listEl.replaceChildren(empty);
    return;
  }
  listEl.replaceChildren(...habits.map((habit) => renderHabitRow(habit, callbacks)));
}
