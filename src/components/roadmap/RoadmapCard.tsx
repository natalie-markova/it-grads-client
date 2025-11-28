import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';

interface RoadmapCardProps {
  roadmap: {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    icon?: string;
    color?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedMonths?: number;
    popularityScore?: number;
  };
}

const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  const difficultyLabels = {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  };

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <Link
      to={`/roadmap/${roadmap.slug}`}
      className="block bg-dark-card border border-dark-surface rounded-xl p-6 hover:border-accent-cyan transition-all duration-300 hover:shadow-lg hover:shadow-accent-cyan/10 group"
    >
      {/* Header with Icon and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
          style={{ backgroundColor: roadmap.color ? `${roadmap.color}20` : '#3B82F620' }}
        >
          {roadmap.icon || '📚'}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border ${
            difficultyColors[roadmap.difficulty]
          }`}
        >
          {difficultyLabels[roadmap.difficulty]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-cyan transition-colors">
        {roadmap.title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {roadmap.description}
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-surface">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {roadmap.estimatedMonths && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{roadmap.estimatedMonths} мес</span>
            </div>
          )}
          {roadmap.popularityScore !== undefined && roadmap.popularityScore > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{roadmap.popularityScore}</span>
            </div>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-accent-cyan group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default RoadmapCard;
