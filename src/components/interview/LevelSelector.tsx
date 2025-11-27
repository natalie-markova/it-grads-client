import type { Level } from '../../types';

interface LevelSelectorProps {
  level: Level;
  onChange: (level: Level) => void;
}

export default function LevelSelector({ level, onChange }: LevelSelectorProps) {
  return (
    <div>
      <h3>Уровень</h3>
      <div>
        <button onClick={() => onChange('junior')}>
          Junior
          {level === 'junior' && <span> ✓</span>}
        </button>
        <button onClick={() => onChange('middle')}>
          Middle
          {level === 'middle' && <span> ✓</span>}
        </button>
        <button onClick={() => onChange('senior')}>
          Senior
          {level === 'senior' && <span> ✓</span>}
        </button>
      </div>
    </div>
  );
}