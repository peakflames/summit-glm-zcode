// Add-habit form (Epic AQNWtiB): wires the shell's "Add habit" input and Add
// button. Both clicking Add and pressing Enter in the input submit through the
// same path (TOR-02-XOoULU3, TOR-02-w9nrh1o). Validation errors are rendered
// inline next to the input — naming the problem AND the next action, per the
// error-message standard (TOR-02-flxKIoM, TOR-02-lMWubKc). Store-level
// failures (refused save) are delegated to the app's save-failure handler.

import { addHabit, MAX_HABIT_NAME_LENGTH } from '../lib/habits';
import type { AppState } from '../lib/storage';

export interface HabitFormCallbacks {
  // A habit was added and persisted — the callback receives the new state so
  // the caller can re-render from it.
  onChanged: (state: AppState) => void;
  // The store refused the mutation (quota / unreadable storage) — the app
  // renders the appropriate in-page message.
  onSaveFailed: () => void;
}

export function initHabitForm(callbacks: HabitFormCallbacks): void {
  const input = document.querySelector<HTMLInputElement>('#habit-name');
  const button = document.querySelector<HTMLButtonElement>('#add-habit');
  const formRoot = document.querySelector<HTMLElement>('.add-habit');

  if (!input || !button || !formRoot) {
    throw new Error('Add-habit form markup is missing required elements');
  }
  // Aliases narrowed by the guard above; closures below capture these as
  // non-null.
  const nameInput: HTMLInputElement = input;
  const addButton: HTMLButtonElement = button;
  const form: HTMLElement = formRoot;

  // The validation error element is created only when an error occurs and
  // removed when cleared — the shell must not carry a dormant [role="alert"]
  // element that recovery-banner selectors could mistake for a real alert.
  let errorEl: HTMLElement | null = null;

  function showError(message: string): void {
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      errorEl.setAttribute('role', 'alert');
      form.append(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearError(): void {
    errorEl?.remove();
    errorEl = null;
  }

  function submit(): void {
    const result = addHabit(nameInput.value);
    if (result.ok) {
      nameInput.value = '';
      clearError();
      callbacks.onChanged(result.state);
      return;
    }
    switch (result.reason) {
      case 'empty-name':
        showError(
          'Couldn\u2019t add your habit: the name is empty. Type a habit name first, then click Add.',
        );
        break;
      case 'name-too-long':
        showError(
          `Couldn\u2019t add your habit: the name is longer than ${MAX_HABIT_NAME_LENGTH} characters. Shorten the name and try again.`,
        );
        break;
      case 'quota-exceeded':
      case 'unreadable-storage':
      case 'unknown-habit':
        callbacks.onSaveFailed();
        break;
    }
  }

  addButton.addEventListener('click', submit);
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submit();
    }
  });
  // A new attempt starts clean: a stale validation error must not outlive the
  // input it was about.
  nameInput.addEventListener('input', clearError);
}
