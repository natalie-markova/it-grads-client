import { Sparkles } from 'lucide-react';

interface TechnologySelectorProps {
  availableTechnologies: string[];
  selectedTechnologies: string[];
  onToggle: (tech: string) => void;
}

export default function TechnologySelector({
  availableTechnologies,
  selectedTechnologies,
  onToggle
}: TechnologySelectorProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-cyan" />
        Выберите технологии
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availableTechnologies.map((tech) => (
          <button
            key={tech}
            onClick={() => onToggle(tech)}
            className={`px-4 py-3 rounded-lg font-medium transition-all ${
              selectedTechnologies.includes(tech)
                ? 'bg-accent-cyan text-dark-bg'
                : 'bg-dark-surface text-white hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>
      {selectedTechnologies.length > 0 && (
        <p className="text-sm text-gray-400 mt-3">
          Выбрано: {selectedTechnologies.join(', ')}
        </p>
      )}
    </div>
  );
}