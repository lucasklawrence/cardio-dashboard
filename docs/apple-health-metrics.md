# Apple Health Metrics — Expansion Plan

## Currently Extracted

The preprocessor (`scripts/preprocess_health.py`) pulls four data types from `export.xml`:

| Identifier | Compact key | Notes |
|---|---|---|
| `HKQuantityTypeIdentifierHeartRate` | `d`, `b` | Every HR sample with timestamp |
| `HKQuantityTypeIdentifierRestingHeartRate` | `d`, `b` | Daily resting HR |
| `HKQuantityTypeIdentifierVO2Max` | `d`, `v` | Periodic VO2max estimates |
| `Workout` elements | `t`, `dur`, `sd`, `ed`, `cal`, `dmi`, `dkm`, `elev`, `elevF` | Cardio workouts only (run/walk/stairs/cycle/swim/row/hike/elliptical) |

Within workout blocks we also extract `DistanceWalkingRunning`, `ElevationAscended`, and `FlightsClimbed` statistics.

---

## High-Priority Additions

### 1. Heart Rate Variability (HRV)
- **Identifier:** `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`
- **Unit:** ms
- **Why:** The single most actionable recovery metric. A rising HRV trend means the body is adapting to training load; a sudden drop flags overtraining or illness.
- **Dashboard use:** Daily HRV trend line, 7-day rolling average, correlation overlay with RHR.

### 2. Walking Heart Rate Average
- **Identifier:** `HKQuantityTypeIdentifierWalkingHeartRateAverage`
- **Unit:** count/min
- **Why:** Passive cardiovascular fitness signal — no workout required. A declining walking HR over months is strong evidence of improving aerobic base.
- **Dashboard use:** Trend chart alongside RHR for a two-signal fitness picture.

### 3. Sleep Analysis
- **Identifier:** `HKCategoryTypeIdentifierSleepAnalysis`
- **Record type:** `HKCategoryValueSleepAnalysis` with values `InBed`, `Asleep`, `Awake`, `AsleepCore`, `AsleepDeep`, `AsleepREM`
- **Why:** Sleep quality directly affects next-day HRV and recovery. Correlating sleep duration with workout performance closes the feedback loop.
- **Dashboard use:** Nightly duration bar chart, sleep stage breakdown (if Apple Watch data), next-day HR overlay.
- **Parsing note:** These are `<Record>` entries with `type="HKCategoryTypeIdentifierSleepAnalysis"` and a `value` attribute, not a numeric quantity. Need `startDate` and `endDate` to calculate duration.

### 4. Body Mass
- **Identifier:** `HKQuantityTypeIdentifierBodyMass`
- **Unit:** lb or kg (check `unit` attribute)
- **Why:** Weight trends contextualize pace and efficiency changes. A 5 lb drop explains a pace improvement better than "more training."
- **Dashboard use:** Weight trend line, optional BMI if height is available (`HKQuantityTypeIdentifierHeight`).

### 5. Active Energy Burned
- **Identifier:** `HKQuantityTypeIdentifierActiveEnergyBurned`
- **Unit:** kcal
- **Why:** Daily activity rings equivalent. Shows total daily energy expenditure beyond basal.
- **Dashboard use:** Daily bar chart, weekly totals, rolling average.

### 6. Apple Exercise Time
- **Identifier:** `HKQuantityTypeIdentifierAppleExerciseTime`
- **Unit:** min
- **Why:** Minutes above a brisk walk. Useful as a quick "did I move enough today" metric without drilling into individual workouts.
- **Dashboard use:** Daily bar, weekly sum, streak counter.

---

## Medium-Priority Additions

### 7. Respiratory Rate
- **Identifier:** `HKQuantityTypeIdentifierRespiratoryRate`
- **Unit:** count/min
- **Why:** Overnight respiratory rate trends correlate with illness onset 1-2 days before symptoms.
- **Dashboard use:** Nightly trend, anomaly highlighting.

### 8. Blood Oxygen Saturation (SpO2)
- **Identifier:** `HKQuantityTypeIdentifierOxygenSaturation`
- **Unit:** % (0-1 in the export, multiply by 100)
- **Why:** Useful for altitude training, sleep apnea detection, and general cardiorespiratory monitoring.
- **Dashboard use:** Nightly average trend, alert when below 95%.

### 9. Walking Speed & Step Length
- **Identifiers:** `HKQuantityTypeIdentifierWalkingSpeed`, `HKQuantityTypeIdentifierWalkingStepLength`
- **Units:** km/hr, cm
- **Why:** Gait metrics that track mobility and functional fitness, especially useful as longitudinal health markers.
- **Dashboard use:** Trend lines, correlation with walking workout pace.

### 10. Stair Speed (Ascent/Descent)
- **Identifiers:** `HKQuantityTypeIdentifierStairAscentSpeed`, `HKQuantityTypeIdentifierStairDescentSpeed`
- **Unit:** ft/min
- **Why:** Directly relevant to the stair-climbing activity tab. Tracks functional power improvement.
- **Dashboard use:** Trend chart on the Stairs tab, overlay with flights climbed.

### 11. Cardio Recovery (Heart Rate Recovery)
- **Identifier:** `HKQuantityTypeIdentifierHeartRateRecovery`
- **Unit:** count/min
- **Why:** How quickly HR drops after peak exertion. A higher recovery value means better cardiovascular fitness.
- **Dashboard use:** Per-workout recovery metric, trend over time.

---

## Implementation Approach

### Preprocessor changes (`scripts/preprocess_health.py`)
Each new identifier follows the same pattern already used for HR and VO2max:
1. Compile a regex for the `Record` type
2. Iterate matches, extract `startDate` and `value` (or `startDate`/`endDate` for sleep)
3. Append to a new compact array in the output JSON

The preprocessor is the bottleneck — it already scans the full XML, so adding more regexes is essentially free (single-pass matching). The output JSON will grow, but each metric adds only a few KB to a few hundred KB.

### Frontend changes
1. Extend `types.ts` with new sample types
2. Extend `parseHealthJson.ts` to hydrate the new arrays
3. Extend `parseHealthXml.ts` if we want the browser to parse these directly from XML
4. Add new chart components under `components/charts/`
5. Add new sections to `Dashboard.tsx`

### Phasing
- **Phase 1a (quick wins):** HRV, Walking HR Average, Body Mass — simple numeric records, same pattern as RHR
- **Phase 1b (moderate):** Active Energy, Exercise Minutes — daily aggregation needed
- **Phase 1c (complex):** Sleep Analysis — category records, duration calculation, stage breakdown
