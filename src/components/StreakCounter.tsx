import type { StreakResult } from '../lib/streaks';

interface StreakCounterProps {
  streak: StreakResult;
  filteredStreak?: StreakResult | null;
}

/** Flame-icon streak counter showing current and longest workout streaks. */
export function StreakCounter({ streak, filteredStreak }: StreakCounterProps) {
  const isActive = streak.current > 0;

  return (
    <div className="streak-counter">
      <div className={`streak-current ${isActive ? 'active' : 'inactive'}`}>
        <span className="streak-flame">{'\u{1F525}'}</span>
        <span className="streak-value">{streak.current}</span>
        <span className="streak-label">day streak</span>
      </div>
      {streak.longest > 0 && (
        <div className="streak-longest">
          <span className="streak-label">longest: {streak.longest}d</span>
        </div>
      )}
      {filteredStreak && filteredStreak.longest > 0 && (
        <div className="streak-longest">
          <span className="streak-label">in range: {filteredStreak.longest}d</span>
        </div>
      )}
    </div>
  );
}
