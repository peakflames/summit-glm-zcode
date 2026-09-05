import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { renderApp } from './app';
import { STORAGE_KEY } from './lib/storage';
import { addDays, todayLocalDate } from './lib/streaks';
import { readFileSync } from 'node:fs';

function boot(): void {
  renderApp();
}

// TOR-01-UBs4L4y / TOR-01-9FydwtZ / TOR-06-7l9Trjh DOM-level assertions.
// Given a browser profile with no prior Summit data,
// When Summit renders,
// Then the single-screen shell shows every required element with no setup step.
describe('app shell', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="error-region" id="error-region" aria-label="Messages"></section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('boots into a usable single-screen interface with no setup step', () => {
    boot();

    expect(document.querySelector('.shell-header h1')?.textContent).toBe('Summit');
    const input = document.querySelector<HTMLInputElement>('#habit-name');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(document.querySelector<HTMLButtonElement>('#add-habit')?.textContent).toBe('Add');
    expect(document.querySelector('#habit-filter')).toBeInstanceOf(HTMLSelectElement);
    expect(document.querySelector('#habit-list')).toBeInstanceOf(HTMLElement);
    expect(document.querySelector('#footer')?.textContent).not.toBe('');

    // The "Add habit" input can be typed into immediately.
    expect(input?.disabled).toBe(false);
    input!.value = 'Walk the dog';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input!.value).toBe('Walk the dog');
  });

  it('footer displays "Summit vX.Y.Z" sourced from package.json#version', () => {
    boot();

    const footer = document.querySelector('#footer')?.textContent ?? '';
    expect(footer).toMatch(/^Summit v\d+\.\d+\.\d+$/);
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      version: string;
    };
    expect(footer).toBe(`Summit v${pkg.version}`);
  });

  it('renders the "No habits yet" empty state with no error banner when the storage key is absent', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    boot();

    expect(document.querySelector('#habit-list')?.textContent).toContain('No habits yet');
    expect(document.querySelector('.error-banner')).toBeNull();
    // The empty state must not be an error banner masquerading as one —
    // the shell renders normally with no recovery UI.
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });
});

// TOR-06-PlcuFFf / TOR-06-CStJTf4 (boot-level)
// Given the key holds invalid JSON — or otherwise-valid JSON with an
// unsupported schemaVersion —
// When Summit loads,
// Then an in-page banner explains the data could not be read and offers
// "Start fresh", and the app does not silently render the normal empty state.
describe('boot with unreadable saved data', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="error-region" id="error-region" aria-label="Messages"></section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the recovery banner for corrupt JSON instead of the empty state', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    boot();

    const banner = document.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect(banner!.textContent).toContain('couldn\u2019t read your saved data');
    expect(document.querySelector<HTMLButtonElement>('.error-banner-action')?.textContent).toBe(
      'Start fresh',
    );
    // The app must not silently render the normal empty state.
    expect(document.querySelector('#habit-list')?.textContent).not.toContain('No habits yet');
  });

  it('shows the same recovery banner for a stored schemaVersion it does not understand', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, habits: [] }),
    );

    boot();

    const banner = document.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect(banner!.textContent).toContain('newer version of Summit');
    expect(document.querySelector<HTMLButtonElement>('.error-banner-action')?.textContent).toBe(
      'Start fresh',
    );
    expect(document.querySelector('#habit-list')?.textContent).not.toContain('No habits yet');
  });
});

// TOR-06-I9rZxQC
// Given the unreadable-data banner is showing,
// When the user clicks "Start fresh",
// Then the banner is dismissed, the Active view shows "No habits yet", and the
// storage key contains a fresh empty v1 document.
describe('Start fresh reset', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="error-region" id="error-region" aria-label="Messages"></section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resets to a clean empty state and writes a fresh empty v1 document', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    boot();
    expect(document.querySelector('[role="alert"]')).not.toBeNull();

    document.querySelector<HTMLButtonElement>('.error-banner-action')!.click();

    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(document.querySelector('#habit-list')?.textContent).toContain('No habits yet');
    const doc = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as {
      schemaVersion: number;
      habits: unknown[];
    };
    expect(doc).toEqual({ schemaVersion: 1, habits: [] });
  });
});

