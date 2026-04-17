# Cardio Dashboard

A personal fitness dashboard that visualizes Apple Health export data. Upload your export and get interactive charts for heart rate, VO2max, HRV, pace, sleep, steps, and more.

## Features

- **10 health metrics** — HR, resting HR, VO2max, HRV, walking HR, body mass, steps, sleep, active energy, workouts
- **14 interactive charts** — time-series, scatter plots, bar charts, and a GitHub-style workout heatmap
- **Activity tabs** — filter by all cardio, stair climber, running, or walking
- **Date filtering** — custom range or presets (1M, 3M, 6M, YTD, 1Y, All)
- **Aggregation toggle** — view data by day, week, or month
- **Goal lines** — set targets on any chart, persisted to localStorage
- **HR zone analysis** — customizable zone boundaries with color-coded visualization
- **Offline preprocessor** — Python script to shrink 500MB+ exports to 1-5MB JSON

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and drop an Apple Health `export.zip`, `export.xml`, or preprocessed `.json` file.

### Preprocess (optional)

For faster loading, preprocess your export offline (requires Python 3):

```bash
npm run preprocess -- /path/to/export.xml
```

This produces a compact JSON that loads instantly in the browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run preprocess` | Run Python preprocessor |

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Chart.js** with date-fns adapter and annotation plugin
- **Vitest** + React Testing Library
- **ESLint** + **Prettier**
