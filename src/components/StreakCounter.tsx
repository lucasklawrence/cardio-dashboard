import type { StreakResult } from '../lib/streaks';

interface StreakCounterProps {
  streak: StreakResult;
}

/** Flame-icon streak counter showing current and longest workout streaks. */
export function StreakCounter({ streak }: StreakCounterProps) {
  const isActive = streak.current > 0;

  return (
    <div className="streak-counter">
      <div className={`streak-current ${isActive ? 'active' : 'inactive'}`}>
        <span className="streak-flame">{isActive ? '\u{1F525}' : '\u{1F525}'}</span>
        <span className="streak-value">{streak.current}</span>
        <span className="streak-label">day streak</span>
      </div>
      {streak.longest > 0 && (
        <div className="streak-longest">
          <span className="streak-label">longest: {streak.longest}d</span>
        </div>
      )}
    </div>
  );
}
