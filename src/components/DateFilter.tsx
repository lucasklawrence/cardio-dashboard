import { useHealthDataContext } from '../state/HealthDataContext';
import { toDateInputValue } from '../lib/format';

const PRESETS: { label: string; months: number }[] = [
  { label: 'All', months: 0 },
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
];

export function DateFilter() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, setDatePreset, setDateYTD } =
    useHealthDataContext();

  const noPreset = !dateFrom && !dateTo;
  const isYTD =
    dateFrom !== null &&
    dateTo === null &&
    dateFrom.getMonth() === 0 &&
    dateFrom.getDate() === 1 &&
    dateFrom.getFullYear() === new Date().getFullYear();

  return (
    <div className="date-filter">
      <label>From</label>
      <input
        type="date"
        value={toDateInputValue(dateFrom)}
        onChange={(e) =>
          setDateFrom(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)
        }
      />
      <label>To</label>
      <input
        type="date"
        value={toDateInputValue(dateTo)}
        onChange={(e) =>
          setDateTo(e.target.value ? new Date(e.target.value + 'T23:59:59') : null)
        }
      />
      <div className="date-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`preset-btn${p.months === 0 && noPreset ? ' active' : ''}`}
            onClick={() => setDatePreset(p.months)}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className={`preset-btn${isYTD ? ' active' : ''}`}
          onClick={() => setDateYTD()}
        >
          YTD
        </button>
      </div>
    </div>
  );
}
