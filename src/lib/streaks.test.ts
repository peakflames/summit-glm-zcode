import { describe, expect, it } from 'vitest';
import { addDays, currentStreak, localDateKey, todayLocalDate } from './streaks';

const TODAY = '2026-09-04';

function daysAgo(n: number): string {
  return addDays(TODAY, -n);
}

// TOR-04-cS2CaLm (pure engine level)
// Given habits with the feature file's completion-history data table,
// When currentStreak computes over each history,
// Then each result matches the expected streak — a gap resets the run.
describe('currentStreak', () => {
  it.each([
    { table: 'today', expected: 1 },
    { table: 'today, -1', expected: 2 },
    { table: 'today, -1, -2, -3', expected: 4 },
    { table: 'today, -1, -3, -4', expected: 2 },
  ])('rule table: [$table] → $expected', ({ table, expected }) => {
    const offsets = table.split(', ').map((token) => (token === 'today' ? 0 : Number(token)));
    const completions = offsets.map((offset) => addDays(TODAY, offset));
    expect(currentStreak(completions, TODAY)).toBe(expected);
  });

  // TOR-04-ixZC5y3 (pure engine level)
  // Given the most recent completions end yesterday consecutively and today
  // is not completed,
  // Then the streak is the count ending yesterday — visible, not reset.
  it('keeps the yesterday-anchored streak visible when today is not yet completed', () => {
    const completions = [daysAgo(1), daysAgo(2), daysAgo(3)];
    expect(currentStreak(completions, TODAY)).toBe(3);
  });

  // TOR-04-Dzlhzul (pure engine level)
  // Given the most recent completion is two or more days ago (or history is
  // empty), Then the streak reads 0.
  it('shows 0 when neither today nor yesterday is completed', () => {
    expect(currentStreak([daysAgo(2)], TODAY)).toBe(0);
    expect(currentStreak([daysAgo(5), daysAgo(9)], TODAY)).toBe(0);
    expect(currentStreak([], TODAY)).toBe(0);
  });

  it('counts each completed day at most once regardless of duplicates in input', () => {
    expect(currentStreak([TODAY, TODAY, daysAgo(1)], TODAY)).toBe(2);
  });
});

// TOR-03-albP5kN (pure engine level)
// Given a local wall-clock time of 2026-09-04 23:30,
// Then localDateKey yields the LOCAL calendar date "2026-09-04" — never the
// UTC date the instant may map to.
describe('localDateKey', () => {
  it('formats local fields as YYYY-MM-DD, not the UTC date', () => {
    const lateEvening = new Date(2026, 8, 4, 23, 30);
    expect(lateEvening.getFullYear()).toBe(2026);
    expect(lateEvening.getDate()).toBe(4);
    expect(localDateKey(lateEvening)).toBe('2026-09-04');
  });

  it('pads single-digit months and days', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('todayLocalDate() formats the current local date', () => {
    expect(todayLocalDate()).toBe(localDateKey(new Date()));
  });
});

describe('addDays', () => {
  it('rolls back across month boundaries', () => {
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31');
  });

  it('rolls forward across year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