// TOR-01-yNjDWrJ (boot-level)
// Given a save is refused (storage full) during an action the user attempted,
// When the failure occurs,
// Then an inline message visible in the page names what went wrong AND what to
// do next — readable without opening developer tools.
describe('in-page error message on save failure', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="error-region" id="error-region" aria-label="Messages"></section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names the problem and the next action when Start fresh cannot save', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    boot();
    // vi.restoreAllMocks() does not reliably undo a mockImplementation on
    // happy-dom's localStorage (the throwing mock leaked into later tests),
    // so the spy is restored explicitly in a finally, unconditionally.
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    try {
      document.querySelector<HTMLButtonElement>('.error-banner-action')!.click();

      expect(setItemSpy).toHaveBeenCalled();
      const alert = document.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      const text = alert!.textContent ?? '';
      expect(text).toContain('storage is full');
      expect(text).toContain('Remove archived habits to free space');
    } finally {
      setItemSpy.mockRestore();
    }
  });
});

// Epic AQNWtiB — habit management UI.
const SHELL_FIXTURE = `
  <main class="shell">
    <header class="shell-header"><h1>Summit</h1></header>
    <section class="add-habit" aria-label="Add a habit">
      <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
      <button id="add-habit" type="button">Add</button>
    </section>
    <section class="error-region" id="error-region" aria-label="Messages"></section>
    <section class="filter" id="filter" aria-label="Filter habits"></section>
    <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
    <footer class="shell-footer" id="footer"></footer>
  </main>
`;

function bootShell(): void {
  document.body.innerHTML = SHELL_FIXTURE;
  renderApp();
}

function addHabitViaForm(name: string): void {
  const input = document.querySelector<HTMLInputElement>('#habit-name')!;
  input.value = name;
  document.querySelector<HTMLButtonElement>('#add-habit')!.click();
}

function rowNames(): string[] {
  return [...document.querySelectorAll('.habit-row .habit-name')].map(
    (el) => el.textContent ?? '',
  );
}

function setFilter(value: 'all' | 'active' | 'archived'): void {
  const select = document.querySelector<HTMLSelectElement>('#habit-filter')!;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

// TOR-02-XOoULU3 (UI level)
// Given the Active view is open,
// When the user types "Read 20 minutes" into the "Add habit" input and clicks "Add",
// Then a new row appears showing the name, a streak badge of 0, an unchecked
// "Done today" checkbox, and an "Archive" action — and the input is cleared.
describe('habit list: add flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    bootShell();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adding a habit shows a complete row immediately and clears the input', () => {
    addHabitViaForm('Read 20 minutes');

    expect(rowNames()).toEqual(['Read 20 minutes']);
    const row = document.querySelector('.habit-row')!;
    const badge = row.querySelector<HTMLElement>('.streak-badge')!;
    expect(badge.textContent).toBe('0');
    const checkbox = row.querySelector<HTMLInputElement>('.habit-done')!;
    expect(checkbox.checked).toBe(false);
    const action = row.querySelector<HTMLButtonElement>('.habit-action')!;
    expect(action.textContent).toBe('Archive');
    expect(document.querySelector<HTMLInputElement>('#habit-name')!.value).toBe('');
  });

  // TOR-02-G8b7pmU (UI level)
  // Given the habit "Read 20 minutes" was just added,
  // When the page is reloaded,
  // Then the row is present in the Active view with its name unchanged.
  it('a newly added habit survives a page reload', () => {
    addHabitViaForm('Read 20 minutes');

    bootShell(); // simulate reload: fresh DOM, same storage

    setFilter('active');
    expect(rowNames()).toEqual(['Read 20 minutes']);
  });

  // TOR-02-f9diV8o (UI level)
  // Given a habit named "Read 20 minutes" already exists,
  // When the user adds another habit also named "Read 20 minutes",
  // Then the list shows two rows named "Read 20 minutes".
  it('duplicate names show two independent rows', () => {
    addHabitViaForm('Read 20 minutes');
    addHabitViaForm('Read 20 minutes');

    expect(rowNames()).toEqual(['Read 20 minutes', 'Read 20 minutes']);
    const ids = [...document.querySelectorAll('.habit-row')].map(
      (row) => (row as HTMLElement).dataset.habitId,
    );
    expect(new Set(ids).size).toBe(2);
  });
});

