// Stored-document types for Summit's persistence layer (Epic C1R8qkJ).
// The whole app state serializes to one JSON document under the single
// localStorage key "summit.habits.v1" with a schemaVersion, so future
// migrations are possible.

export interface Habit {
  id: string;
  name: string;
  // ISO instant of creation, e.g. "2026-09-04T08:15:00.000Z".
  createdAt: string;
  archived: boolean;
  // Local calendar dates (YYYY-MM-DD) on which the habit was completed,
  // e.g. "2026-09-04". At most one entry per local calendar day.
  completions: string[];
}

export interface AppState {
  schemaVersion: number;
  habits: Habit[];
}
