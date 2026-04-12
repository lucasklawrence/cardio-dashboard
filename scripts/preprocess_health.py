#!/usr/bin/env python3
"""
Apple Health Export Preprocessor
================================
Reads your Apple Health export.zip directly (no manual extraction needed),
extracts only the data the dashboard needs, and writes a small JSON file.

Usage:
    python preprocess_health.py export.zip

Output:
    health_data.json (typically 1-5MB instead of 500MB+ XML)
"""

import sys
import os
import json
import zipfile
import re
from datetime import datetime, timedelta

def log(msg, end='\n'):
    print(f"  {msg}", end=end, flush=True)

def parse_health_xml(xml_text):
    data = {
        'heartRateSamples': [],
        'restingHR': [],
        'workouts': [],
        'vo2max': [],
        'hrv': [],
        'walkingHR': [],
        'bodyMass': [],
        'stepCounts': [],
        'sleep': [],
        'activeEnergy': [],
    }

    total_len = len(xml_text)
    log(f"XML size: {total_len / 1024 / 1024:.0f} MB")

    # ─── Heart rate samples ───
    log("Parsing heart rate samples...", end='')
    hr_regex = re.compile(
        r'<Record type="HKQuantityTypeIdentifierHeartRate"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"'
    )
    count = 0
    for m in hr_regex.finditer(xml_text):
        data['heartRateSamples'].append({
            'd': m.group(1),
            'b': round(float(m.group(2)), 1)
        })
        count += 1
        if count % 100000 == 0:
            print(f" {count:,}...", end='', flush=True)
    log(f" {count:,} found")

    # ─── Resting heart rate ───
    log("Parsing resting heart rate...", end='')
    rhr_regex = re.compile(
        r'<Record type="HKQuantityTypeIdentifierRestingHeartRate"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"'
    )
    count = 0
    for m in rhr_regex.finditer(xml_text):
        data['restingHR'].append({
            'd': m.group(1),
            'b': round(float(m.group(2)), 1)
        })
        count += 1
    log(f" {count:,} found")

    # ─── Workouts ───
    log("Parsing workouts...", end='')
    workout_open_regex = re.compile(r'<Workout\s([^>]+)>')
    
    workouts_by_start = {}
    count = 0
    for m in workout_open_regex.finditer(xml_text):
        attrs = m.group(1)
        def get(name):
            am = re.search(rf'{name}="([^"]*)"', attrs)
            return am.group(1) if am else None

        wtype = get('workoutActivityType')
        start = get('startDate')
        end = get('endDate')
        if not wtype or not start or not end:
            continue

        # Only keep cardio-relevant workouts
        dominated_by_cardio = any(k in wtype for k in [
            'StairClimbing', 'Stair', 'StepperMachine', 'StairStepper',
            'Running', 'Walking', 'Cycling', 'Hiking', 'Elliptical',
            'Rowing', 'Swimming'
        ])
        if not dominated_by_cardio:
            continue

        w = {
            't': wtype,
            'dur': round(float(get('duration') or 0), 2),
            'du': get('durationUnit') or 'min',
            'sd': start,
            'ed': end,
            'cal': round(float(get('totalEnergyBurned') or 0), 1) or None,
            'dmi': None,
            'dkm': None,
            'elev': None,
            'elevF': None,
        }
        data['workouts'].append(w)
        workouts_by_start[start] = w
        count += 1
    log(f" {count:,} cardio workouts found")

    # ─── Distance & elevation from workout blocks ───
    log("Parsing distance & elevation...", end='')
    block_regex = re.compile(
        r'<Workout\s[^>]*startDate="([^"]*)"[^>]*>([\s\S]*?)</Workout>'
    )
    dist_count = 0
    for m in block_regex.finditer(xml_text):
        start = m.group(1)
        content = m.group(2)

        w = workouts_by_start.get(start)
        if not w:
            continue

        # Distance
        dist_m = re.search(
            r'type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*sum="([^"]*)"', content
        )
        if dist_m:
            dist_val = float(dist_m.group(1))
            unit_m = re.search(
                r'type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*unit="([^"]*)"', content
            )
            unit = unit_m.group(1) if unit_m else 'km'
            if unit == 'mi':
                w['dmi'] = round(dist_val, 4)
                w['dkm'] = round(dist_val * 1.60934, 4)
            else:
                w['dkm'] = round(dist_val, 4)
                w['dmi'] = round(dist_val / 1.60934, 4)
            dist_count += 1

        # Elevation
        elev_m = re.search(
            r'type="HKQuantityTypeIdentifierElevationAscended"[^>]*sum="([^"]*)"', content
        )
        if elev_m:
            w['elev'] = round(float(elev_m.group(1)), 1)

        flights_m = re.search(
            r'type="HKQuantityTypeIdentifierFlightsClimbed"[^>]*sum="([^"]*)"', content
        )
        if flights_m:
            w['elevF'] = round(float(flights_m.group(1)), 1)

    log(f" {dist_count:,} with GPS distance")

    # ─── VO2max ───
    log("Parsing VO2max...", end='')
    vo2_regex = re.compile(
        r'<Record type="HKQuantityTypeIdentifierVO2Max"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"'
    )
    count = 0
    for m in vo2_regex.finditer(xml_text):
        data['vo2max'].append({
            'd': m.group(1),
            'v': round(float(m.group(2)), 2)
        })
        count += 1
    log(f" {count:,} found")

    # ─── HRV (SDNN) ───
    log("Parsing HRV (SDNN)...", end='')
    hrv_regex = re.compile(
        r'<Record\b[^>]*type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"[^>]*>'
    )
    count = 0
    for m in hrv_regex.finditer(xml_text):
        record = m.group(0)
        date_m = re.search(r'\bstartDate="([^"]*)"', record)
        val_m = re.search(r'\bvalue="([^"]*)"', record)
        if not date_m or not val_m:
            continue
        data['hrv'].append({
            'd': date_m.group(1),
            'v': round(float(val_m.group(1)), 2)
        })
        count += 1
    log(f" {count:,} found")

    # ─── Walking heart rate average ───
    log("Parsing walking heart rate...", end='')
    whr_regex = re.compile(
        r'<Record\b[^>]*type="HKQuantityTypeIdentifierWalkingHeartRateAverage"[^>]*>'
    )
    count = 0
    for m in whr_regex.finditer(xml_text):
        record = m.group(0)
        date_m = re.search(r'\bstartDate="([^"]*)"', record)
        val_m = re.search(r'\bvalue="([^"]*)"', record)
        if not date_m or not val_m:
            continue
        data['walkingHR'].append({
            'd': date_m.group(1),
            'b': round(float(val_m.group(1)), 1)
        })
        count += 1
    log(f" {count:,} found")

    # ─── Body mass ───
    log("Parsing body mass...", end='')
    mass_regex = re.compile(
        r'<Record type="HKQuantityTypeIdentifierBodyMass"\s([^>]+)'
    )
    count = 0
    for m in mass_regex.finditer(xml_text):
        attrs = m.group(1)
        date_m = re.search(r'startDate="([^"]*)"', attrs)
        val_m = re.search(r'value="([^"]*)"', attrs)
        unit_m = re.search(r'unit="([^"]*)"', attrs)
        if not date_m or not val_m:
            continue
        val = float(val_m.group(1))
        unit = (unit_m.group(1).strip().lower() if unit_m else 'lb')
        if unit == 'lb':
            lbs = val
        elif unit == 'kg':
            lbs = val * 2.20462
        else:
            continue
        data['bodyMass'].append({
            'd': date_m.group(1),
            'lb': round(lbs, 1)
        })
        count += 1
    log(f" {count:,} found")

    # ─── Step counts (aggregate to daily totals) ───
    log("Parsing step counts...", end='')
    step_regex = re.compile(
        r'<Record type="HKQuantityTypeIdentifierStepCount"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"'
    )
    steps_by_day = {}
    count = 0
    for m in step_regex.finditer(xml_text):
        try:
            dt = datetime.fromisoformat(m.group(1).replace(' +', '+').replace(' -', '-'))
            val = int(float(m.group(2)))
        except (ValueError, TypeError):
            continue
        day_key = dt.strftime('%Y-%m-%d')
        steps_by_day[day_key] = steps_by_day.get(day_key, 0) + val
        count += 1
    for day_key, total in sorted(steps_by_day.items()):
        data['stepCounts'].append({'d': day_key, 'c': total})
    log(f" {len(steps_by_day):,} days ({count:,} records)")

    # ─── Sleep analysis ───
    log("Parsing sleep analysis...", end='')
    sleep_regex = re.compile(
        r'<Record\b[^>]*type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*>'
    )
    SLEEP_STAGES = {'AsleepCore', 'AsleepDeep', 'AsleepREM', 'Asleep'}
    sleep_by_night = {}
    count = 0
    for m in sleep_regex.finditer(xml_text):
        record = m.group(0)
        val_m = re.search(r'\bvalue="(?:HKCategoryValueSleepAnalysis)?(\w+)"', record)
        if not val_m or val_m.group(1) not in SLEEP_STAGES:
            continue
        start_m = re.search(r'\bstartDate="([^"]*)"', record)
        end_m = re.search(r'\bendDate="([^"]*)"', record)
        if not start_m or not end_m:
            continue
        try:
            start = datetime.fromisoformat(start_m.group(1).replace(' +', '+').replace(' -', '-'))
            end = datetime.fromisoformat(end_m.group(1).replace(' +', '+').replace(' -', '-'))
        except (ValueError, TypeError):
            continue
        hours = (end - start).total_seconds() / 3600
        if hours <= 0 or hours > 24:
            continue
        # Assign to "night": if sleep starts before noon, count as previous day
        night = start
        if night.hour < 12:
            night = night - timedelta(days=1)
        night_key = night.strftime('%Y-%m-%d')
        sleep_by_night[night_key] = sleep_by_night.get(night_key, 0) + hours
        count += 1
    for night_key, hours in sorted(sleep_by_night.items()):
        data['sleep'].append({'d': night_key, 'h': round(hours, 2)})
    log(f" {len(sleep_by_night):,} nights ({count:,} records)")

    # ─── Active energy burned (aggregate to daily totals) ───
    log("Parsing active energy...", end='')
    energy_regex = re.compile(
        r'<Record\b[^>]*type="HKQuantityTypeIdentifierActiveEnergyBurned"[^>]*>'
    )
    energy_by_day = {}
    count = 0
    for m in energy_regex.finditer(xml_text):
        record = m.group(0)
        date_m = re.search(r'\bstartDate="([^"]*)"', record)
        val_m = re.search(r'\bvalue="([^"]*)"', record)
        if not date_m or not val_m:
            continue
        try:
            dt = datetime.fromisoformat(date_m.group(1).replace(' +', '+').replace(' -', '-'))
            kcal = float(val_m.group(1))
        except (ValueError, TypeError):
            continue
        day_key = dt.strftime('%Y-%m-%d')
        energy_by_day[day_key] = energy_by_day.get(day_key, 0) + kcal
        count += 1
    for day_key, total in sorted(energy_by_day.items()):
        data['activeEnergy'].append({'d': day_key, 'k': int(total + 0.5)})
    log(f" {len(energy_by_day):,} days ({count:,} records)")

    return data


