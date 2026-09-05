// In-page message banners (Epic C1R8qkJ). User-facing errors are rendered in
// the page — naming the problem AND the next action — never console-only
// (TOR-01-yNjDWrJ). The recovery banner is the unreadable-data path
// (TOR-06-PlcuFFf, TOR-06-CStJTf4); showInlineError covers transient failures
// such as a refused save.

import type { UnreadableReason } from '../lib/storage';

const RECOVERY_PROBLEM: Record<UnreadableReason, string> = {
  'invalid-json': 'Summit couldn\u2019t read your saved data \u2014 it appears to be corrupted.',
  'unknown-schema-version':
    'Your saved data was written by a newer version of Summit, which this version can\u2019t read.',
  'invalid-shape': 'Summit couldn\u2019t read your saved data \u2014 it isn\u2019t in a recognized format.',
};

const RECOVERY_ACTION = 'Choose \u201CStart fresh\u201D below to reset Summit to an empty tracker.';

// Renders the unreadable-data recovery banner: names the problem and offers a
// "Start fresh" action. Call onReset when the user chooses it.
export function showRecoveryBanner(
  root: HTMLElement,
  options: { reason: UnreadableReason; onReset: () => void },
): void {
  const banner = document.createElement('div');
  // pf-alert / pf-alert--danger (Epic NZK8kqE) supply the PeakFlames surface;
  // the original class names stay for the tests and selectors.
  banner.className = 'error-banner error-banner--recovery pf-alert pf-alert--danger';
  banner.setAttribute('role', 'alert');

  const message = document.createElement('p');
  message.className = 'error-banner-message';
  message.textContent = `${RECOVERY_PROBLEM[options.reason]} ${RECOVERY_ACTION}`;
  banner.append(message);

  const resetButton = document.createElement('button');
  resetButton.className = 'error-banner-action pf-btn pf-btn--secondary pf-btn--sm';
  resetButton.type = 'button';
  resetButton.textContent = 'Start fresh';
  resetButton.addEventListener('click', options.onReset);
  banner.append(resetButton);

  root.replaceChildren(banner);
}

// Renders a problem + next-action message for failures that do not offer a
// reset (e.g. a save refused because storage is full).
export function showInlineError(root: HTMLElement, message: string): void {
  const banner = document.createElement('div');
  banner.className = 'error-banner error-banner--inline pf-alert pf-alert--danger';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.className = 'error-banner-message';
  text.textContent = message;
  banner.append(text);

  root.replaceChildren(banner);
}

export function dismissBanner(root: HTMLElement): void {
  root.replaceChildren();
}
