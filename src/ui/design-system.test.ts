// Design-system adoption tests (Epic NZK8kqE). The PeakFlames restyle is
// strictly additive — original class names stay, .pf-* classes are added
// alongside them — so these tests pin the class-level contract the visual
// TORs depend on. Computed-style checks (obsidian canvas, font rendering,
// focus rings, gradient, prominence) are covered by the live browser pass;
// happy-dom cannot resolve the vendored token CSS.

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderFilterBar, type FilterValue } from './filter-bar';
import { renderHabitRow, type HabitRowCallbacks } from './habit-row';
import type { Habit } from '../lib/storage';

function fixture(): void {
  document.body.innerHTML = `
    <section class="filter" id="filter" aria-label="Filter habits"></section>
  `;
}

function segments(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('.filter-segment')];
}

const noopCallbacks: HabitRowCallbacks = {
  onToggle: () => undefined,
  onArchive: () => undefined,
  onRestore: () => undefined,
};

function habitFixture(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Walk the dog',
    createdAt: '2026-09-04T08:15:00.000Z',
    archived: false,
    completions: [],
    ...overrides,
  };
}

describe('design system adoption', () => {
  let changes: FilterValue[];

  beforeEach(() => {
    fixture();
    changes = [];
  });

  // TOR-07-o4sphQD
  // Given the app is loaded and the Active filter is selected,
  // When the user switches to the Archived filter,
  // Then the Archived filter segment should display the ember gradient
  // selection treatment (pf-tab--active), and the Active segment should no
  // longer display it.
  it('moves the pf-tab--active ember treatment with the filter selection', () => {
    const root = document.querySelector<HTMLElement>('#filter')!;
    renderFilterBar(root, 'active', { onChange: (value) => changes.push(value) });

    const byLabel = (label: string) =>
      segments().find((segment) => segment.textContent === label)!;

    expect(byLabel('Active').classList.contains('is-selected')).toBe(true);
    expect(byLabel('Active').classList.contains('pf-tab--active')).toBe(true);
    expect(byLabel('All').classList.contains('pf-tab--active')).toBe(false);
    expect(byLabel('Archived').classList.contains('pf-tab--active')).toBe(false);

    renderFilterBar(root, 'archived', { onChange: (value) => changes.push(value) });

    expect(byLabel('Archived').classList.contains('is-selected')).toBe(true);
    expect(byLabel('Archived').classList.contains('pf-tab--active')).toBe(true);
    expect(byLabel('Active').classList.contains('is-selected')).toBe(false);
    expect(byLabel('Active').classList.contains('pf-tab--active')).toBe(false);
    expect(changes).toEqual([]);
  });

  // TOR-07-pa7ak24 (class-level support) + TOR-07-EXjNoVz (row controls)
  // Given a habit row is rendered,
  // Then the row sits on the pf-card surface, the streak badge is present,
  // and the row's action control carries the secondary (non-flame) treatment.
  it('renders rows on the pf-card surface with a non-flame secondary action', () => {
    const row = renderHabitRow(habitFixture(), noopCallbacks);

    expect(row.classList.contains('habit-row')).toBe(true);
    expect(row.classList.contains('pf-card')).toBe(true);
    expect(row.querySelector<HTMLElement>('.streak-badge')).not.toBeNull();

    const action = row.querySelector<HTMLButtonElement>('.habit-action')!;
    expect(action.classList.contains('pf-btn')).toBe(true);
    expect(action.classList.contains('pf-btn--secondary')).toBe(true);
    expect(action.classList.contains('pf-btn--primary')).toBe(false);
  });

  // TOR-07-EXjNoVz
  // Given the app is loaded and displaying the Active habits view,
  // When the user views the page,
  // Then exactly one control on the page carries the flame-accent (primary)
  // treatment. The primary lives on the static Add button in index.html; the
  // app.test.ts fixture rebuilds the shell without classes, so this pins the
  // real markup plus every dynamic control source. The DOM-level "exactly
  // one" assertion is repeated against the live page in the browser pass.
  it('reserves the pf-btn--primary flame treatment for the single Add control', () => {
    const index = readFileSync('index.html', 'utf-8');

    const addButton = /<button[^>]*id="add-habit"[^>]*>/.exec(index)?.[0] ?? '';
    expect(addButton).toContain('pf-btn');
    expect(addButton).toContain('pf-btn--primary');
    expect((index.match(/pf-btn--primary/g) ?? []).length).toBe(1);

    for (const source of [
      'src/ui/habit-row.ts',
      'src/ui/habit-list.ts',
      'src/ui/filter-bar.ts',
      'src/ui/habit-form.ts',
      'src/ui/error-banner.ts',
    ]) {
      expect(readFileSync(source, 'utf-8')).not.toContain('pf-btn--primary');
    }
  });
});
