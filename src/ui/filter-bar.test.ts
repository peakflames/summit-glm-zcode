import { beforeEach, describe, expect, it } from 'vitest';
import { renderFilterBar, type FilterValue } from './filter-bar';

function fixture(): void {
  document.body.innerHTML = `
    <section class="filter" id="filter" aria-label="Filter habits"></section>
  `;
}

function segments(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('.filter-segment')];
}

function selectedSegment(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('.filter-segment.is-selected')!;
}

describe('filter bar', () => {
  let changes: FilterValue[];

  beforeEach(() => {
    fixture();
    changes = [];
    renderFilterBar(document.querySelector<HTMLElement>('#filter')!, 'active', {
      onChange: (value) => changes.push(value),
    });
  });

  // TOR-05-GjGNESQ
  // Given Summit is open with habits present,
  // When the page renders,
  // Then a filter control is visible with three selectable segments labeled
  // "All", "Active", and "Archived".
  it('renders three selectable segments labeled All, Active, and Archived', () => {
    const bar = document.querySelector<HTMLElement>('.filter-bar')!;
    expect(bar.getAttribute('role')).toBe('radiogroup');

    const labels = segments().map((segment) => segment.textContent);
    expect(labels).toEqual(['All', 'Active', 'Archived']);
    for (const segment of segments()) {
      expect(segment.tagName).toBe('BUTTON');
      expect(segment.getAttribute('role')).toBe('radio');
    }
  });

  // TOR-05-PrNhHoE
  // Given Summit is loaded in a browser (fresh or with existing data),
  // When the page renders,
  // Then the "Active" segment of the filter control is the selected one.
  it('selects the Active segment when rendered with the default value', () => {
    expect(selectedSegment().textContent).toBe('Active');
    expect(selectedSegment().getAttribute('aria-checked')).toBe('true');
    expect(
      segments()
        .filter((segment) => segment.getAttribute('aria-checked') === 'true'),
    ).toHaveLength(1);
  });

  it('marks the requested segment selected instead of the default', () => {
    renderFilterBar(document.querySelector<HTMLElement>('#filter')!, 'archived', {
      onChange: (value) => changes.push(value),
    });

    expect(selectedSegment().textContent).toBe('Archived');
  });

  it('fires onChange with the clicked segment value', () => {
    segments().find((segment) => segment.textContent === 'All')!.click();

    expect(changes).toEqual(['all']);
  });

  it('re-rendering with a new value moves the selection', () => {
    const root = document.querySelector<HTMLElement>('#filter')!;
    renderFilterBar(root, 'all', { onChange: (value) => changes.push(value) });

    expect(selectedSegment().textContent).toBe('All');
    expect(changes).toEqual([]);
  });
});
