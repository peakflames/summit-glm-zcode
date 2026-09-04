import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  emptyState,
  loadState,
  saveState,
  STORAGE_KEY,
  updateState,
  type AppState,
  type Habit,
} from './storage';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Write tests',
    createdAt: '2026-09-04T08:15:00.000Z',
    archived: false,
    completions: [],
    ...overrides,
  };
}

function storedDocument(): unknown {
  const raw = localStorage.getItem(STORAGE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as unknown;
}

function seedStorage(document: unknown): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
}

// TOR-06-7l9Trjh
// Given a browser profile with no "summit.habits.v1" key,
// When the load path runs,
// Then the app receives a clean empty state — no throw, no console error.
describe('storage load path with absent key', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('absent key yields the empty state without throwing or logging', () => {
    localStorage.clear();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let result;
    expect(() => {
      result = loadState();
    }).not.toThrow();

    expect(result).toEqual({ status: 'ok', state: emptyState() });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

// TOR-06-anYR3mD
// Given at least one habit has been created,
// When the browser's localStorage is inspected,
// Then the key "summit.habits.v1" holds valid JSON with schemaVersion 1 and a
// habits array, and each element carries id, name, createdAt, archived, and
// completions.
describe('stored document schema', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('persists state under the single key as a v1 JSON document with a habits array', () => {
    localStorage.clear();
    const state: AppState = {
      schemaVersion: 1,
      habits: [makeHabit()],
    };

    expect(saveState(state)).toEqual({ ok: true });

    const doc = storedDocument() as Record<string, unknown>;
    expect(doc['schemaVersion']).toBe(1);
    expect(Array.isArray(doc['habits'])).toBe(true);

    const habit = (doc['habits'] as Record<string, unknown>[])[0]!;
    expect(Object.keys(habit)).toEqual(
      expect.arrayContaining(['id', 'name', 'createdAt', 'archived', 'completions']),
    );
    expect(habit['id']).toBe('h1');
    expect(habit['name']).toBe('Write tests');
    expect(habit['createdAt']).toBe('2026-09-04T08:15:00.000Z');
    expect(habit['archived']).toBe(false);
    expect(habit['completions']).toEqual([]);
  });
});

// TOR-06-OcAYtZQ
// Given Summit is open with existing habits,
// When the user performs each of: add a habit, toggle "Done today", archive a
// habit, restore a habit,
// Then after each individual action the stored document already reflects that
// change, without any reload or explicit save.
describe('write-through on every mutation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reflects each mutation in storage immediately: add, toggle, archive, restore', () => {
    localStorage.clear();
    seedStorage({ schemaVersion: 1, habits: [makeHabit()] });

    const addResult = updateState((s) => ({
      ...s,
      habits: [...s.habits, makeHabit({ id: 'h2', name: 'Read 20 minutes' })],
    }));
    expect(addResult.ok).toBe(true);
    // The stored document already reflects the add — no reload, no explicit save.
    expect((storedDocument() as { habits: { id: string }[] }).habits.map((h) => h.id)).toEqual([
      'h1',
      'h2',
    ]);

    const toggleResult = updateState((s) => ({
      ...s,
      habits: s.habits.map((h) =>
        h.id === 'h1' ? { ...h, completions: [...h.completions, '2026-09-04'] } : h,
      ),
    }));
    expect(toggleResult.ok).toBe(true);
    const afterToggle = storedDocument() as { habits: { id: string; completions: string[] }[] };
    expect(afterToggle.habits.find((h) => h.id === 'h1')!.completions).toEqual(['2026-09-04']);

    const archiveResult = updateState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === 'h2' ? { ...h, archived: true } : h)),
    }));
    expect(archiveResult.ok).toBe(true);
    const afterArchive = storedDocument() as { habits: { id: string; archived: boolean }[] };
    expect(afterArchive.habits.find((h) => h.id === 'h2')!.archived).toBe(true);

    const restoreResult = updateState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === 'h2' ? { ...h, archived: false } : h)),
    }));
    expect(restoreResult.ok).toBe(true);
    const afterRestore = storedDocument() as { habits: { id: string; archived: boolean }[] };
    expect(afterRestore.habits.find((h) => h.id === 'h2')!.archived).toBe(false);
  });
});

// TOR-06-OQbS0LR
// Given stored state contains one active habit with streak 2 and today checked,
// plus one archived habit,
// When the page is reloaded (boot hydrates from localStorage),
// Then the state carries both habits with archived flags and completions intact.
describe('hydration from localStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('hydrates habits, archived flags, and completions on boot', () => {
    localStorage.clear();
    const today = '2026-09-04';
    const yesterday = '2026-09-03';
    seedStorage({
      schemaVersion: 1,
      habits: [
        // Active habit with streak 2 (yesterday + today) and today checked.
        makeHabit({ completions: [yesterday, today] }),
        makeHabit({ id: 'h2', name: 'Read 20 minutes', archived: true }),
      ],
    });

    const result = loadState();

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const [active, archived] = result.state.habits;
    expect(active!.archived).toBe(false);
    expect(active!.completions).toEqual([yesterday, today]);
    expect(active!.completions).toContain(today);
    expect(archived!.archived).toBe(true);
  });
});

// TOR-06-PlcuFFf / TOR-06-CStJTf4
// Given the key contains invalid JSON — or otherwise-valid JSON with an
// unsupported schemaVersion —
// When the load path runs,
// Then the data is reported as unreadable (the UI shows the recovery banner)
// rather than silently rendering an empty state. v1 never rewrites a document
// it does not understand.
describe('unreadable stored data', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reports invalid JSON as unreadable', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = loadState();

    expect(result).toEqual({ status: 'unreadable', reason: 'invalid-json' });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('reports an unsupported schemaVersion as unreadable', () => {
    localStorage.clear();
    seedStorage({ schemaVersion: 99, habits: [] });

    const result = loadState();

    expect(result).toEqual({ status: 'unreadable', reason: 'unknown-schema-version' });
  });

  it('reports a structurally invalid document as unreadable', () => {
    localStorage.clear();
    seedStorage({ schemaVersion: 1, habits: [{ id: 42 }] });

    const result = loadState();

    expect(result).toEqual({ status: 'unreadable', reason: 'invalid-shape' });
  });

  it('mutations refuse to write over unreadable stored data', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, '{corrupted');

    const result = updateState((s) => s);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unreadable-storage');
    // The unreadable document was left untouched.
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{corrupted');
  });
});

// TOR-01-yNjDWrJ (store half): a refused save is surfaced to the caller so the
// UI can render it — never console-only.
describe('save failure surfacing', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reports a quota-exceeded save as a failure instead of throwing', () => {
    localStorage.clear();
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let result;
    expect(() => {
      result = saveState(emptyState());
    }).not.toThrow();

    expect(result).toEqual({ ok: false, reason: 'quota-exceeded' });
    expect(setItemSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });
});