// TOR-02-c7UnNH0 (UI level)
// Given the Active view shows a "Gym" row,
// When the user clicks "Archive" on the Gym row,
// Then the Gym row no longer appears in the Active view and the stored habit
// has archived set to true with its completions unchanged.
describe('habit list: archive and restore', () => {
  function seedGym(archived: boolean): void {
    localStorage.setItem(
      'summit.habits.v1',
      JSON.stringify({
        schemaVersion: 1,
        habits: [
          {
            id: 'gym-1',
            name: 'Gym',
            createdAt: '2026-08-01T08:00:00.000Z',
            archived,
            completions: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'],
          },
        ],
      }),
    );
  }

  function storedGym(): { archived: boolean; completions: string[] } {
    const doc = JSON.parse(localStorage.getItem('summit.habits.v1')!) as {
      habits: { id: string; archived: boolean; completions: string[] }[];
    };
    return doc.habits[0]!;
  }

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Archive removes the row from the Active view and preserves completions', () => {
    seedGym(false);
    bootShell();
    setFilter('active');
    expect(rowNames()).toEqual(['Gym']);

    document.querySelector<HTMLButtonElement>('.habit-row .habit-action')!.click();

    expect(rowNames()).toEqual([]);
    expect(document.querySelector('#habit-list')?.textContent).toContain('No habits yet');
    const gym = storedGym();
    expect(gym.archived).toBe(true);
    expect(gym.completions).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
  });

  // TOR-02-E0o3IbX (UI level)
  // Given the habit "Gym" is archived with four completions,
  // When the user opens the Archived filter and clicks "Restore",
  // Then Gym leaves the Archived view, reappears in Active, and keeps its
  // completions with archived set to false.
  it('Restore from the Archived view returns the habit to Active with history intact', () => {
    seedGym(true);
    bootShell();
    setFilter('archived');
    expect(rowNames()).toEqual(['Gym']);
    expect(
      document.querySelector<HTMLButtonElement>('.habit-row .habit-action')!.textContent,
    ).toBe('Restore');

    document.querySelector<HTMLButtonElement>('.habit-row .habit-action')!.click();

    expect(rowNames()).toEqual([]);
    expect(document.querySelector('#habit-list')?.textContent).toContain('No archived habits');

    setFilter('active');
    expect(rowNames()).toEqual(['Gym']);
    const gym = storedGym();
    expect(gym.archived).toBe(false);
    expect(gym.completions).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
  });
});

// Epic m1i25n4 — daily check-in & streaks.
function seedHabit(
  overrides: Partial<{ id: string; name: string; archived: boolean; completions: string[] }> = {},
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      habits: [
        {
          id: 'gym-1',
          name: 'Gym',
          createdAt: '2026-08-01T08:00:00.000Z',
          archived: false,
          completions: [],
          ...overrides,
        },
      ],
    }),
  );
}

function habitRow(index = 0): HTMLElement {
  return document.querySelectorAll<HTMLElement>('.habit-row')[index]!;
}

function rowBadge(row: HTMLElement): string {
  return row.querySelector<HTMLElement>('.streak-badge')!.textContent ?? '';
}

function rowCheckbox(row: HTMLElement): HTMLInputElement {
  return row.querySelector<HTMLInputElement>('.habit-done')!;
}

