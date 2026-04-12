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

describe('parseHealthXml step counts', () => {
  it('aggregates multiple step records on the same day', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-15T08:00:00" value="3000"/>' +
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-15T14:00:00" value="5000"/>' +
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-15T19:00:00" value="2000"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.stepCounts).toHaveLength(1);
    expect(data.stepCounts[0].count).toBe(10000);
  });

  it('separates steps from different days', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-15T08:00:00" value="5000"/>' +
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-16T10:00:00" value="8000"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.stepCounts).toHaveLength(2);
    expect(data.stepCounts[0].count).toBe(5000);
    expect(data.stepCounts[1].count).toBe(8000);
  });

  it('skips records with invalid values', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierStepCount" startDate="2026-01-15T08:00:00" value="abc"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.stepCounts).toHaveLength(0);
  });
});

describe('parseHealthXml sleep', () => {
  it('parses asleep records and computes duration', async () => {
    const xml = wrapXml(
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepCore" startDate="2026-01-15T23:00:00" endDate="2026-01-16T02:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.sleep).toHaveLength(1);
    expect(data.sleep[0].hours).toBeCloseTo(3);
  });

  it('assigns early-morning sleep to previous night', async () => {
    const xml = wrapXml(
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepDeep" startDate="2026-01-16T01:00:00" endDate="2026-01-16T03:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.sleep).toHaveLength(1);
    // Started at 1am on Jan 16 → assigned to Jan 15 night
    expect(data.sleep[0].date.getDate()).toBe(15);
  });

  it('sums multiple sleep segments in one night', async () => {
    const xml = wrapXml(
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepCore" startDate="2026-01-15T23:00:00" endDate="2026-01-16T02:00:00"/>' +
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepREM" startDate="2026-01-16T02:00:00" endDate="2026-01-16T04:00:00"/>' +
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepDeep" startDate="2026-01-16T04:00:00" endDate="2026-01-16T06:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.sleep).toHaveLength(1);
    expect(data.sleep[0].hours).toBeCloseTo(7);
  });

  it('skips InBed and Awake records', async () => {
    const xml = wrapXml(
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisInBed" startDate="2026-01-15T22:00:00" endDate="2026-01-16T06:00:00"/>' +
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAwake" startDate="2026-01-16T03:00:00" endDate="2026-01-16T03:30:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.sleep).toHaveLength(0);
  });

  it('skips records with negative or excessive duration', async () => {
    const xml = wrapXml(
      '<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleep" startDate="2026-01-16T06:00:00" endDate="2026-01-15T23:00:00"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.sleep).toHaveLength(0);
  });
});

describe('parseHealthXml active energy', () => {
  it('aggregates multiple energy records on the same day', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierActiveEnergyBurned" startDate="2026-01-15T08:00:00" value="150.5"/>' +
      '<Record type="HKQuantityTypeIdentifierActiveEnergyBurned" startDate="2026-01-15T14:00:00" value="200.3"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.activeEnergy).toHaveLength(1);
    expect(data.activeEnergy[0].kcal).toBe(351);
  });

  it('separates energy from different days', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierActiveEnergyBurned" startDate="2026-01-15T08:00:00" value="400"/>' +
      '<Record type="HKQuantityTypeIdentifierActiveEnergyBurned" startDate="2026-01-16T10:00:00" value="350"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.activeEnergy).toHaveLength(2);
  });

  it('skips records with invalid values', async () => {
    const xml = wrapXml(
      '<Record type="HKQuantityTypeIdentifierActiveEnergyBurned" startDate="2026-01-15T08:00:00" value="abc"/>',
    );
    const data = await parseHealthXml(xml, noopProgress);
    expect(data.activeEnergy).toHaveLength(0);
  });
});
