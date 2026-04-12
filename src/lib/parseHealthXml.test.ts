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

  it('skips records with unknown unit', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" startDate="2026-01-15T08:00:00" value="100" unit="st"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(0);
  });

  it('skips records with invalid value', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierBodyMass" startDate="2026-01-15T08:00:00" value="abc" unit="lb"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.bodyMass).toHaveLength(0);
  });
});

describe('parseHealthXml HRV', () => {
  it('parses HRV with standard attribute order', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN" startDate="2026-01-15T08:00:00" value="42.5"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.hrv).toHaveLength(1);
    expect(data.hrv[0].value).toBeCloseTo(42.5);
  });

  it('parses HRV with value before startDate (different attribute order)', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN" value="55" startDate="2026-02-01T10:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.hrv).toHaveLength(1);
    expect(data.hrv[0].value).toBeCloseTo(55);
    expect(data.hrv[0].date).toEqual(new Date('2026-02-01T10:00:00'));
  });

  it('skips HRV with invalid numeric value', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN" startDate="2026-02-01T10:00:00" value="abc"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.hrv).toHaveLength(0);
  });

  it('skips HRV with invalid startDate', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN" startDate="not-a-date" value="42"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.hrv).toHaveLength(0);
  });
});

describe('parseHealthXml walking HR', () => {
  it('parses walking HR with standard attribute order', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierWalkingHeartRateAverage" startDate="2026-01-15T08:00:00" value="105.3"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.walkingHR).toHaveLength(1);
    expect(data.walkingHR[0].bpm).toBeCloseTo(105.3);
  });

  it('parses walking HR with value before startDate (different attribute order)', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierWalkingHeartRateAverage" value="98" startDate="2026-03-10T12:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.walkingHR).toHaveLength(1);
    expect(data.walkingHR[0].bpm).toBeCloseTo(98);
    expect(data.walkingHR[0].date).toEqual(new Date('2026-03-10T12:00:00'));
  });

  it('skips walking HR with invalid numeric value', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierWalkingHeartRateAverage" startDate="2026-03-10T12:00:00" value="NaN"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.walkingHR).toHaveLength(0);
  });

  it('skips walking HR with invalid startDate', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierWalkingHeartRateAverage" startDate="bad-date" value="98"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.walkingHR).toHaveLength(0);
  });
});
