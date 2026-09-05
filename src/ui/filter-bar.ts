// Three-segment filter control (Epic XDc5Tpp): All / Active / Archived.
// A radiogroup of segment buttons rather than a dropdown, so the current view
// is always visible and switching views is one click. The selected segment is
// marked with aria-checked and a class; the app re-renders the bar on every
// render, so selection state is always derived, never patched in place.
// Epic NZK8kqE adds the PeakFlames pf-tabs/pf-tab classes alongside the
// original names — pf-tab--active carries the ember gradient selection
// treatment (TOR-07-o4sphQD) and is always toggled together with is-selected.

export type FilterValue = 'all' | 'active' | 'archived';

export interface FilterBarCallbacks {
  onChange: (value: FilterValue) => void;
}

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export function renderFilterBar(
  root: HTMLElement,
  value: FilterValue,
  callbacks: FilterBarCallbacks,
): void {
  const bar = document.createElement('div');
  bar.className = 'filter-bar pf-tabs';
  bar.setAttribute('role', 'radiogroup');
  bar.setAttribute('aria-label', 'Filter habits by status');

  for (const option of FILTER_OPTIONS) {
    const segment = document.createElement('button');
    segment.type = 'button';
    segment.className = 'filter-segment pf-tab';
    segment.textContent = option.label;
    segment.dataset.filterValue = option.value;
    segment.setAttribute('role', 'radio');
    segment.setAttribute('aria-checked', String(option.value === value));
    segment.tabIndex = option.value === value ? 0 : -1;
    if (option.value === value) {
      segment.classList.add('is-selected', 'pf-tab--active');
    }
    segment.addEventListener('click', () => callbacks.onChange(option.value));
    bar.append(segment);
  }

  root.replaceChildren(bar);
}
