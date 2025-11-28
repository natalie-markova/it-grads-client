import { Code, Server, Layers } from 'lucide-react';

interface DirectionCardProps {
  direction: 'frontend' | 'backend' | 'fullstack';
  selected: boolean;
  onClick: () => void;
}

const directionConfig = {
  frontend: {
    icon: Code,
    title: 'Frontend',
    description: 'UI/UX, React, CSS'
  },
  backend: {
    icon: Server,
    title: 'Backend',
    description: 'API, Database, Node.js'
  },
  fullstack: {
    icon: Layers,
    title: 'Fullstack',
    description: 'Frontend + Backend'
  }
};

export default function DirectionCard({ direction, selected, onClick }: DirectionCardProps) {
  const config = directionConfig[direction];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg border-2 transition-all text-center ${
        selected
          ? 'bg-accent-cyan/20 border-accent-cyan text-white'
          : 'bg-dark-surface border-dark-card text-gray-300 hover:border-accent-cyan/50 hover:bg-dark-card'
      }`}
    >
      <Icon className={`w-8 h-8 mx-auto mb-3 ${selected ? 'text-accent-cyan' : 'text-gray-400'}`} />
      <h4 className="font-bold text-lg mb-1">{config.title}</h4>
      <p className="text-sm text-gray-400">{config.description}</p>
    </button>
  );
}