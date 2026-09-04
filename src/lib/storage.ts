// Persistence read-path skeleton. Epic C1R8qkJ completes this module
// (write path, unreadable-data recovery banner, migrations).
//
// Storage layout per AGENTS.md: a single namespaced localStorage key holding a
// JSON document with a schemaVersion, so future migrations are possible.

export const STORAGE_KEY = 'summit.habits.v1';
export const SCHEMA_VERSION = 1;

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
}

export interface AppState {
  schemaVersion: number;
  habits: Habit[];
}

export function emptyState(): AppState {
  return { schemaVersion: SCHEMA_VERSION, habits: [] };
}

// Read-only for this epic: an absent key yields the empty state cleanly —
// no throw, no console error (TOR-06-7l9Trjh).
export function readState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return emptyState();
  }
  // Unreadable-data handling (corrupt JSON, unknown schemaVersion) is
  // Epic C1R8qkJ's recovery banner — not implemented yet.
  return emptyState();
}
