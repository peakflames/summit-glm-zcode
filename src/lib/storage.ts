// Persistence layer (Epic C1R8qkJ): the whole app state lives under a single
// namespaced localStorage key holding one JSON document with a schemaVersion.
// Every mutation goes through updateState/saveState and is written immediately
// — there is no save button and no delay. Unreadable stored data (corrupt JSON,
// unknown schemaVersion, wrong shape) is a first-class boot state the app
// recovers from via the "Start fresh" banner; v1 never rewrites a document it
// does not understand.

import { log } from './logger';
import type { AppState, Habit } from './types';

export type { AppState, Habit } from './types';

export const STORAGE_KEY = 'summit.habits.v1';
export const SCHEMA_VERSION = 1;

export function emptyState(): AppState {
  return { schemaVersion: SCHEMA_VERSION, habits: [] };
}

export type UnreadableReason =
  | 'invalid-json'
  | 'unknown-schema-version'
  | 'invalid-shape';

export type LoadResult =
  | { status: 'ok'; state: AppState }
  | { status: 'unreadable'; reason: UnreadableReason };

export type SaveResult = { ok: true } | { ok: false; reason: 'quota-exceeded' };

export type UpdateResult =
  | { ok: true; state: AppState }
  | { ok: false; reason: 'quota-exceeded' | 'unreadable-storage'; state: AppState };

// An absent key is a clean first run — no throw, no console error
// (TOR-06-7l9Trjh). Anything present but not understandable is reported as
// unreadable instead of silently rendering an empty state (TOR-06-PlcuFFf,
// TOR-06-CStJTf4).
export function loadState(): LoadResult {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return { status: 'ok', state: emptyState() };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    log.warn(`Saved data under "${STORAGE_KEY}" is not valid JSON — recovery required`);
    return { status: 'unreadable', reason: 'invalid-json' };
  }

  if (!isRecord(parsed)) {
    return { status: 'unreadable', reason: 'invalid-shape' };
  }

  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    log.warn(
      `Saved data under "${STORAGE_KEY}" has unsupported schemaVersion ${String(parsed.schemaVersion)} — recovery required`,
    );
    return { status: 'unreadable', reason: 'unknown-schema-version' };
  }

  if (!Array.isArray(parsed.habits) || !parsed.habits.every(isValidHabit)) {
    return { status: 'unreadable', reason: 'invalid-shape' };
  }

  return { status: 'ok', state: parsed as unknown as AppState };
}

// Write the whole document immediately. setItem failures (quota, blocked
// storage) are surfaced to the caller so the UI can render them per the error
// message standard — never console-only.
export function saveState(state: AppState): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    log.error(`Couldn't save: ${error instanceof Error ? error.message : String(error)}`);
    return { ok: false, reason: 'quota-exceeded' };
  }
}

// Canonical mutation path: load → mutate → save immediately (TOR-06-OcAYtZQ).
// Refuses to write when the stored document is unreadable — v1 must never
// overwrite a document it does not understand (TOR-06-CStJTf4 note); recovery
// ("Start fresh") has to happen first.
export function updateState(mutate: (state: AppState) => AppState): UpdateResult {
  const loaded = loadState();
  if (loaded.status === 'unreadable') {
    log.warn('Mutation skipped: saved data is unreadable — recovery required first');
    return { ok: false, reason: 'unreadable-storage', state: emptyState() };
  }

  const next = mutate(loaded.state);
  const saved = saveState(next);
  if (!saved.ok) {
    return { ok: false, reason: saved.reason, state: next };
  }
  return { ok: true, state: next };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidHabit(value: unknown): value is Habit {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.archived === 'boolean' &&
    Array.isArray(value.completions) &&
    value.completions.every((d) => typeof d === 'string')
  );
}
