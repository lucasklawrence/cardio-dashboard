import { describe, expect, it } from 'vitest';
import { insertGapBreaks } from './chartUtils';

describe('insertGapBreaks', () => {
  it('returns points unchanged when no gaps exceed threshold', () => {
    const points = [
      { x: 1000, y: 10 },
      { x: 2000, y: 20 },
      { x: 3000, y: 30 },
    ];
    expect(insertGapBreaks(points)).toEqual(points);
  });

  it('inserts a null point at gaps exceeding 60 days', () => {
    const day = 24 * 60 * 60 * 1000;
    const points = [
      { x: 0, y: 10 },
      { x: 90 * day, y: 20 },
    ];
    const result = insertGapBreaks(points);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: 0, y: 10 });
    expect(result[1].y).toBeNull();
    expect(result[2]).toEqual({ x: 90 * day, y: 20 });
  });

  it('does not insert null when gap is exactly 60 days', () => {
    const day = 24 * 60 * 60 * 1000;
    const points = [
      { x: 0, y: 10 },
      { x: 60 * day, y: 20 },
    ];
    const result = insertGapBreaks(points);
    expect(result).toHaveLength(2);
  });

  it('handles multiple gaps', () => {
    const day = 24 * 60 * 60 * 1000;
    const points = [
      { x: 0, y: 10 },
      { x: 100 * day, y: 20 },
      { x: 110 * day, y: 25 },
      { x: 300 * day, y: 30 },
    ];
    const result = insertGapBreaks(points);
    expect(result).toHaveLength(6);
    expect(result[1].y).toBeNull();
    expect(result[4].y).toBeNull();
  });

  it('returns single point unchanged', () => {
    const points = [{ x: 1000, y: 10 }];
    expect(insertGapBreaks(points)).toEqual(points);
  });

  it('returns empty array unchanged', () => {
    expect(insertGapBreaks([])).toEqual([]);
  });
});
