// Habit lifecycle store actions (Epic AQNWtiB): add, archive, restore. Each
// action mutates the state and persists immediately through the canonical
// updateState path in storage.ts — there is no save button and no delay.
// Duplicate habit names are deliberately allowed (PV §6 recorded decision):
// the only name constraints are non-empty and at most 80 characters.

import { updateState } from './storage';
import type { AppState, Habit } from './storage';

export const MAX_HABIT_NAME_LENGTH = 80;

export type HabitActionError =
  | 'empty-name'
  | 'name-too-long'
  | 'unknown-habit'
  | 'quota-exceeded'
  | 'unreadable-storage';

export type HabitActionResult =
  | { ok: true; state: AppState; habit: Habit }
  | { ok: false; reason: HabitActionError };

// Add a habit by name. Whitespace-only input is rejected; surrounding
// whitespace is trimmed before the length check and before storing, so a name
// of exactly 80 visible characters is accepted and 81 is not.
export function addHabit(name: string): HabitActionResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty-name' };
  }
  if (trimmed.length > MAX_HABIT_NAME_LENGTH) {
    return { ok: false, reason: 'name-too-long' };
  }

  const habit: Habit = {
    id: crypto.randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString(),
    archived: false,
    completions: [],
  };

  const result = updateState((state) => ({
    ...state,
    habits: [...state.habits, habit],
  }));
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }
  return { ok: true, state: result.state, habit };
}

// Retire a habit without destroying its history: the row leaves the Active
// view but the stored habit keeps its completions untouched.
export function archiveHabit(id: string): HabitActionResult {
  return setArchived(id, true);
}

// Return an archived habit to the Active view with its completion history
// intact.
export function restoreHabit(id: string): HabitActionResult {
  return setArchived(id, false);
}

function setArchived(id: string, archived: boolean): HabitActionResult {
  let changed: Habit | undefined;
  const result = updateState((state) => {
    const existing = state.habits.find((habit) => habit.id === id);
    if (!existing) return state;
    changed = { ...existing, archived };
    return {
      ...state,
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, archived } : habit,
      ),
    };
  });
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }
  if (!changed) {
    return { ok: false, reason: 'unknown-habit' };
  }
  return { ok: true, state: result.state, habit: changed };
}
