// Habit row rendering (Epic AQNWtiB, wired in Epic m1i25n4; archived tag added
// in Epic XDc5Tpp; row UI parity in Epic lfstJmm). One row per habit: the name,
// "Archived" tag when the habit is archived, streak badge with "DAY STREAK"
// caption, the "Done today" toggle button, and the archive/restore action. The
// row is a pure function of the habit — the button's pressed state reflects
// the stored completions and the badge comes from streaks.ts — so every render
// (initial, post-toggle, restored) is history-derived with no special cases.
// Rows are <li> elements inside the list's <ul class="habit-rows"> and follow
// the reference layout: name first, controls right, flex-wrap reflow on mobile.

import type { Habit } from '../lib/storage';
import { currentStreak, todayLocalDate } from '../lib/streaks';

export interface HabitRowCallbacks {
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export function renderHabitRow(habit: Habit, callbacks: HabitRowCallbacks): HTMLElement {
  const row = document.createElement('li');
  // pf-card (Epic NZK8kqE) supplies the raised surface; the row layout stays
  // in styles.css under the original class name.
  row.className = 'habit-row pf-card';
  row.dataset.habitId = habit.id;

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

  // TOR-04-rknaMfI (Epic lfstJmm): every badge shows the streak number with a
  // "DAY STREAK" caption directly beneath it, on active and archived rows
  // alike. The number keeps the amber display-face hero styling
  // (TOR-07-pa7ak24) and the caption carries the mono caption ramp.
  const today = todayLocalDate();
  const streak = String(currentStreak(habit.completions, today));
  const badge = document.createElement('span');
  badge.className = 'streak-badge';
  badge.setAttribute('aria-label', `Current streak: ${streak}`);
  const number = document.createElement('span');
  number.className = 'streak-number';
  number.textContent = streak;
  const caption = document.createElement('span');
  caption.className = 'streak-caption';
  caption.textContent = 'DAY STREAK';
  badge.append(number, caption);
  row.append(badge);

  // TOR-03-WUQGIE9 / TOR-03-M5RmMBx (Epic lfstJmm): the check-in control is a
  // toggle button, not a checkbox. pf-btn--secondary supplies the neutral
  // outlined undone treatment; the done state is Summit CSS on
  // .habit-done-btn[aria-pressed="true"] (TOR-07-OgGR571) — quiet success
  // green, never the flame accent: the Add button is the one hot element
  // (TOR-07-EXjNoVz).
  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'habit-done-btn pf-btn pf-btn--secondary pf-btn--md';
  const isDone = habit.completions.includes(today);
  done.setAttribute('aria-pressed', String(isDone));
  done.setAttribute('aria-label', `Mark ${habit.name} done today`);
  done.textContent = isDone ? 'Done ✓' : 'Done today';
  done.addEventListener('click', () => callbacks.onToggle(habit.id));
  row.append(done);

  const action = document.createElement('button');
  action.type = 'button';
  // pf-btn--secondary (Epic NZK8kqE): the archive/restore control must NOT
  // carry the flame accent — the Add button is the one hot element
  // (TOR-07-EXjNoVz).
  action.className = 'habit-action pf-btn pf-btn--secondary pf-btn--md';
  if (habit.archived) {
    action.textContent = 'Restore';
    action.setAttribute('aria-label', `Restore ${habit.name}`);
    action.addEventListener('click', () => callbacks.onRestore(habit.id));
  } else {
    action.textContent = 'Archive';
    action.setAttribute('aria-label', `Archive ${habit.name}`);
    action.addEventListener('click', () => callbacks.onArchive(habit.id));
  }
  row.append(action);

  return row;
}
