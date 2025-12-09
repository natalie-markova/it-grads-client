import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Level } from '../../../types';

interface LevelSelectorProps {
  level: Level;
  onChange: (level: Level) => void;
}

export default function LevelSelector({ level, onChange }: LevelSelectorProps) {
  const { t } = useTranslation();

  const levels: { value: Level; label: string; description: string }[] = [
    { value: 'junior', label: 'Junior', description: t('aiInterviewSetup.levels.junior') },
    { value: 'middle', label: 'Middle', description: t('aiInterviewSetup.levels.middle') },
    { value: 'senior', label: 'Senior', description: t('aiInterviewSetup.levels.senior') }
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent-cyan" />
        {t('aiInterviewSetup.difficultyLevel')}
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {levels.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => onChange(lvl.value)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              level === lvl.value
                ? 'bg-accent-cyan/20 border-accent-cyan text-white'
                : 'bg-dark-surface border-dark-card text-gray-300 hover:border-accent-cyan/50 hover:bg-dark-card'
            }`}
          >
            <h4 className="font-bold text-lg mb-1">{lvl.label}</h4>
            <p className="text-sm text-gray-400">{lvl.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}