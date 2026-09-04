import { log } from './lib/logger';
import { emptyState, loadState, saveState } from './lib/storage';
import { APP_NAME, APP_VERSION } from './lib/version';
import { dismissBanner, showInlineError, showRecoveryBanner } from './ui/error-banner';

interface FilterOption {
  value: 'all' | 'active' | 'archived';
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

// Names the problem AND the next user action, per the error-message standard.
const SAVE_FAILED_MESSAGE =
  'Couldn\u2019t save your changes: browser storage is full. Remove archived habits to free space.';

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

// "Start fresh": reset to a clean empty v1 document, dismiss the recovery
// banner, and show the normal empty state (TOR-06-I9rZxQC).
function startFresh(listRoot: HTMLElement, errorRoot: HTMLElement): void {
  const saved = saveState(emptyState());
  if (!saved.ok) {
    showInlineError(errorRoot, SAVE_FAILED_MESSAGE);
    return;
  }
  dismissBanner(errorRoot);
  renderHabitList(listRoot, 0);
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
  const errorRoot = document.querySelector<HTMLElement>('#error-region');

  if (!filterRoot || !listRoot || !footerRoot || !addInput || !addButton || !errorRoot) {
    log.error('App shell markup is missing required elements — cannot render');
    throw new Error('App shell markup is missing required elements');
  }

  renderFilterControl(filterRoot);

  const loaded = loadState();
  if (loaded.status === 'unreadable') {
    // Recovery is a first-class boot state: name the problem, offer "Start
    // fresh", and never silently render the normal empty state
    // (TOR-06-PlcuFFf, TOR-06-CStJTf4).
    showRecoveryBanner(errorRoot, {
      reason: loaded.reason,
      onReset: () => startFresh(listRoot, errorRoot),
    });
  } else {
    renderHabitList(listRoot, loaded.state.habits.length);
  }

  renderFooter(footerRoot);

  // The add flow is implemented by a later epic; the input is wired to be
  // immediately typeable and focusable with no configuration step.
  addButton.disabled = false;
}
