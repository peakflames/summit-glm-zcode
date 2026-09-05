// Habit row rendering (Epic AQNWtiB, wired in Epic m1i25n4). One row per
// habit: name, streak badge, "Done today" checkbox, and the archive/restore
// action. The row is a pure function of the habit — the checkbox reflects the
// stored completions and the badge comes from streaks.ts — so every render
// (initial, post-toggle, restored) is history-derived with no special cases.

import type { Habit } from '../lib/storage';
import { currentStreak, todayLocalDate } from '../lib/streaks';

export interface HabitRowCallbacks {
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export function renderHabitRow(habit: Habit, callbacks: HabitRowCallbacks): HTMLElement {
  const row = document.createElement('div');
  row.className = 'habit-row';
  row.dataset.habitId = habit.id;

  const today = todayLocalDate();
  const done = document.createElement('input');
  done.type = 'checkbox';
  done.className = 'habit-done';
  done.checked = habit.completions.includes(today);
  done.setAttribute('aria-label', `Done today: ${habit.name}`);
  done.addEventListener('change', () => callbacks.onToggle(habit.id));
  row.append(done);

  const name = document.createElement('span');
  name.className = 'habit-name';
  name.textContent = habit.name;
  row.append(name);

  const streak = String(currentStreak(habit.completions, today));
  const badge = document.createElement('span');
  badge.className = 'streak-badge';
  badge.setAttribute('aria-label', `Current streak: ${streak}`);
  badge.textContent = streak;
  row.append(badge);

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
