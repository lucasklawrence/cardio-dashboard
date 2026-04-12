# Goals & Chart Enhancements

## Overview

Let users set fitness targets, track progress, and compare performance across time periods. This phase turns the dashboard from a passive data viewer into an active training companion.

---

## 1. Goal Lines on Charts

### Concept
Horizontal reference lines on key charts representing user-defined targets:
- **RHR goal** — e.g., "get resting HR below 55 bpm"
- **VO2max goal** — e.g., "reach 45 mL/kg/min"
- **Pace goal** — e.g., "run a sub-8:00 mile"
- **Weekly volume goal** — e.g., "4 hours of cardio per week"

### Implementation
- Chart.js annotation plugin (`chartjs-plugin-annotation`) draws horizontal lines with labels
- Goals stored in localStorage initially, migrated to Supabase in Phase 4
- A small "Set Goal" button on each chart opens an inline input
- Goal line rendered as a dashed line in a neutral color (white at 30% opacity) with the target value as a label

### Chart.js Config Addition
```js
plugins: {
  annotation: {
    annotations: {
      goalLine: {
        type: 'line',
        yMin: goalValue,
        yMax: goalValue,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderDash: [6, 4],
        borderWidth: 1,
        label: {
          content: `Goal: ${goalValue}`,
          display: true,
          position: 'end',
          font: { family: 'DM Mono', size: 10 }
        }
      }
    }
  }
}
```

---

## 2. Weekly / Monthly Aggregation Toggle

### Concept
All time-series charts currently plot raw data points. Add a toggle to aggregate into weekly or monthly averages, making long-term trends visible without noise.

### Behavior
- **Raw (default):** Every data point plotted — current behavior
- **Weekly:** Average value per ISO week, plotted at the Monday of each week
- **Monthly:** Average value per calendar month, plotted at the 1st

### Implementation
- Aggregation is a pure `lib/` function: `aggregateTimeSeries(data, 'week' | 'month')`
- Toggle UI: three text buttons (Day / Week / Month) styled like the date presets
- Applied to: RHR, VO2max, HRV (when added), Walking HR (when added)
- Session-level charts (pace, efficiency) aggregate by taking the mean of all sessions in the period

---

## 3. Personal Bests Tracking

### Concept
Automatically detect and surface personal records:
- Fastest pace (per activity type)
- Longest session (per activity type)
- Lowest resting HR
- Highest VO2max
- Most flights climbed in a single session

### Display
- A "Personal Bests" section between StatsGrid and the charts
- Each PB shows: the value, the date achieved, and how current performance compares
- Highlight with a small badge/icon when a recent session sets a new PB

### Implementation
- Compute PBs from the full (unfiltered) dataset on load
- Compare filtered sessions against PBs to detect new records
- Store as derived state in context (not persisted — computed fresh each load)

---

## 4. Historical Comparison

### Concept
Compare the current date range against a previous period of equal length:
- "This month vs. last month"
- "This quarter vs. last quarter"
- Show delta arrows (up/down) and percentage change on stat cards

### Implementation
- When a date range is active, compute a "previous period" of equal length ending where the current range starts
- In StatsGrid, show the comparison value and a delta indicator
- Color the delta: green for improvements (lower RHR, faster pace), red for regressions
- Only show when the previous period has sufficient data (>3 sessions)

---

## 5. Training Load Estimation

### Concept
Estimate acute (7-day) and chronic (28-day) training load using a simplified TRIMP model:
- **TRIMP** = duration (min) x avg HR fraction x intensity weighting
- **Acute Training Load (ATL):** 7-day exponentially weighted average
- **Chronic Training Load (CTL):** 28-day exponentially weighted average
- **Training Stress Balance (TSB):** CTL - ATL (positive = fresh, negative = fatigued)

### Display
- Dedicated chart showing ATL, CTL, and TSB over time
- TSB zone coloring: green (5-25 = optimal freshness), yellow (-10 to 5 = functional overreach), red (< -10 = accumulated fatigue)
- Placed after the per-activity charts, before Session Log

### Implementation
- Pure function in `lib/trainingLoad.ts`
- Requires HR data per session (already available via `getHRForWorkout`)
- Requires user's max HR (already in zone settings)
- No external dependencies — straightforward exponential moving average math

---

## 6. Streak & Consistency Tracking

### Concept
Track workout consistency:
- Current streak (consecutive days/weeks with at least one session)
- Longest streak
- Weekly frequency (sessions per week over time)

### Display
- Small counter in the stats grid area
- Weekly frequency as a bar chart or calendar heatmap

---

## Implementation Order

1. **Goal lines** — smallest scope, biggest perceived value (add `chartjs-plugin-annotation`)
2. **Aggregation toggle** — pure logic, improves readability of all time-series charts
3. **Personal bests** — computed from existing data, no new parsing needed
4. **Historical comparison** — builds on the date filter, moderate UI work
5. **Training load** — requires careful math, new chart, but high value for serious athletes
6. **Streaks** — nice-to-have, low effort after the others are in place