function storedCompletions(id = 'gym-1'): string[] {
  const doc = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as {
    habits: { id: string; completions: string[] }[];
  };
  return doc.habits.find((habit) => habit.id === id)!.completions;
}

// TOR-04-cS2CaLm (UI render level)
// Given habits with the feature file's completion histories relative to today,
// When the habit list renders,
// Then each row's streak badge shows the expected streak from the table —
// a gap resets the run (last row is 2, not 4).
describe('habit list: streak badge rendering', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    bootShell();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TOR-04-5xu6Aag (UI level)
  // Given at least one habit exists in the current view,
  // When the habit list renders,
  // Then each row displays a streak badge showing a non-negative integer.
  it('renders a non-negative integer streak badge on every row', () => {
    addHabitViaForm('Read 20 minutes');
    addHabitViaForm('Meditate');

    const badges = [...document.querySelectorAll<HTMLElement>('.streak-badge')];
    expect(badges.length).toBe(2);
    for (const badge of badges) {
      expect(badge.textContent).toMatch(/^\d+$/);
    }
  });

  it('renders the rule-table streaks from stored history', () => {
    const today = todayLocalDate();
    // [today, -1, -2, -3] → 4 consecutive; [today, -1, -3, -4] → 2 (gap resets).
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        habits: [
          {
            id: 'run-1',
            name: 'Run',
            createdAt: '2026-08-01T08:00:00.000Z',
            archived: false,
            completions: [addDays(today, -3), addDays(today, -2), addDays(today, -1), today],
          },
          {
            id: 'read-1',
            name: 'Read',
            createdAt: '2026-08-01T08:00:00.000Z',
            archived: false,
            completions: [addDays(today, -4), addDays(today, -3), addDays(today, -1), today],
          },
        ],
      }),
    );
    bootShell(); // fresh render from the seeded document

    expect(rowBadge(habitRow(0))).toBe('4');
    expect(rowBadge(habitRow(1))).toBe('2');
  });

  // TOR-04-ixZC5y3 (UI render level)
  // Given a habit whose most recent completions end yesterday consecutively
  // and today is not completed,
  // When the habit list renders,
  // Then the badge shows the count of consecutive days ending yesterday.
  it('keeps the yesterday-anchored streak visible when today is not yet completed', () => {
    const today = todayLocalDate();
    seedHabit({
      completions: [addDays(today, -3), addDays(today, -2), addDays(today, -1)],
    });
    bootShell();

    expect(rowBadge(habitRow(0))).toBe('3');
    expect(rowCheckbox(habitRow(0)).checked).toBe(false);
  });

  // TOR-04-Dzlhzul (UI render level)
  // Given a habit whose most recent completion is two or more days ago,
  // When the habit list renders,
  // Then the badge reads 0.
  it('renders 0 when neither today nor yesterday is completed', () => {
    seedHabit({ completions: [addDays(todayLocalDate(), -2)] });
    bootShell();

    expect(rowBadge(habitRow(0))).toBe('0');
  });
});

