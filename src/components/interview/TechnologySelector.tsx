

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
      <h3>Выберите технологии</h3>
      <div>
        {availableTechnologies.map((tech) => (
          <button
            key={tech}
            onClick={() => onToggle(tech)}
          >
            {tech}
            {selectedTechnologies.includes(tech) && <span> ✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}