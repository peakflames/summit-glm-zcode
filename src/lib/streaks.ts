// Streak engine (Epic m1i25n4). Pure functions over local calendar date keys
// (YYYY-MM-DD) — no DOM, no storage, and no global clock read when `today` is
// passed explicitly, so every rule in PV §6 is unit-testable verbatim.
//
// Streak rule (normative, PV §6 / ConOps §8): the current streak is the count
// of consecutive completed local calendar days ending today if today is
// completed, otherwise ending yesterday, otherwise 0.

// Format a Date's LOCAL calendar fields as YYYY-MM-DD. Deliberately not
// toISOString(), which is UTC and would shift the day boundary for users far
// from UTC (TOR-03-albP5kN).
export function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLocalDate(): string {
  return localDateKey(new Date());
}

// Shift a YYYY-MM-DD key by n days (n may be negative). Parses to local
// midnight so the arithmetic follows the same calendar the key came from.
export function addDays(dateKey: string, n: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year!, month! - 1, day!);
  date.setDate(date.getDate() + n);
  return localDateKey(date);
}

// The PV §6 rule (TOR-04-cS2CaLm, TOR-04-ixZC5y3, TOR-04-Dzlhzul):
// consecutive completed days ending today when today is completed,
// otherwise ending yesterday, otherwise 0. A gap anywhere in the run
// ends the count.
export function currentStreak(completions: string[], today: string = todayLocalDate()): number {
  const done = new Set(completions);
  const anchor = done.has(today) ? today : addDays(today, -1);
  if (!done.has(anchor)) return 0;

  let streak = 0;
  let cursor = anchor;
  while (done.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