// TOR-03-WUQGIE9 / TOR-03-M5RmMBx / TOR-03-zr7VepE / TOR-04-Ft8iQbI (UI level)
// Check-in toggle: record, undo, idempotence across reloads, and instant
// badge updates without a page reload.
describe('habit list: done-today toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    bootShell();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checking "Done today" records today, persists, and survives a reload', () => {
    seedHabit();
    bootShell();
    const checkbox = rowCheckbox(habitRow(0));
    expect(checkbox.checked).toBe(false);

    checkbox.click();

    expect(rowCheckbox(habitRow(0)).checked).toBe(true);
    const today = todayLocalDate();
    expect(storedCompletions().filter((d) => d === today)).toHaveLength(1);

    bootShell(); // simulate reload: fresh DOM, same storage
    expect(rowCheckbox(habitRow(0)).checked).toBe(true);
  });

  it('unchecking removes today and recomputes the badge to the yesterday-anchored streak', () => {
    const today = todayLocalDate();
    seedHabit({ completions: [addDays(today, -1), today] });
    bootShell();
    expect(rowBadge(habitRow(0))).toBe('2');

    rowCheckbox(habitRow(0)).click();

    expect(rowCheckbox(habitRow(0)).checked).toBe(false);
    expect(storedCompletions()).toEqual([addDays(today, -1)]);
    expect(rowBadge(habitRow(0))).toBe('1');
  });

  it('toggling off and back on across a reload never duplicates today', () => {
    seedHabit();
    bootShell();

    rowCheckbox(habitRow(0)).click();
    bootShell(); // reload
    rowCheckbox(habitRow(0)).click(); // undo
    rowCheckbox(habitRow(0)).click(); // record again

    const today = todayLocalDate();
    expect(storedCompletions().filter((d) => d === today)).toHaveLength(1);
  });

  // TOR-04-Ft8iQbI (UI level)
  // Given a habit whose streak badge reads 0 because its last completion is
  // stale,
  // When the user checks "Done today" on that row,
  // Then the badge changes to 1 in the already-rendered page, with no reload.
  it('updates the streak badge immediately on toggle, without a reload', () => {
    seedHabit({ completions: [addDays(todayLocalDate(), -5)] });
    bootShell();
    expect(rowBadge(habitRow(0))).toBe('0');
    const listEl = document.querySelector('#habit-list')!;

    rowCheckbox(habitRow(0)).click();

    // Same rendered page: the list element identity is unchanged (no reload,
    // no re-boot) and the badge already shows 1.
    expect(document.querySelector('#habit-list')).toBe(listEl);
    expect(rowBadge(habitRow(0))).toBe('1');
  });

  // AQNWtiB follow-up: duplicate rows stay independent at the interaction
  // level once the check-in toggle is wired.
  it('toggling one of two same-named rows leaves the other untouched', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        habits: [
          {
            id: 'a-1',
            name: 'Read',
            createdAt: '2026-08-01T08:00:00.000Z',
            archived: false,
            completions: [],
          },
          {
            id: 'a-2',
            name: 'Read',
            createdAt: '2026-08-01T08:00:00.000Z',
            archived: false,
            completions: [],
          },
        ],
      }),
    );
    bootShell();

    rowCheckbox(habitRow(0)).click();

    expect(rowCheckbox(habitRow(0)).checked).toBe(true);
    expect(rowCheckbox(habitRow(1)).checked).toBe(false);
    expect(storedCompletions('a-1')).toEqual([todayLocalDate()]);
    expect(storedCompletions('a-2')).toEqual([]);
  });
});

// TOR-04-GN2fJoI (UI level)
// Given an archived habit with preserved completion history,
// When it is restored to the Active view,
// Then its badge shows the history-derived value — the consecutive-days
// count when yesterday or today is completed, otherwise 0.
describe('habit list: restored habit streak recompute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recomputes the streak from preserved history after restore', () => {
    const today = todayLocalDate();
    seedHabit({
      archived: true,
      completions: [addDays(today, -1), addDays(today, -2), today],
    });
    bootShell();
    setFilter('archived');
    expect(rowNames()).toEqual(['Gym']);

    document.querySelector<HTMLButtonElement>('.habit-row .habit-action')!.click();

    setFilter('active');
    expect(rowNames()).toEqual(['Gym']);
    expect(rowBadge(habitRow(0))).toBe('3');
  });

  it('shows 0 for a restored habit whose history ends before yesterday', () => {
    seedHabit({ archived: true, completions: [addDays(todayLocalDate(), -7)] });
    bootShell();
    setFilter('archived');

    document.querySelector<HTMLButtonElement>('.habit-row .habit-action')!.click();

    setFilter('active');
    expect(rowNames()).toEqual(['Gym']);
    expect(rowBadge(habitRow(0))).toBe('0');
  });
});
