import type { HealthData, ProgressCallback, Workout } from '../types';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Parse an Apple Health export.xml string into HealthData using regex-based streaming extraction. */
export async function parseHealthXml(
  xml: string,
  onProgress: ProgressCallback,
): Promise<HealthData> {
  const data: HealthData = {
    heartRateSamples: [],
    restingHR: [],
    workouts: [],
    stepCounts: [],
    vo2max: [],
    hrv: [],
    walkingHR: [],
    bodyMass: [],
    sleep: [],
    activeEnergy: [],
  };

  const workoutsByStart = new Map<string, Workout[]>();
  let match: RegExpExecArray | null;

  // Heart rate samples
  onProgress('hr', 'active');
  await tick();
  const hrRegex =
    /<Record type="HKQuantityTypeIdentifierHeartRate"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"/g;
  let hrCount = 0;
  while ((match = hrRegex.exec(xml)) !== null) {
    data.heartRateSamples.push({
      date: new Date(match[1]),
      bpm: parseFloat(match[2]),
    });
    hrCount++;
    if (hrCount % 50000 === 0) {
      onProgress('hr', 'active', hrCount);
      await tick();
    }
  }
  onProgress('hr', 'done', hrCount);
  await tick();

  // Resting heart rate
  onProgress('rhr', 'active');
  await tick();
  const rhrRegex =
    /<Record type="HKQuantityTypeIdentifierRestingHeartRate"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"/g;
  while ((match = rhrRegex.exec(xml)) !== null) {
    data.restingHR.push({
      date: new Date(match[1]),
      bpm: parseFloat(match[2]),
    });
  }
  onProgress('rhr', 'done', data.restingHR.length);
  await tick();

  // Workouts
  onProgress('workouts', 'active');
  await tick();
  const workoutRegex = /<Workout\s([^>]+)>/g;
  while ((match = workoutRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const get = (name: string): string | null => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1] : null;
    };

    const type = get('workoutActivityType');
    const startDate = get('startDate');
    const endDate = get('endDate');
    if (!type || !startDate || !endDate) continue;

    const workout: Workout = {
      type,
      duration: parseFloat(get('duration') || '0') || 0,
      durationUnit: get('durationUnit') || 'min',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      calories: get('totalEnergyBurned') != null ? parseFloat(get('totalEnergyBurned')!) : null,
      distanceMi: null,
      distanceKm: null,
      elevationM: null,
    };
    data.workouts.push(workout);
    const arr = workoutsByStart.get(startDate);
    if (arr) arr.push(workout);
    else workoutsByStart.set(startDate, [workout]);
  }
  onProgress('workouts', 'done', data.workouts.length);
  await tick();

  // Distance & elevation
  onProgress('distance', 'active');
  await tick();
  const workoutBlockRegex = /<Workout\s[^>]*startDate="([^"]*)"[^>]*>([\s\S]*?)(?:<\/Workout>)/g;
  let blockMatch: RegExpExecArray | null;
  let distFound = 0;
  while ((blockMatch = workoutBlockRegex.exec(xml)) !== null) {
    const blockContent = blockMatch[2];
    const matches = workoutsByStart.get(blockMatch[1]);
    if (!matches || matches.length === 0) continue;
    const workout = matches.shift()!;

    const distMatch = blockContent.match(
      /type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*sum="([^"]*)"/,
    );
    if (distMatch) {
      const distVal = parseFloat(distMatch[1]);
      const unitMatch = blockContent.match(
        /type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*unit="([^"]*)"/,
      );
      const unit = unitMatch ? unitMatch[1] : 'km';
      if (unit === 'mi') {
        workout.distanceMi = distVal;
        workout.distanceKm = distVal * 1.60934;
      } else {
        workout.distanceKm = distVal;
        workout.distanceMi = distVal / 1.60934;
      }
      distFound++;
    }

    const elevMatch = blockContent.match(
      /type="HKQuantityTypeIdentifierFlightsClimbed"[^>]*sum="([^"]*)"/,
    );
    if (elevMatch) workout.elevationFlights = parseFloat(elevMatch[1]);

    const elevMMatch = blockContent.match(
      /type="HKQuantityTypeIdentifierElevationAscended"[^>]*sum="([^"]*)"/,
    );
    if (elevMMatch) workout.elevationM = parseFloat(elevMMatch[1]);
  }
  onProgress('distance', 'done', `${distFound} with GPS`);
  await tick();

  // VO2max
  onProgress('vo2', 'active');
  await tick();
  const vo2Regex =
    /<Record type="HKQuantityTypeIdentifierVO2Max"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"/g;
  while ((match = vo2Regex.exec(xml)) !== null) {
    data.vo2max.push({
      date: new Date(match[1]),
      value: parseFloat(match[2]),
    });
  }
  onProgress('vo2', 'done', data.vo2max.length);
  await tick();

  // HRV (SDNN)
  onProgress('hrv', 'active');
  await tick();
  const hrvRegex = /<Record\b[^>]*type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"[^>]*>/g;
  while ((match = hrvRegex.exec(xml)) !== null) {
    const record = match[0];
    const dateM = record.match(/\bstartDate="([^"]*)"/);
    const valueM = record.match(/\bvalue="([^"]*)"/);
    if (!dateM || !valueM) continue;
    const date = new Date(dateM[1]);
    const value = parseFloat(valueM[1]);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(value)) continue;
    data.hrv.push({ date, value });
  }
  onProgress('hrv', 'done', data.hrv.length);
  await tick();

  // Walking heart rate average
  onProgress('walkhr', 'active');
  await tick();
  const walkHrRegex = /<Record\b[^>]*type="HKQuantityTypeIdentifierWalkingHeartRateAverage"[^>]*>/g;
  while ((match = walkHrRegex.exec(xml)) !== null) {
    const record = match[0];
    const dateM = record.match(/\bstartDate="([^"]*)"/);
    const valueM = record.match(/\bvalue="([^"]*)"/);
    if (!dateM || !valueM) continue;
    const date = new Date(dateM[1]);
    const bpm = parseFloat(valueM[1]);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(bpm)) continue;
    data.walkingHR.push({ date, bpm });
  }
  onProgress('walkhr', 'done', data.walkingHR.length);
  await tick();

  // Body mass
  onProgress('mass', 'active');
  await tick();
  const massRegex = /<Record type="HKQuantityTypeIdentifierBodyMass"\s([^>]+)/g;
  while ((match = massRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const dateM = attrs.match(/startDate="([^"]*)"/);
    const valM = attrs.match(/value="([^"]*)"/);
    const unitM = attrs.match(/unit="([^"]*)"/);
    if (!dateM || !valM) continue;
    const val = parseFloat(valM[1]);
    const date = new Date(dateM[1]);
    if (!Number.isFinite(val) || Number.isNaN(date.getTime())) continue;

    const unit = unitM ? unitM[1] : 'lb';
    const lbs = unit === 'lb' ? val : unit === 'kg' ? val * 2.20462 : NaN;
    if (!Number.isFinite(lbs)) continue;

    data.bodyMass.push({ date, lbs });
  }
  onProgress('mass', 'done', data.bodyMass.length);
  await tick();

  // Step counts (aggregate to daily totals)
  onProgress('steps', 'active');
  await tick();
  const stepRegex = /<Record\b[^>]*type="HKQuantityTypeIdentifierStepCount"[^>]*>/g;
  const stepsByDay = new Map<string, number>();
  let stepCount = 0;
  while ((match = stepRegex.exec(xml)) !== null) {
    const record = match[0];
    const dateM = record.match(/\bstartDate="([^"]*)"/);
    const valueM = record.match(/\bvalue="([^"]*)"/);
    if (!dateM || !valueM) continue;
    const date = new Date(dateM[1]);
    const count = Number(valueM[1]);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(count) || count < 0) continue;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    stepsByDay.set(dayKey, (stepsByDay.get(dayKey) || 0) + count);
    stepCount++;
    if (stepCount % 50000 === 0) {
      onProgress('steps', 'active', stepCount);
      await tick();
    }
  }
  for (const [dayKey, total] of stepsByDay) {
    data.stepCounts.push({ date: new Date(dayKey + 'T00:00:00'), count: total });
  }
  onProgress('steps', 'done', `${stepsByDay.size} days`);
  await tick();

  // Sleep analysis
  onProgress('sleep', 'active');
  await tick();
  const sleepRegex = /<Record\b[^>]*type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*>/g;
  const SLEEP_STAGES = new Set(['AsleepCore', 'AsleepDeep', 'AsleepREM', 'Asleep']);
  const sleepByNight = new Map<string, number>();
  while ((match = sleepRegex.exec(xml)) !== null) {
    const record = match[0];
    const valueM = record.match(/\bvalue="(?:HKCategoryValueSleepAnalysis)?(\w+)"/);
    if (!valueM || !SLEEP_STAGES.has(valueM[1])) continue;
    const startM = record.match(/\bstartDate="([^"]*)"/);
    const endM = record.match(/\bendDate="([^"]*)"/);
    if (!startM || !endM) continue;
    const start = new Date(startM[1]);
    const end = new Date(endM[1]);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    const hours = (end.getTime() - start.getTime()) / 3_600_000;
    if (hours <= 0 || hours > 24) continue;
    // Assign to "night": if sleep starts before noon, count as previous day's night
    const night = new Date(start);
    if (night.getHours() < 12) night.setDate(night.getDate() - 1);
    const nightKey = `${night.getFullYear()}-${String(night.getMonth() + 1).padStart(2, '0')}-${String(night.getDate()).padStart(2, '0')}`;
    sleepByNight.set(nightKey, (sleepByNight.get(nightKey) || 0) + hours);
  }
  for (const [nightKey, hours] of sleepByNight) {
    data.sleep.push({
      date: new Date(nightKey + 'T00:00:00'),
      hours: Math.round(hours * 100) / 100,
    });
  }
  onProgress('sleep', 'done', `${sleepByNight.size} nights`);
  await tick();

  // Active energy burned (aggregate to daily totals)
  onProgress('energy', 'active');
  await tick();
  const energyRegex = /<Record\b[^>]*type="HKQuantityTypeIdentifierActiveEnergyBurned"[^>]*>/g;
  const energyByDay = new Map<string, number>();
  let energyCount = 0;
  while ((match = energyRegex.exec(xml)) !== null) {
    const record = match[0];
    const dateM = record.match(/\bstartDate="([^"]*)"/);
    const valueM = record.match(/\bvalue="([^"]*)"/);
    if (!dateM || !valueM) continue;
    const date = new Date(dateM[1]);
    const kcal = parseFloat(valueM[1]);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(kcal)) continue;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    energyByDay.set(dayKey, (energyByDay.get(dayKey) || 0) + kcal);
    energyCount++;
    if (energyCount % 50000 === 0) {
      onProgress('energy', 'active', energyCount);
      await tick();
    }
  }
  for (const [dayKey, total] of energyByDay) {
    data.activeEnergy.push({ date: new Date(dayKey + 'T00:00:00'), kcal: Math.round(total) });
  }
  onProgress('energy', 'done', `${energyByDay.size} days`);
  await tick();

  // Sort
  onProgress('sort', 'active');
  await tick();
  data.heartRateSamples.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.restingHR.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.workouts.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  data.vo2max.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.hrv.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.walkingHR.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.bodyMass.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.stepCounts.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.sleep.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.activeEnergy.sort((a, b) => a.date.getTime() - b.date.getTime());
  onProgress('sort', 'done');
  await tick();

  return data;
}
