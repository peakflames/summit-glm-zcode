import { beforeEach, describe, expect, it } from 'vitest';
import { emptyStateMessage, renderHabitList, visibleHabits } from './habit-list';
import type { AppState, Habit } from '../lib/storage';

function habit(overrides: Partial<Habit>): Habit {
  return {
    id: 'h-1',
    name: 'Gym',
    createdAt: '2026-08-01T08:00:00.000Z',
    archived: false,
    completions: [],
    ...overrides,
  };
}

// TOR-05-sAMxFFs / TOR-05-qD4GGzl fixture: two active habits and one archived.
const TWO_ACTIVE_ONE_ARCHIVED: AppState = {
  schemaVersion: 1,
  habits: [
    habit({ id: 'run-1', name: 'Run' }),
    habit({ id: 'gym-1', name: 'Gym', archived: true }),
    habit({ id: 'read-1', name: 'Read' }),
  ],
};

const NO_HABITS: AppState = { schemaVersion: 1, habits: [] };

const ONLY_ARCHIVED: AppState = {
  schemaVersion: 1,
  habits: [habit({ id: 'gym-1', name: 'Gym', archived: true })],
};

function rowNames(): string[] {
  return [...document.querySelectorAll('.habit-row .habit-name')].map(
    (el) => el.textContent ?? '',
  );
}

describe('visibleHabits', () => {
  it('Active shows only non-archived habits', () => {
    expect(
      visibleHabits(TWO_ACTIVE_ONE_ARCHIVED, 'active').map((h) => h.id),
    ).toEqual(['run-1', 'read-1']);
  });

  it('Archived shows only archived habits', () => {
    expect(
      visibleHabits(TWO_ACTIVE_ONE_ARCHIVED, 'archived').map((h) => h.id),
    ).toEqual(['gym-1']);
  });

  it('All shows every habit, archived or not', () => {
    expect(
      visibleHabits(TWO_ACTIVE_ONE_ARCHIVED, 'all').map((h) => h.id),
    ).toEqual(['run-1', 'gym-1', 'read-1']);
  });
});

describe('emptyStateMessage', () => {
  // TOR-05-0maiBlC message table.
  it('Active with no habits at all points at the add form', () => {
    expect(emptyStateMessage(NO_HABITS, 'active')).toBe(
      'No habits yet. Add your first habit above.',
    );
  });

  it('Active with only archived habits says there are no active habits', () => {
    expect(emptyStateMessage(ONLY_ARCHIVED, 'active')).toBe('No active habits.');
  });

  it('Archived with no archived habits says there are no archived habits', () => {
    expect(emptyStateMessage(TWO_ACTIVE_ONE_ARCHIVED, 'archived')).toBe(
      'No archived habits.',
    );
  });

  it('All with no habits at all points at the add form', () => {
    expect(emptyStateMessage(NO_HABITS, 'all')).toBe(
      'No habits yet. Add your first habit above.',
    );
  });
});

describe('renderHabitList', () => {
  let listEl: HTMLElement;
  const callbacks = {
    onToggle: () => {},
    onArchive: () => {},
    onRestore: () => {},
  };

  beforeEach(() => {
    document.body.innerHTML = '<section class="habit-list" id="habit-list"></section>';
    listEl = document.querySelector<HTMLElement>('#habit-list')!;
  });

  // TOR-05-sAMxFFs
  // Given two active habits and one archived habit,
  // When the user switches the filter from "Active" to "Archived",
  // Then the Archived view lists exactly the archived habit with a "Restore"
  // action and its streak badge, and Active lists exactly the two active
  // habits each with an "Archive" action.
  it('Archived view lists exactly the archived habit with Restore and a badge', () => {
    renderHabitList(listEl, TWO_ACTIVE_ONE_ARCHIVED, 'archived', callbacks);

    expect(rowNames()).toEqual(['Gym']);
    const row = document.querySelector<HTMLElement>('.habit-row')!;
    expect(
      row.querySelector<HTMLButtonElement>('.habit-action')!.textContent,
    ).toBe('Restore');
    expect(row.querySelector<HTMLElement>('.streak-badge')!.textContent).toMatch(
      /^\d+$/,
    );
  });

  it('Active view lists exactly the active habits with Archive actions', () => {
    renderHabitList(listEl, TWO_ACTIVE_ONE_ARCHIVED, 'active', callbacks);

    expect(rowNames()).toEqual(['Run', 'Read']);
    for (const row of document.querySelectorAll<HTMLElement>('.habit-row')) {
      expect(row.querySelector<HTMLButtonElement>('.habit-action')!.textContent).toBe(
        'Archive',
      );
    }
  });

  // TOR-05-qD4GGzl
  // Given two active habits and one archived habit,
  // When the user selects the "All" filter segment,
  // Then the list shows all three rows and the archived habit's row carries a
  // visible "Archived" tag and offers "Restore" rather than "Archive".
  it('All view shows every row with the archived row tagged and offering Restore', () => {
    renderHabitList(listEl, TWO_ACTIVE_ONE_ARCHIVED, 'all', callbacks);

    expect(rowNames()).toEqual(['Run', 'Gym', 'Read']);
    const archivedRow = document.querySelectorAll<HTMLElement>('.habit-row')[1]!;
    expect(archivedRow.dataset.habitId).toBe('gym-1');
    const tag = archivedRow.querySelector<HTMLElement>('.archived-tag')!;
    expect(tag.textContent).toBe('Archived');
    expect(
      archivedRow.querySelector<HTMLButtonElement>('.habit-action')!.textContent,
    ).toBe('Restore');

    // The active rows carry no tag and offer Archive.
    for (const index of [0, 2]) {
      const row = document.querySelectorAll<HTMLElement>('.habit-row')[index]!;
      expect(row.querySelector('.archived-tag')).toBeNull();
      expect(
        row.querySelector<HTMLButtonElement>('.habit-action')!.textContent,
      ).toBe('Archive');
    }
  });

  it('renders the filter-specific empty message when the view has no rows', () => {
    renderHabitList(listEl, NO_HABITS, 'archived', callbacks);

    expect(document.querySelectorAll('.habit-row')).toHaveLength(0);
    const empty = listEl.querySelector<HTMLElement>('.empty-state')!;
    expect(empty.textContent).toBe('No archived habits.');
  });
});
