import { describe, expect, it, vi } from 'vitest';
import { parseHealthXml } from './parseHealthXml';

const noopProgress = vi.fn();

function wrapXml(records: string): string {
  return `<?xml version="1.0"?><HealthData>${records}</HealthData>`;
}

describe('parseHealthXml body mass', () => {
  it('parses body mass with startDate before value and unit', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" startDate="2026-01-15T08:00:00" value="175.5" unit="lb"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(1);
    expect(data.bodyMass[0].lbs).toBeCloseTo(175.5);
  });

  it('parses body mass with unit before value (different attribute order)', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" unit="kg" startDate="2026-01-15T08:00:00" value="80"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(1);
    expect(data.bodyMass[0].lbs).toBeCloseTo(80 * 2.20462);
  });

  it('parses body mass with value before startDate', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" value="160" unit="lb" startDate="2026-02-01T10:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(1);
    expect(data.bodyMass[0].lbs).toBeCloseTo(160);
    expect(data.bodyMass[0].date).toEqual(new Date('2026-02-01T10:00:00'));
  });

  it('converts kg to lbs', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" startDate="2026-01-15T08:00:00" value="70" unit="kg"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass[0].lbs).toBeCloseTo(70 * 2.20462);
  });

  it('skips records missing required attributes', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" unit="lb"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(0);
  });
});
