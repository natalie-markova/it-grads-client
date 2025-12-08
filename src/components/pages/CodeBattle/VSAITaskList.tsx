import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTasks, getLanguages } from './api';
import type { GameTask, Language } from './types';

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const aiDifficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  hard: 'bg-red-500/20 text-red-400 border-red-500/50'
};

const languageNames: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  kotlin: 'Kotlin'
};

const formatLanguage = (lang: string): string => {
  return languageNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

export default function VSAITaskList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<GameTask[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedAiDifficulty, setSelectedAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [filters, setFilters] = useState({
    difficulty: searchParams.get('difficulty') || '',
    category: searchParams.get('category') || '',
    language: searchParams.get('language') || '',
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters, searchParams]);

  const loadLanguages = async () => {
    try {
      const data = await getLanguages();
      setLanguages(data);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get('page') || '1');
      const data = await getTasks({
        ...filters,
        page,
        limit: 12
      });
      setTasks(data?.tasks || []);
      setPagination(data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/codebattle/play/${taskId}?mode=vs_ai&ai=${selectedAiDifficulty}`);
  };

  const categories = ['arrays', 'strings', 'algorithms', 'data-structures', 'basics', 'math'];

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-16">
      {/* Header */}
      <div className="bg-dark-surface border-b border-dark-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/codebattle')}
              className="px-4 py-2 bg-dark-card hover:bg-dark-bg border border-dark-bg hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Назад</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">🤖 Соревнование с AI</h1>
              <p className="text-sm text-gray-400 mt-1">Выберите задачу и сложность AI-соперника</p>
            </div>
          </div>

          {/* AI Difficulty Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Сложность AI-соперника:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAiDifficulty('easy')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedAiDifficulty === 'easy'
                    ? 'bg-green-500/30 border-green-500 text-green-400 shadow-lg'
                    : 'bg-dark-card border-dark-surface text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-lg font-bold">🟢 Легкий</div>
                <div className="text-xs mt-1">Медленный AI</div>
              </button>
              <button
                onClick={() => setSelectedAiDifficulty('medium')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedAiDifficulty === 'medium'
                    ? 'bg-yellow-500/30 border-yellow-500 text-yellow-400 shadow-lg'
                    : 'bg-dark-card border-dark-surface text-gray-400 hover:border-yellow-500/50'
                }`}
              >
                <div className="text-lg font-bold">🟡 Средний</div>
                <div className="text-xs mt-1">Умеренный AI</div>
              </button>
              <button
                onClick={() => setSelectedAiDifficulty('hard')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedAiDifficulty === 'hard'
                    ? 'bg-red-500/30 border-red-500 text-red-400 shadow-lg'
                    : 'bg-dark-card border-dark-surface text-gray-400 hover:border-red-500/50'
                }`}
              >
                <div className="text-lg font-bold">🔴 Сложный</div>
                <div className="text-xs mt-1">Быстрый AI</div>
              </button>
            </div>
          </div>

          {/* Task Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="bg-dark-card border border-dark-surface rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
            >
              <option value="">Все сложности</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="bg-dark-card border border-dark-surface rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="bg-dark-card border border-dark-surface rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
            >
              <option value="">Все языки</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            {(filters.difficulty || filters.category || filters.language) && (
              <button
                onClick={() => {
                  setFilters({ difficulty: '', category: '', language: '' });
                  setSearchParams({});
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm text-red-400 transition-all"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <p>Задачи не найдены</p>
          </div>
        ) : (() => {
            const filteredTasks = tasks.filter(task => task.externalSource !== 'codeforces');
            return filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔍</div>
                <p>Задачи не найдены</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-400 text-sm">
                  Найдено: {filteredTasks.length} задач
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="bg-dark-card border border-dark-surface rounded-xl p-6 cursor-pointer hover:border-accent-blue/50 hover:shadow-glow-cyan transition-all group"
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-semibold text-lg group-hover:text-accent-blue transition-colors break-words">
                        {task.title}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border flex-shrink-0 ${difficultyColors[task.difficulty]}`}>
                      {task.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-dark-surface rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-4">
                      <span>⏱ {Math.floor(task.timeLimit / 60)} мин</span>
                      <span>✓ {task.solvedCount}</span>
                    </div>
                    <span className="text-accent-cyan font-medium">+{task.points} pts</span>
                  </div>

                  {/* VS AI Indicator */}
                  <div className={`mb-3 px-3 py-2 rounded-lg border ${aiDifficultyColors[selectedAiDifficulty]} flex items-center justify-center gap-2`}>
                    <span className="text-sm font-medium">🤖 VS AI ({selectedAiDifficulty === 'easy' ? 'Легкий' : selectedAiDifficulty === 'medium' ? 'Средний' : 'Сложный'})</span>
                  </div>

                  <div className="pt-3 border-t border-dark-surface">
                    <div className="text-xs text-gray-500 mb-1">Доступные языки:</div>
                    <div className="text-xs text-gray-400">
                      {task.languages.slice(0, 5).map((lang) => formatLanguage(lang)).join(', ')}
                      {task.languages.length > 5 && ` +${task.languages.length - 5}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

              </>
            );
          })()
        }
      </div>
    </div>
  );
}