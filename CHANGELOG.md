# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
