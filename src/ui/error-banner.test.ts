import { describe, expect, it } from 'vitest';
import { dismissBanner, showInlineError, showRecoveryBanner } from './error-banner';

function messageRoot(): HTMLElement {
  const root = document.createElement('section');
  root.id = 'error-region';
  document.body.append(root);
  return root;
}

// TOR-06-PlcuFFf / TOR-06-CStJTf4 (component half)
// Given unreadable saved data,
// When the recovery banner is shown,
// Then an in-page banner names the problem, offers "Start fresh", and is
// readable without opening developer tools.
describe('recovery banner', () => {
  it('renders an in-page alert naming the problem and offering Start fresh', () => {
    const root = messageRoot();

    showRecoveryBanner(root, { reason: 'invalid-json', onReset: () => {} });

    const banner = root.querySelector('.error-banner');
    expect(banner).not.toBeNull();
    expect(banner!.getAttribute('role')).toBe('alert');

    const text = banner!.textContent ?? '';
    expect(text).toContain('couldn\u2019t read your saved data');
    expect(text).toContain('Start fresh');

    const button = root.querySelector<HTMLButtonElement>('.error-banner-action');
    expect(button?.textContent).toBe('Start fresh');
  });

  it('names a newer-version document as the problem for an unknown schemaVersion', () => {
    const root = messageRoot();

    showRecoveryBanner(root, { reason: 'unknown-schema-version', onReset: () => {} });

    const text = root.querySelector('.error-banner')?.textContent ?? '';
    expect(text).toContain('newer version of Summit');
    expect(text).toContain('Start fresh');
  });

  it('invokes onReset when Start fresh is clicked', () => {
    const root = messageRoot();
    let reset = false;

    showRecoveryBanner(root, { reason: 'invalid-json', onReset: () => (reset = true) });
    root.querySelector<HTMLButtonElement>('.error-banner-action')!.click();

    expect(reset).toBe(true);
  });
});

// TOR-06-I9rZxQC (component half) — dismissing the banner clears the region.
describe('banner dismissal', () => {
  it('dismiss removes the banner from the page', () => {
    const root = messageRoot();
    showRecoveryBanner(root, { reason: 'invalid-json', onReset: () => {} });

    dismissBanner(root);

    expect(root.querySelector('.error-banner')).toBeNull();
    expect(root.textContent).toBe('');
  });
});

// TOR-01-yNjDWrJ (component half)
// Given an action the user attempted has failed,
// When the failure is surfaced,
// Then an inline message visible in the page names what went wrong and what to
// do next — readable without opening developer tools.
describe('inline error message', () => {
  it('renders a visible in-page alert carrying the problem and next action', () => {
    const root = messageRoot();

    showInlineError(
      root,
      'Couldn\u2019t save your changes: browser storage is full. Remove archived habits to free space.',
    );

    const banner = root.querySelector('.error-banner');
    expect(banner).not.toBeNull();
    expect(banner!.getAttribute('role')).toBe('alert');
    const text = banner!.textContent ?? '';
    expect(text).toContain('browser storage is full');
    expect(text).toContain('Remove archived habits to free space');
  });
});
