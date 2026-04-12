import { useState, useRef, useEffect } from 'react';

interface GoalInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  unit: string;
}

export function GoalInput({ value, onChange, unit }: GoalInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleOpen = () => {
    setDraft(value != null ? String(value) : '');
    setEditing(true);
  };

  const handleSubmit = () => {
    const num = parseFloat(draft);
    if (Number.isFinite(num) && num > 0) {
      onChange(num);
    }
    setEditing(false);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.parentElement?.contains(next)) {
      return;
    }
    handleSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div className="goal-popover">
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="target"
          aria-label={`Goal target (${unit})`}
        />
        <span className="goal-unit">{unit}</span>
        {value != null && (
          <button
            type="button"
            className="goal-clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(null);
              setEditing(false);
            }}
          >
            clear
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`goal-trigger${value != null ? ' has-goal' : ''}`}
      onClick={handleOpen}
    >
      {value != null ? `Goal: ${value}` : 'Set goal'}
    </button>
  );
}
