import { log } from './lib/logger';
import { readState } from './lib/storage';
import { APP_NAME, APP_VERSION } from './lib/version';

interface FilterOption {
  value: 'all' | 'active' | 'archived';
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

function renderFilterControl(root: HTMLElement): void {
  const label = document.createElement('label');
  label.textContent = 'Filter: ';
  const select = document.createElement('select');
  select.id = 'habit-filter';
  select.setAttribute('aria-label', 'Filter habits by status');
  for (const option of FILTER_OPTIONS) {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.label;
    select.append(el);
  }
  label.append(select);
  root.append(label);
}

function renderHabitList(root: HTMLElement, habitCount: number): void {
  root.replaceChildren();
  if (habitCount === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No habits yet';
    root.append(empty);
    return;
  }
  // Habit rows are rendered by later epics; this epic only establishes the list area.
}

function renderFooter(root: HTMLElement): void {
  root.textContent = `${APP_NAME} v${APP_VERSION}`;
}

// Render the single-screen shell and wire the static markup in index.html.
// Called exactly once from main.ts during boot; no setup gate — every control
// is usable immediately after render.
export function renderApp(): void {
  const filterRoot = document.querySelector<HTMLElement>('#filter');
  const listRoot = document.querySelector<HTMLElement>('#habit-list');
  const footerRoot = document.querySelector<HTMLElement>('#footer');
  const addInput = document.querySelector<HTMLInputElement>('#habit-name');
  const addButton = document.querySelector<HTMLButtonElement>('#add-habit');

  if (!filterRoot || !listRoot || !footerRoot || !addInput || !addButton) {
    log.error('App shell markup is missing required elements — cannot render');
    throw new Error('App shell markup is missing required elements');
  }

  renderFilterControl(filterRoot);

  const state = readState();
  renderHabitList(listRoot, state.habits.length);

  renderFooter(footerRoot);

  // The add flow is implemented by a later epic; the input is wired to be
  // immediately typeable and focusable with no configuration step.
  addButton.disabled = false;
}
