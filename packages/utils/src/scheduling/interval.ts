import type { Interval } from './types';

/** True if two half-open intervals [aStart,aEnd) and [bStart,bEnd) overlap. */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

/**
 * Merge overlapping/adjacent intervals into a minimal sorted set.
 * Pure: does not mutate the input.
 */
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: Interval[] = [{ start: sorted[0]!.start, end: sorted[0]!.end }];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]!;
    const last = merged[merged.length - 1]!;
    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) {
        merged[merged.length - 1] = { start: last.start, end: current.end };
      }
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }
  return merged;
}

/** True if [start,end) overlaps any interval in the (unsorted) set. */
export function overlapsAny(start: Date, end: Date, intervals: readonly Interval[]): boolean {
  for (const interval of intervals) {
    if (intervalsOverlap(start, end, interval.start, interval.end)) {
      return true;
    }
  }
  return false;
}
