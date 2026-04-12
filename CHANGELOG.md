# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-04-12

### Added

- Clinical Broadsheet aesthetic: film grain + vignette overlay, editorial stat numerals with hairline separators
- FIG. counters on all charts with accurate numbering per rendered chart
- Typographic tabs with accent underlines and staggered reveal animations
- Time-scale X axis on all charts so temporal gaps render proportionally (via `date-fns` + `chartjs-adapter-date-fns`)
- YTD date preset button
- `prefers-reduced-motion` media query for accessibility

### Changed

- Refined color palette: brighter zone colors, subtler grid lines, minimal chart chrome
- Charts use monotone cubic interpolation and `insertGapBreaks` for line continuity
- Header restyled as uppercase DM Mono with version label
- Upload zone restyled with Instrument Serif heading and dashed border
- Stats display as large editorial numerals with hairline separators (no card backgrounds)
- HRV, Walking HR, and Body Mass charts updated to match editorial style

### Fixed

- Chart tooltips now use timestamp-based lookups instead of `dataIndex` to avoid drift from `insertGapBreaks` synthetic gap points
- Per-point zone colors in PaceChart aligned to chart data (including gap points)
- Figure counter no longer skips numbers when fewer than 4 activity charts render

## [0.2.0] - 2026-04-12

### Added

- HRV (SDNN) metric extraction, parsing, and chart visualization
- Walking Heart Rate Average metric extraction, parsing, and chart
- Body Mass (weight) metric with automatic lb/kg conversion and chart
- New progress stages for HRV, Walking HR, and Body Mass during XML parsing
- Preprocessor support for all three new metrics (`scripts/preprocess_health.py`)
- JSON hydration for `hrv`, `walkingHR`, and `bodyMass` fields
- Unit tests for body mass, HRV, and walking HR XML parsing (attribute order, validation)

### Fixed

- XML record parsing is now attribute-order-agnostic for body mass, HRV, and walking HR
- Body mass unit conversion explicitly handles only `lb` and `kg`, skipping unknown units
- Invalid numeric values and dates are rejected during parsing instead of producing NaN entries
- Hydrated JSON arrays are now sorted by date

## [0.1.0] - 2026-04-11

### Added

- Initial dashboard with heart rate, resting HR, VO2max, step count, and workout tracking
- Apple Health export.zip and preprocessed JSON upload support
- XML and JSON parsers with streaming progress indicators
- Interactive charts with date range filtering
- Workout distance, elevation, and calorie tracking
- Vitest testing framework with unit tests
- Feature planning roadmap and documentation
