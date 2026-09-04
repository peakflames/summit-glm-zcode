// Habit row rendering (Epic AQNWtiB). One row per habit: name, streak badge,
// "Done today" checkbox, and the archive/restore action. The checkbox is a
// mount only in this epic — its toggle wiring and the streak computation
// (streaks.ts) arrive with epic m1i25n4.

import type { Habit } from '../lib/storage';

export interface HabitRowCallbacks {
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

// The streak engine is epic m1i25n4 scope; until it lands the badge shows 0,
// which is the correct value for every habit this epic can create through the
// UI (no completions yet).
const STREAK_PLACEHOLDER = '0';

export function renderHabitRow(habit: Habit, callbacks: HabitRowCallbacks): HTMLElement {
  const row = document.createElement('div');
  row.className = 'habit-row';
  row.dataset.habitId = habit.id;

  const done = document.createElement('input');
  done.type = 'checkbox';
  done.className = 'habit-done';
  done.checked = false;
  done.setAttribute('aria-label', `Done today: ${habit.name}`);
  row.append(done);

  const name = document.createElement('span');
  name.className = 'habit-name';
  name.textContent = habit.name;
  row.append(name);

  const streak = document.createElement('span');
  streak.className = 'streak-badge';
  streak.setAttribute('aria-label', `Current streak: ${STREAK_PLACEHOLDER}`);
  streak.textContent = STREAK_PLACEHOLDER;
  row.append(streak);

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'habit-action';
  if (habit.archived) {
    action.textContent = 'Restore';
    action.addEventListener('click', () => callbacks.onRestore(habit.id));
  } else {
    action.textContent = 'Archive';
    action.addEventListener('click', () => callbacks.onArchive(habit.id));
  }
  row.append(action);

  return row;
}
