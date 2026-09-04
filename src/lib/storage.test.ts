import { describe, expect, it, vi, afterEach } from 'vitest';
import { emptyState, readState, STORAGE_KEY } from './storage';

// TOR-06-7l9Trjh
// Given a browser profile with no "summit.habits.v1" key,
// When the read path runs,
// Then the app receives a clean empty state — no throw, no console error.
describe('storage read path with absent key', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('absent key yields the empty state without throwing or logging', () => {
    localStorage.clear();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let state;
    expect(() => {
      state = readState();
    }).not.toThrow();

    expect(state).toEqual(emptyState());
    expect(state!.habits).toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
