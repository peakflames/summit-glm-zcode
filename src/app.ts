import { log } from './lib/logger';
import { emptyState, loadState, saveState } from './lib/storage';
import type { AppState } from './lib/storage';
import { archiveHabit, restoreHabit, toggleToday } from './lib/habits';
import type { HabitActionResult } from './lib/habits';
import { APP_NAME, APP_VERSION } from './lib/version';
import { dismissBanner, showInlineError, showRecoveryBanner } from './ui/error-banner';
import { initHabitForm } from './ui/habit-form';
import { renderHabitList } from './ui/habit-list';
import { renderFilterBar, type FilterValue } from './ui/filter-bar';

// Names the problem AND the next user action, per the error-message standard.
const SAVE_FAILED_MESSAGE =
  'Couldn\u2019t save your changes: browser storage is full. Remove archived habits to free space.';

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
  const filterEl: HTMLElement = filterRoot;

  // In-memory mirror of the stored document; updated on every successful
  // mutation and re-rendered from.
  let state: AppState = emptyState();

  // TOR-05-PrNhHoE: the Active view is the selected filter by default, fresh
  // or with existing data — the daily list stays uncluttered on open.
  let filter: FilterValue = 'active';

  function render(): void {
    renderFilterBar(filterEl, filter, {
      onChange: (value) => {
        filter = value;
        render();
      },
    });
    renderHabitList(listEl, state, filter, {
      onToggle: (id) => runAction(toggleToday(id)),
      onArchive: (id) => runAction(archiveHabit(id)),
      onRestore: (id) => runAction(restoreHabit(id)),
    });
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
