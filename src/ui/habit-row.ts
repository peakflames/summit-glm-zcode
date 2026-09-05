// Habit row rendering (Epic AQNWtiB, wired in Epic m1i25n4; archived tag added
// in Epic XDc5Tpp). One row per habit: name, "Archived" tag when the habit is
// archived, streak badge, "Done today" checkbox, and the archive/restore
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
  // pf-card (Epic NZK8kqE) supplies the raised surface; the row layout stays
  // in styles.css under the original class name.
  row.className = 'habit-row pf-card';
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

  // TOR-05-qD4GGzl: the archived row must be visually distinguished in the
  // All view, where active and archived rows share the list.
  if (habit.archived) {
    const tag = document.createElement('span');
    tag.className = 'archived-tag';
    tag.textContent = 'Archived';
    row.append(tag);
  }

  const streak = String(currentStreak(habit.completions, today));
  const badge = document.createElement('span');
  badge.className = 'streak-badge';
  badge.setAttribute('aria-label', `Current streak: ${streak}`);
  badge.textContent = streak;
  row.append(badge);

  const action = document.createElement('button');
  action.type = 'button';
  // pf-btn--secondary (Epic NZK8kqE): the archive/restore control must NOT
  // carry the flame accent — the Add button is the one hot element
  // (TOR-07-EXjNoVz).
  action.className = 'habit-action pf-btn pf-btn--secondary';
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
