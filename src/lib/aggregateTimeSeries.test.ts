import { describe, expect, it } from 'vitest';
import { aggregateTimeSeries } from './aggregateTimeSeries';

function pt(dateStr: string, value: number) {
  return { date: new Date(dateStr + 'T00:00:00'), value };
}

describe('aggregateTimeSeries', () => {
  it('aggregates same-day points in day mode', () => {
    const data = [pt('2026-01-05', 10), pt('2026-01-05', 20), pt('2026-01-06', 30)];
    const result = aggregateTimeSeries(data, 'day');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(15); // avg of 10, 20
    expect(result[1].value).toBeCloseTo(30);
  });

  it('sums same-day points in day mode with sum reducer', () => {
    const data = [pt('2026-01-05', 1.5), pt('2026-01-05', 2.0), pt('2026-01-06', 3.0)];
    const result = aggregateTimeSeries(data, 'day', 'sum');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(3.5);
    expect(result[1].value).toBeCloseTo(3.0);
  });

  it('returns empty array unchanged', () => {
    expect(aggregateTimeSeries([], 'week')).toEqual([]);
    expect(aggregateTimeSeries([], 'month')).toEqual([]);
  });

  describe('week aggregation', () => {
    it('groups points in the same ISO week', () => {
      // 2026-01-05 is a Monday, 2026-01-09 is Friday — same week
      const data = [pt('2026-01-05', 10), pt('2026-01-07', 20), pt('2026-01-09', 30)];
      const result = aggregateTimeSeries(data, 'week');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(20);
      // Date should be the Monday
      expect(result[0].date.getDay()).toBe(1);
    });

    it('separates points in different weeks', () => {
      // Mon Jan 5 and Mon Jan 12 are different weeks
      const data = [pt('2026-01-05', 10), pt('2026-01-12', 30)];
      const result = aggregateTimeSeries(data, 'week');
      expect(result).toHaveLength(2);
      expect(result[0].value).toBeCloseTo(10);
      expect(result[1].value).toBeCloseTo(30);
    });

    it('handles Sunday correctly (groups with previous Monday)', () => {
      // 2026-01-11 is a Sunday, should group with Mon Jan 5 week
      const data = [pt('2026-01-05', 10), pt('2026-01-11', 20)];
      const result = aggregateTimeSeries(data, 'week');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(15);
    });
  });

  describe('month aggregation', () => {
    it('groups points in the same month', () => {
      const data = [pt('2026-03-01', 10), pt('2026-03-15', 20), pt('2026-03-28', 30)];
      const result = aggregateTimeSeries(data, 'month');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(20);
      // Date should be the 1st of the month
      expect(result[0].date.getDate()).toBe(1);
    });

    it('separates points in different months', () => {
      const data = [pt('2026-01-15', 10), pt('2026-02-15', 20), pt('2026-03-15', 30)];
      const result = aggregateTimeSeries(data, 'month');
      expect(result).toHaveLength(3);
      expect(result[0].value).toBeCloseTo(10);
      expect(result[1].value).toBeCloseTo(20);
      expect(result[2].value).toBeCloseTo(30);
    });

    it('returns sorted results', () => {
      const data = [pt('2026-03-10', 30), pt('2026-01-10', 10)];
      const result = aggregateTimeSeries(data, 'month');
      expect(result).toHaveLength(2);
      expect(result[0].date.getMonth()).toBe(0); // January
      expect(result[1].date.getMonth()).toBe(2); // March
    });
  });

  describe('sum reducer', () => {
    it('sums values instead of averaging for week mode', () => {
      const data = [pt('2026-01-05', 8000), pt('2026-01-07', 10000), pt('2026-01-09', 6000)];
      const result = aggregateTimeSeries(data, 'week', 'sum');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(24000);
    });

    it('sums values instead of averaging for month mode', () => {
      const data = [pt('2026-03-01', 500), pt('2026-03-15', 600), pt('2026-03-28', 400)];
      const result = aggregateTimeSeries(data, 'month', 'sum');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(1500);
    });

    it('defaults to avg when reducer is not specified', () => {
      const data = [pt('2026-01-05', 10), pt('2026-01-07', 20)];
      const result = aggregateTimeSeries(data, 'week');
      expect(result[0].value).toBeCloseTo(15);
    });
  });

  it('handles single data point', () => {
    const data = [pt('2026-06-15', 42)];
    const weekResult = aggregateTimeSeries(data, 'week');
    expect(weekResult).toHaveLength(1);
    expect(weekResult[0].value).toBeCloseTo(42);

    const monthResult = aggregateTimeSeries(data, 'month');
    expect(monthResult).toHaveLength(1);
    expect(monthResult[0].value).toBeCloseTo(42);
  });
});
