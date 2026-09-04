import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initHabitForm } from './habit-form';
import { STORAGE_KEY } from '../lib/storage';
import type { AppState } from '../lib/storage';

// Deterministic ids across runs.
let nextId = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-id-${String(++nextId).padStart(3, '0')}`,
});

function fixture(): void {
  document.body.innerHTML = `
    <main class="shell">
      <section class="add-habit" aria-label="Add a habit">
        <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
        <button id="add-habit" type="button">Add</button>
      </section>
      <section class="error-region" id="error-region" aria-label="Messages"></section>
      <section class="filter" id="filter" aria-label="Filter habits"></section>
      <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
    </main>
  `;
}

interface Harness {
  input: HTMLInputElement;
  addButton: HTMLButtonElement;
  addedStates: AppState[];
  saveFailures: number;
}

function boot(): Harness {
  fixture();
  const addedStates: AppState[] = [];
  let saveFailures = 0;
  initHabitForm({
    onChanged: (state) => addedStates.push(state),
    onSaveFailed: () => {
      saveFailures += 1;
    },
  });
  return {
    input: document.querySelector<HTMLInputElement>('#habit-name')!,
    addButton: document.querySelector<HTMLButtonElement>('#add-habit')!,
    addedStates,
    get saveFailures() {
      return saveFailures;
    },
  };
}

function formError(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.form-error');
}

function storedHabits(): { name: string }[] {
  return (JSON.parse(localStorage.getItem(STORAGE_KEY)!) as AppState).habits;
}

beforeEach(() => {
  localStorage.clear();
  nextId = 0;
});

// TOR-02-XOoULU3 (submit path)
// Given the Active view is open,
// When the user types "Read 20 minutes" and clicks "Add",
// Then the habit is created and persisted, and the input is cleared.
describe('add-habit form', () => {
  it('clicking Add creates the habit and clears the input', () => {
    const ui = boot();
    ui.input.value = 'Read 20 minutes';

    ui.addButton.click();

    expect(ui.input.value).toBe('');
    expect(formError()).toBeNull();
    expect(ui.addedStates).toHaveLength(1);
    expect(storedHabits().map((h) => h.name)).toEqual(['Read 20 minutes']);
  });

  // TOR-02-w9nrh1o
  // Given "Meditate" typed into the input,
  // When Enter is pressed,
  // Then the outcome is identical to clicking Add.
  it('pressing Enter behaves identically to clicking Add', () => {
    const ui = boot();
    ui.input.value = 'Meditate';

    ui.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(ui.input.value).toBe('');
    expect(ui.addedStates).toHaveLength(1);
    expect(storedHabits().map((h) => h.name)).toEqual(['Meditate']);
  });

  it('a key other than Enter does not submit', () => {
    const ui = boot();
    ui.input.value = 'Meditate';

    ui.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(ui.addedStates).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // TOR-02-flxKIoM
  // Given the input contains only spaces or is empty,
  // When the user clicks "Add",
  // Then no habit row is created and an inline message states the name is
  // empty and prompts to type a habit name first.
  it('rejects an empty or whitespace-only name with an inline error', () => {
    for (const name of ['', '   ']) {
      const ui = boot();
      ui.input.value = name;

      ui.addButton.click();

      expect(ui.addedStates).toHaveLength(0);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(formError()).not.toBeNull();
      expect(formError()!.getAttribute('role')).toBe('alert');
      expect(formError()!.textContent).toContain('name is empty');
      expect(formError()!.textContent).toContain('Type a habit name first');
      expect(ui.input.value).toBe(name);
    }
  });

  // TOR-02-lMWubKc
  // Given the input is open,
  // When names of 80 and 81 characters are submitted,
  // Then 80 is added as a row-bearing habit and 81 shows an inline error
  // naming the 80-character limit and the next action (shorten the name).
  it('accepts 80 characters and rejects 81 with an inline length error', () => {
    const ui = boot();

    ui.input.value = 'a'.repeat(80);
    ui.addButton.click();
    expect(ui.addedStates).toHaveLength(1);
    expect(formError()).toBeNull();

    ui.input.value = 'b'.repeat(81);
    ui.addButton.click();
    expect(ui.addedStates).toHaveLength(1);
    expect(formError()).not.toBeNull();
    expect(formError()!.textContent).toContain('80 characters');
    expect(formError()!.textContent).toContain('Shorten the name');
    expect(storedHabits()).toHaveLength(1);
  });

  it('a new typing attempt clears a stale validation error', () => {
    const ui = boot();
    ui.input.value = '   ';
    ui.addButton.click();
    expect(formError()).not.toBeNull();

    ui.input.value = 'Run';
    ui.input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(formError()).toBeNull();
  });

  it('trimming happens before the length check and before storing', () => {
    const ui = boot();
    ui.input.value = `  ${'a'.repeat(80)}  `;

    ui.addButton.click();

    expect(ui.addedStates).toHaveLength(1);
    expect(storedHabits()[0]!.name).toBe('a'.repeat(80));
  });
});