def main():
    if len(sys.argv) < 2:
        print("Usage: python preprocess_health.py <export.zip or export.xml>")
        print("")
        print("Reads your Apple Health export and creates a small JSON file")
        print("for the Cardio Dashboard.")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = os.path.join(os.path.dirname(input_path), 'health_data.json')

    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        sys.exit(1)

    file_size = os.path.getsize(input_path) / 1024 / 1024
    print(f"\n{'='*50}")
    print(f"  Apple Health Preprocessor")
    print(f"{'='*50}")
    print(f"  Input: {input_path} ({file_size:.1f} MB)")
    print()

    xml_text = None

    if input_path.lower().endswith('.zip'):
        log("Opening ZIP archive...")
        with zipfile.ZipFile(input_path, 'r') as zf:
            # Find the export.xml
            xml_name = None
            for name in zf.namelist():
                if name.lower().endswith('export.xml'):
                    xml_name = name
                    break
            if not xml_name:
                # Try any XML
                for name in zf.namelist():
                    if name.lower().endswith('.xml'):
                        xml_name = name
                        break
            if not xml_name:
                print("  No export.xml found in ZIP!")
                sys.exit(1)

            log(f"Reading {xml_name}...")
            xml_text = zf.read(xml_name).decode('utf-8')
    else:
        log("Reading XML file...")
        with open(input_path, 'r', encoding='utf-8') as f:
            xml_text = f.read()

    log("Starting parse...\n")
    data = parse_health_xml(xml_text)

    # Free memory
    del xml_text

    # Write JSON
    log(f"\nWriting {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))

    out_size = os.path.getsize(output_path) / 1024 / 1024
    print(f"\n{'='*50}")
    print(f"  Done!")
    print(f"  Output: {output_path} ({out_size:.1f} MB)")
    print(f"")
    print(f"  Records:")
    print(f"    Heart rate samples: {len(data['heartRateSamples']):,}")
    print(f"    Resting HR:         {len(data['restingHR']):,}")
    print(f"    Workouts:           {len(data['workouts']):,}")
    print(f"    VO2max readings:    {len(data['vo2max']):,}")
    print(f"    HRV (SDNN):         {len(data['hrv']):,}")
    print(f"    Walking HR avg:     {len(data['walkingHR']):,}")
    print(f"    Body mass:          {len(data['bodyMass']):,}")
    print(f"    Step counts:        {len(data['stepCounts']):,} days")
    print(f"    Sleep nights:       {len(data['sleep']):,}")
    print(f"    Active energy:      {len(data['activeEnergy']):,} days")
    print(f"")
    print(f"  Now open the dashboard and drop in {os.path.basename(output_path)}")
    print(f"{'='*50}\n")


if __name__ == '__main__':
    main()
