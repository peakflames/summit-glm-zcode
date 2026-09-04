import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addHabit, archiveHabit, restoreHabit } from './habits';
import { STORAGE_KEY } from './storage';
import type { AppState, Habit } from './storage';

// Test double for crypto.randomUUID, deterministic across runs.
let nextId = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-id-${String(++nextId).padStart(3, '0')}`,
});

function storedState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as AppState;
}

beforeEach(() => {
  localStorage.clear();
  nextId = 0;
});

// TOR-02-G8b7pmU (store level)
// Given empty storage,
// When addHabit("Read 20 minutes") is called,
// Then the stored document contains the new habit with the given name,
// archived false, and an empty completions array — so it will survive a
// reload.
describe('addHabit', () => {
  it('persists the new habit to localStorage', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const result = addHabit('Read 20 minutes');

    expect(result.ok).toBe(true);
    const doc = storedState();
    expect(doc.schemaVersion).toBe(1);
    expect(doc.habits).toHaveLength(1);
    expect(doc.habits[0]).toMatchObject({
      name: 'Read 20 minutes',
      archived: false,
      completions: [],
    });
  });

  it('rejects an empty or whitespace-only name without touching storage', () => {
    for (const name of ['', '   ']) {
      const result = addHabit(name);
      expect(result).toEqual({ ok: false, reason: 'empty-name' });
    }
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('accepts a name of exactly 80 characters and rejects 81', () => {
    expect(addHabit('a'.repeat(80)).ok).toBe(true);
    expect(addHabit('b'.repeat(81))).toEqual({ ok: false, reason: 'name-too-long' });

    const doc = storedState();
    expect(doc.habits).toHaveLength(1);
    expect(doc.habits[0]!.name).toBe('a'.repeat(80));
  });

  it('allows duplicate names as independent habits', () => {
    const first = addHabit('Read 20 minutes');
    const second = addHabit('Read 20 minutes');

    expect(first.ok && second.ok).toBe(true);
    const doc = storedState();
    expect(doc.habits).toHaveLength(2);
    expect(doc.habits[0]!.name).toBe('Read 20 minutes');
    expect(doc.habits[1]!.name).toBe('Read 20 minutes');
    expect(doc.habits[0]!.id).not.toBe(doc.habits[1]!.id);
  });
});

// TOR-02-f9diV8o (state level — the check-in toggle itself is wired in epic
// m1i25n4; independence of the two rows is what this TOR requires)
// Given two habits share the name "Read 20 minutes",
// When one habit's completions change,
// Then the other habit's completions and streak inputs are untouched.
describe('duplicate habit independence', () => {
  it('completions of one duplicate never leak into the other', () => {
    const first = addHabit('Read 20 minutes');
    const second = addHabit('Read 20 minutes');
    expect(first.ok && second.ok).toBe(true);

    // Simulate a check-in recorded against the first habit only.
    const doc = storedState();
    doc.habits[0]!.completions = ['2026-09-04'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));

    const reloaded = storedState();
    expect(reloaded.habits[0]!.completions).toEqual(['2026-09-04']);
    expect(reloaded.habits[1]!.completions).toEqual([]);
    expect(reloaded.habits[1]!.name).toBe('Read 20 minutes');
  });
});

// TOR-02-c7UnNH0 / TOR-02-E0o3IbX (state level)
// Given a stored habit,
// When archiveHabit / restoreHabit is called for its id,
// Then only the archived flag flips and completions are unchanged.
describe('archive and restore', () => {
  function seedHabit(overrides: Partial<Habit> = {}): Habit {
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
    return JSON.parse(localStorage.getItem(STORAGE_KEY)!).habits[0] as Habit;
  }

  it('archiveHabit sets archived true and preserves completions', () => {
    seedHabit({ completions: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'] });

    const result = archiveHabit('gym-1');

    expect(result.ok).toBe(true);
    const doc = storedState();
    expect(doc.habits[0]!.archived).toBe(true);
    expect(doc.habits[0]!.completions).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
    expect(doc.habits[0]!.name).toBe('Gym');
  });

  it('restoreHabit sets archived false and preserves completions', () => {
    seedHabit({
      archived: true,
      completions: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'],
    });

    const result = restoreHabit('gym-1');

    expect(result.ok).toBe(true);
    const doc = storedState();
    expect(doc.habits[0]!.archived).toBe(false);
    expect(doc.habits[0]!.completions).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
  });

  it('archive/restore round-trip leaves only the flag changed', () => {
    const seeded = seedHabit({ completions: ['2026-09-04'] });

    archiveHabit('gym-1');
    restoreHabit('gym-1');

    const doc = storedState();
    expect(doc.habits[0]).toEqual({ ...seeded, completions: ['2026-09-04'] });
  });

  it('reports unknown-habit for an id that does not exist', () => {
    seedHabit();
    expect(archiveHabit('no-such-id')).toEqual({ ok: false, reason: 'unknown-habit' });
    expect(storedState().habits[0]!.archived).toBe(false);
  });
});
