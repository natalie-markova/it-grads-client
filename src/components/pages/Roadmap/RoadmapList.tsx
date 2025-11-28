import { useState, useEffect } from 'react';
import { Map, Filter, Search } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import RoadmapCard from '../../roadmap/RoadmapCard';
import toast from 'react-hot-toast';

interface Roadmap {
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
}

const RoadmapList = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'role', label: 'Специальности' },
    { value: 'language', label: 'Языки программирования' },
    { value: 'framework', label: 'Фреймворки' },
    { value: 'skill', label: 'Навыки' }
  ];

  const difficulties = [
    { value: 'all', label: 'Все уровни' },
    { value: 'beginner', label: 'Начальный' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' }
  ];

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    filterRoadmaps();
  }, [roadmaps, searchQuery, selectedCategory, selectedDifficulty]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await $api.get('/roadmaps');
      setRoadmaps(response.data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Ошибка при загрузке карт специальностей');
    } finally {
      setLoading(false);
    }
  };

  const filterRoadmaps = () => {
    let filtered = [...roadmaps];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (roadmap) =>
          roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          roadmap.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((roadmap) => roadmap.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((roadmap) => roadmap.difficulty === selectedDifficulty);
    }

    setFilteredRoadmaps(filtered);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-cyan to-accent-green text-dark-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Map className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Карта специальностей</h1>
          </div>
          <p className="text-lg opacity-90 max-w-3xl">
            Изучите карьерные пути и технологии. Найдите свой путь в IT и начните обучение с
            пошаговыми roadmap для каждой специальности.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-dark-card rounded-xl p-6 mb-8 border border-dark-surface">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-lg font-semibold text-white">Фильтры</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            >
              {difficulties.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Найдено специальностей: <span className="text-white font-semibold">{filteredRoadmaps.length}</span>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
            <p className="text-gray-400 mt-4">Загрузка...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRoadmaps.length === 0 && (
          <div className="text-center py-12 bg-dark-card rounded-xl border border-dark-surface">
            <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ничего не найдено</h3>
            <p className="text-gray-400">Попробуйте изменить параметры фильтрации</p>
          </div>
        )}

        {/* Roadmaps Grid */}
        {!loading && filteredRoadmaps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapList;
