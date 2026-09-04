import { beforeEach, describe, expect, it } from 'vitest';
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
    document.body.innerHTML = '';
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;
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
