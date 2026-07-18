import { describe, expect, it } from 'vitest';

import { intervalsOverlap, mergeIntervals, overlapsAny } from './interval';

const d = (iso: string): Date => new Date(iso);

describe('intervalsOverlap', () => {
  it('detects overlap', () => {
    expect(
      intervalsOverlap(
        d('2026-07-18T10:00:00Z'),
        d('2026-07-18T11:00:00Z'),
        d('2026-07-18T10:30:00Z'),
        d('2026-07-18T11:30:00Z'),
      ),
    ).toBe(true);
  });

  it('treats adjacency as non-overlap (half-open)', () => {
    expect(
      intervalsOverlap(
        d('2026-07-18T10:00:00Z'),
        d('2026-07-18T11:00:00Z'),
        d('2026-07-18T11:00:00Z'),
        d('2026-07-18T12:00:00Z'),
      ),
    ).toBe(false);
  });
});

describe('mergeIntervals', () => {
  it('returns [] for empty input', () => {
    expect(mergeIntervals([])).toEqual([]);
  });

  it('merges overlapping and adjacent intervals', () => {
    const merged = mergeIntervals([
      { start: d('2026-07-18T09:00:00Z'), end: d('2026-07-18T10:00:00Z') },
      { start: d('2026-07-18T09:30:00Z'), end: d('2026-07-18T11:00:00Z') },
      { start: d('2026-07-18T11:00:00Z'), end: d('2026-07-18T12:00:00Z') },
      { start: d('2026-07-18T13:00:00Z'), end: d('2026-07-18T14:00:00Z') },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0]!.start.toISOString()).toBe('2026-07-18T09:00:00.000Z');
    expect(merged[0]!.end.toISOString()).toBe('2026-07-18T12:00:00.000Z');
    expect(merged[1]!.start.toISOString()).toBe('2026-07-18T13:00:00.000Z');
  });
});

describe('overlapsAny', () => {
  const busy = [
    { start: d('2026-07-18T10:00:00Z'), end: d('2026-07-18T10:30:00Z') },
    { start: d('2026-07-18T14:00:00Z'), end: d('2026-07-18T15:00:00Z') },
  ];
  it('finds a conflict', () => {
    expect(overlapsAny(d('2026-07-18T10:15:00Z'), d('2026-07-18T10:45:00Z'), busy)).toBe(true);
  });
  it('passes a free window', () => {
    expect(overlapsAny(d('2026-07-18T11:00:00Z'), d('2026-07-18T11:30:00Z'), busy)).toBe(false);
  });
});
