import { describe, expect, it } from 'vitest';
import { formatPace, formatShortDate, formatFullDate, toDateInputValue } from './format';

describe('formatPace', () => {
  it('returns em-dash for null', () => {
    expect(formatPace(null)).toBe('—');
  });

  it('returns em-dash for Infinity', () => {
    expect(formatPace(Infinity)).toBe('—');
  });

  it('formats whole minutes', () => {
    expect(formatPace(8.0)).toBe('8:00');
  });

  it('formats fractional minutes', () => {
    expect(formatPace(8.5)).toBe('8:30');
  });

  it('handles seconds overflow (7.999 → 8:00 not 7:60)', () => {
    expect(formatPace(7.999)).toBe('8:00');
  });

  it('formats fast pace', () => {
    expect(formatPace(5.25)).toBe('5:15');
  });
});

describe('formatShortDate', () => {
  it('formats date as "Mon DD"', () => {
    const d = new Date(2026, 0, 15);
    expect(formatShortDate(d)).toBe('Jan 15');
  });
});

describe('formatFullDate', () => {
  it('formats date as "Mon DD, YYYY"', () => {
    const d = new Date(2026, 3, 11);
    expect(formatFullDate(d)).toBe('Apr 11, 2026');
  });
});

describe('toDateInputValue', () => {
  it('returns empty string for null', () => {
    expect(toDateInputValue(null)).toBe('');
  });

  it('returns YYYY-MM-DD using local date', () => {
    const d = new Date(2026, 0, 5, 2, 0, 0);
    expect(toDateInputValue(d)).toBe('2026-01-05');
  });

  it('pads single-digit month and day', () => {
    const d = new Date(2026, 2, 3);
    expect(toDateInputValue(d)).toBe('2026-03-03');
  });
});
