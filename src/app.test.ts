import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { renderApp } from './app';
import { STORAGE_KEY } from './lib/storage';
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
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });

    document.querySelector<HTMLButtonElement>('.error-banner-action')!.click();

    expect(setItemSpy).toHaveBeenCalled();
    const alert = document.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    const text = alert!.textContent ?? '';
    expect(text).toContain('storage is full');
    expect(text).toContain('Remove archived habits to free space');
  });
});
