import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPositions,
  fetchRecommendedPositions,
  fetchPositionGap,
  createPlan,
  clearPositionGap,
  Position,
  SkillGap,
} from '../../../store/slices/developmentPlanSlice';

const PositionSelector: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    positions,
    positionsLoading,
    categories,
    levels,
    recommendedPositions,
    positionGap,
    gapLoading,
    planLoading,
    error,
  } = useAppSelector((state) => state.developmentPlan);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchPositions({}));
    dispatch(fetchRecommendedPositions(6));
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory || selectedLevel) {
      dispatch(fetchPositions({ category: selectedCategory, level: selectedLevel }));
    }
  }, [selectedCategory, selectedLevel, dispatch]);

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setShowDetails(true);
    dispatch(fetchPositionGap(position.id));
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPosition(null);
    dispatch(clearPositionGap());
  };

  const handleCreatePlan = async () => {
    if (!selectedPosition) return;

    const result = await dispatch(createPlan(selectedPosition.id));
    if (createPlan.fulfilled.match(result)) {
      navigate('/development-plan');
    }
  };

  const filteredPositions = positions.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedLevel && p.level !== selectedLevel) return false;
    return true;
  });

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      junior: 'bg-green-100 text-green-800',
      middle: 'bg-blue-100 text-blue-800',
      senior: 'bg-purple-100 text-purple-800',
      lead: 'bg-amber-100 text-amber-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('developmentPlan.selectGoal', 'Выберите цель развития')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('developmentPlan.selectGoalDescription', 'Система создаст персональный план на основе вашего текущего профиля')}
          </p>
        </div>

        {/* Рекомендуемые позиции */}
        {recommendedPositions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('developmentPlan.recommended', 'Рекомендуем для вас')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedPositions.map((position) => (
                <div
                  key={position.id}
                  onClick={() => handlePositionClick(position)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{position.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {position.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${getLevelColor(position.level)}`}>
                        {position.level}
                      </span>
                    </div>
                  </div>
                  {position.matchScore !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('developmentPlan.match', 'Совпадение')}
                        </span>
                        <span className={`font-medium ${getMatchScoreColor(position.matchScore)}`}>
                          {position.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${position.matchScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('developmentPlan.allCategories', 'Все направления')}</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.icon} {cat.title}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{t('developmentPlan.allLevels', 'Все уровни')}</option>
            {Object.entries(levels).map(([key, level]) => (
              <option key={key} value={key}>
                {level.title}
              </option>
            ))}
          </select>
        </div>

        {/* Список позиций */}
        {positionsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPositions.map((position) => (
              <div
                key={position.id}
                onClick={() => handlePositionClick(position)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{position.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {position.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${getLevelColor(position.level)}`}>
                      {position.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно с деталями позиции */}
        {showDetails && selectedPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{selectedPosition.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedPosition.title}
                      </h2>
                      <span className={`text-sm px-3 py-1 rounded ${getLevelColor(selectedPosition.level)}`}>
                        {selectedPosition.level}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {gapLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : positionGap ? (
                  <>
                    {/* Match Score */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('developmentPlan.profileMatch', 'Совпадение с профилем')}
                        </span>
                        <span className={`text-2xl font-bold ${getMatchScoreColor(positionGap.matchScore)}`}>
                          {positionGap.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${positionGap.matchScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Skills Gap */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('developmentPlan.skillsGap', 'Разрыв по навыкам')}
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(positionGap.gaps).map(([skill, data]: [string, SkillGap]) => (
                          <div key={skill}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300 capitalize">
                                {skill.replace('_', ' ')}
                              </span>
                              <span className="text-gray-500">
                                {data.current} / {data.required}
                                {data.gap > 0 && (
                                  <span className="text-red-500 ml-2">-{data.gap}</span>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${data.progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(data.progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CodeBattle Requirements */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('developmentPlan.codebattleReqs', 'Требования CodeBattle')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('developmentPlan.rating', 'Рейтинг')}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {positionGap.codebattle.currentRating}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {positionGap.codebattle.requiredRating}
                            </span>
                            {positionGap.codebattle.ratingReached && (
                              <span className="text-green-500">✓</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('developmentPlan.solved', 'Решено задач')}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {positionGap.codebattle.currentSolved}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {positionGap.codebattle.requiredSolved}
                            </span>
                            {positionGap.codebattle.solvedReached && (
                              <span className="text-green-500">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Roadmaps */}
                    {positionGap.roadmaps.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {t('developmentPlan.requiredRoadmaps', 'Обязательные Roadmap')}
                        </h3>
                        <div className="space-y-2">
                          {positionGap.roadmaps.map((roadmap) => (
                            <div
                              key={roadmap.slug}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                            >
                              <span className="text-gray-900 dark:text-white">{roadmap.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{roadmap.progress}%</span>
                                {roadmap.status === 'completed' && (
                                  <span className="text-green-500">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* Action Button */}
                <button
                  onClick={handleCreatePlan}
                  disabled={planLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {planLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t('developmentPlan.creating', 'Создание плана...')}
                    </span>
                  ) : (
                    t('developmentPlan.createPlan', 'Создать план развития')
                  )}
                </button>

                {error && (
                  <p className="mt-3 text-center text-red-500 text-sm">{error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionSelector;
