import { useHealthDataContext } from '../state/HealthDataContext';
import type { Zones } from '../types';

const FIELDS: { key: keyof Zones; label: string }[] = [
  { key: 'maxHR', label: 'Max HR' },
  { key: 'z1Max', label: 'Zone 1 <' },
  { key: 'z2Max', label: 'Zone 2 <' },
  { key: 'z3Max', label: 'Zone 3 <' },
  { key: 'z4Max', label: 'Zone 4 <' },
];

function isValidZones(z: Zones): boolean {
  return (
    z.maxHR > 0 &&
    z.z1Max > 0 &&
    z.z1Max < z.z2Max &&
    z.z2Max < z.z3Max &&
    z.z3Max < z.z4Max &&
    z.z4Max < z.maxHR
  );
}

/** Editable number inputs for customizing HR zone boundaries (max HR and zone ceilings). */
export function ZoneSettings() {
  const { zones, setZone } = useHealthDataContext();

  return (
    <div className="zone-settings">
      <h3>Heart Rate Zones</h3>
      <div className="zone-inputs">
        {FIELDS.map((field) => (
          <div key={field.key} className="zone-input">
            <label>{field.label}</label>
            <input
              type="number"
              min={1}
              value={zones[field.key]}
              onChange={(e) => {
                const next = parseInt(e.target.value, 10);
                if (isNaN(next)) return;
                const candidate = { ...zones, [field.key]: next };
                if (isValidZones(candidate)) setZone(field.key, next);
              }}
            />
          </div>
        ))}
      </div>
      <p className="hint">
        Default zones use ~60/70/80/90% of max HR. Adjust to match your known thresholds — your Z2
        ceiling around 120-130 bpm, Z4 near 160 bpm.
      </p>
    </div>
  );
}
