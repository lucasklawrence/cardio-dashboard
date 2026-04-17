import { ZONE_COLORS, ZONE_NAMES } from '../constants';
import type { ZoneDistribution, ZoneNumber } from '../types';

interface ZoneBarProps {
  zones: ZoneDistribution;
  meta: string;
}

const ZONE_ORDER: ZoneNumber[] = [1, 2, 3, 4, 5];

/** Horizontal stacked bar showing HR zone distribution percentages with a color legend. */
export function ZoneBar({ zones, meta }: ZoneBarProps) {
  return (
    <div className="section">
      <div className="section-header">
        <h2>Zone Distribution</h2>
        <span className="meta">{meta}</span>
      </div>
      <div className="chart-container">
        <div className="zone-bar-container">
          <div className="zone-bar">
            {ZONE_ORDER.map((z) => {
              const pct = zones[z].pct;
              if (pct <= 0) return null;
              return (
                <div
                  key={z}
                  style={{ flex: pct, background: ZONE_COLORS[z] }}
                >
                  {pct > 5 ? `${Math.round(pct)}%` : ''}
                </div>
              );
            })}
          </div>
          <div className="zone-legend">
            {ZONE_ORDER.map((z) => (
              <span key={z}>
                <span className="dot" style={{ background: ZONE_COLORS[z] }} />
                {ZONE_NAMES[z]} — {Math.round(zones[z].pct)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
