import type { HealthData, ProgressCallback, Workout } from '../types';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

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
  };

  const workoutsByStart = new Map<string, Workout>();
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
      calories: parseFloat(get('totalEnergyBurned') || '') || null,
      distanceMi: null,
      distanceKm: null,
      elevationM: null,
    };
    data.workouts.push(workout);
    workoutsByStart.set(startDate, workout);
  }
  onProgress('workouts', 'done', data.workouts.length);
  await tick();

  // Distance & elevation
  onProgress('distance', 'active');
  await tick();
  const workoutBlockRegex =
    /<Workout\s[^>]*startDate="([^"]*)"[^>]*>([\s\S]*?)(?:<\/Workout>)/g;
  let blockMatch: RegExpExecArray | null;
  let distFound = 0;
  while ((blockMatch = workoutBlockRegex.exec(xml)) !== null) {
    const blockContent = blockMatch[2];
    const workout = workoutsByStart.get(blockMatch[1]);
    if (!workout) continue;

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

  // Step counts
  onProgress('steps', 'active');
  await tick();
  const stepRegex =
    /<Record type="HKQuantityTypeIdentifierStepCount"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"/g;
  let stepCount = 0;
  while ((match = stepRegex.exec(xml)) !== null) {
    data.stepCounts.push({
      date: new Date(match[1]),
      count: parseInt(match[2], 10),
    });
    stepCount++;
    if (stepCount % 50000 === 0) {
      onProgress('steps', 'active', stepCount);
      await tick();
    }
  }
  onProgress('steps', 'done', stepCount);
  await tick();

  // Sort
  onProgress('sort', 'active');
  await tick();
  data.heartRateSamples.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.restingHR.sort((a, b) => a.date.getTime() - b.date.getTime());
  data.workouts.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  data.vo2max.sort((a, b) => a.date.getTime() - b.date.getTime());
  onProgress('sort', 'done');
  await tick();

  return data;
}
