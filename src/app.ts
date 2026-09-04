import { log } from './lib/logger';
import { emptyState, loadState, saveState } from './lib/storage';
import type { AppState } from './lib/storage';
import { archiveHabit, restoreHabit, toggleToday } from './lib/habits';
import type { HabitActionResult } from './lib/habits';
import { APP_NAME, APP_VERSION } from './lib/version';
import { dismissBanner, showInlineError, showRecoveryBanner } from './ui/error-banner';
import { initHabitForm } from './ui/habit-form';
import { renderHabitRow } from './ui/habit-row';

type FilterValue = 'all' | 'active' | 'archived';

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const EMPTY_MESSAGES: Record<FilterValue, string> = {
  all: 'No habits yet',
  active: 'No habits yet',
  archived: 'No archived habits',
};

// Names the problem AND the next user action, per the error-message standard.
const SAVE_FAILED_MESSAGE =
  'Couldn\u2019t save your changes: browser storage is full. Remove archived habits to free space.';

function renderFilterControl(root: HTMLElement, onFilterChange: () => void): void {
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
  select.addEventListener('change', onFilterChange);
  label.append(select);
  root.append(label);
}

function currentFilter(): FilterValue {
  const select = document.querySelector<HTMLSelectElement>('#habit-filter');
  const value = select?.value;
  if (value === 'active' || value === 'archived') return value;
  return 'all';
}

// Minimal view behavior: rows filtered by the selected value. The full
// filtering/views epic is XDc5Tpp; this exists so the Archived view can host
// the restore flow (TOR-02-E0o3IbX).
function visibleHabits(state: AppState, filter: FilterValue) {
  switch (filter) {
    case 'active':
      return state.habits.filter((habit) => !habit.archived);
    case 'archived':
      return state.habits.filter((habit) => habit.archived);
    case 'all':
      return state.habits;
  }
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
  const errorRoot = document.querySelector<HTMLElement>('#error-region');

  if (!filterRoot || !listRoot || !footerRoot || !errorRoot) {
    log.error('App shell markup is missing required elements — cannot render');
    throw new Error('App shell markup is missing required elements');
  }
  // Aliases narrowed by the guard above; closures below capture these as
  // non-null.
  const errorEl: HTMLElement = errorRoot;
  const listEl: HTMLElement = listRoot;

  // In-memory mirror of the stored document; updated on every successful
  // mutation and re-rendered from.
  let state: AppState = emptyState();

  function render(): void {
    const filter = currentFilter();
    const habits = visibleHabits(state, filter);
    listEl.replaceChildren();
    if (habits.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = EMPTY_MESSAGES[filter];
      listEl.append(empty);
      return;
    }
    for (const habit of habits) {
      listEl.append(
        renderHabitRow(habit, {
          onToggle: (id) => runAction(toggleToday(id)),
          onArchive: (id) => runAction(archiveHabit(id)),
          onRestore: (id) => runAction(restoreHabit(id)),
        }),
      );
    }
  }

  function runAction(result: HabitActionResult): void {
    if (result.ok) {
      state = result.state;
      render();
      return;
    }
    handleSaveFailure();
  }

  // A refused save either means storage is full or the stored document became
  // unreadable mid-session; re-check and render the right message.
  function handleSaveFailure(): void {
    const reloaded = loadState();
    if (reloaded.status === 'unreadable') {
      showRecoveryBanner(errorEl, {
        reason: reloaded.reason,
        onReset: () => startFresh(),
      });
      return;
    }
    showInlineError(errorEl, SAVE_FAILED_MESSAGE);
  }

  // "Start fresh": reset to a clean empty v1 document, dismiss the recovery
  // banner, and show the normal empty state (TOR-06-I9rZxQC).
  function startFresh(): void {
    const saved = saveState(emptyState());
    if (!saved.ok) {
      showInlineError(errorEl, SAVE_FAILED_MESSAGE);
      return;
    }
    dismissBanner(errorEl);
    state = emptyState();
    render();
  }

  renderFilterControl(filterRoot, render);

  const loaded = loadState();
  if (loaded.status === 'unreadable') {
    // Recovery is a first-class boot state: name the problem, offer "Start
    // fresh", and never silently render the normal empty state
    // (TOR-06-PlcuFFf, TOR-06-CStJTf4).
    showRecoveryBanner(errorEl, {
      reason: loaded.reason,
      onReset: startFresh,
    });
  } else {
    state = loaded.state;
    render();
  }

  initHabitForm({
    onChanged: (next) => {
      state = next;
      render();
    },
    onSaveFailed: handleSaveFailure,
  });

  renderFooter(footerRoot);
}
