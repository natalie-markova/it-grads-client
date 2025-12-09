import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPlanStatus,
  syncPlan,
  completeStep,
  pausePlan,
  resumePlan,
  abandonPlan,
  fetchRecommendedTasks,
  PlanStep,
} from '../../../store/slices/developmentPlanSlice';

const PlanDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    planStatus,
    planLoading,
    syncLoading,
    recommendedTasks,
    tasksLoading,
    error,
  } = useAppSelector((state) => state.developmentPlan);

  useEffect(() => {
    dispatch(fetchPlanStatus(i18n.language));
  }, [dispatch, i18n.language]);

  useEffect(() => {
    if (planStatus?.hasPlan) {
      dispatch(fetchRecommendedTasks(5));
    }
  }, [planStatus?.hasPlan, dispatch]);

  const handleSync = () => {
    dispatch(syncPlan(i18n.language));
  };

  const handleCompleteStep = (stepId: string) => {
    dispatch(completeStep(stepId));
  };

  const handlePause = () => {
    if (planStatus?.plan?.id) {
      dispatch(pausePlan(planStatus.plan.id));
    }
  };

  const handleResume = () => {
    if (planStatus?.plan?.id) {
      dispatch(resumePlan(planStatus.plan.id));
    }
  };

  const handleAbandon = () => {
    if (planStatus?.plan?.id && confirm(t('developmentPlan.confirmAbandon', 'Вы уверены, что хотите отменить план?'))) {
      dispatch(abandonPlan(planStatus.plan.id));
    }
  };

  // Исправление бага с заблокированными шагами
  const handleFixUnlock = async () => {
    try {
      const { $api } = await import('../../../utils/axios.instance');
      const response = await $api.post('/development-plan/fix-unlock');
      console.log('[FixUnlock] Response:', response.data);
      // Перезагружаем статус плана
      dispatch(fetchPlanStatus());
    } catch (error) {
      console.error('Error fixing unlock:', error);
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500 text-xl">✓</span>;
      case 'in_progress':
        return <span className="text-blue-500 text-xl">●</span>;
      case 'unlocked':
        return <span className="text-yellow-500 text-xl">○</span>;
      case 'locked':
        return <span className="text-gray-400 text-xl">🔒</span>;
      default:
        return null;
    }
  };

  const getStepTypeIcon = (type: string, interviewType?: string) => {
    switch (type) {
      case 'codebattle':
        return '⚔️';
      case 'roadmap':
        return '🗺️';
      case 'interview':
        // Разные иконки для разных типов тренажера
        if (interviewType === 'practice') return '📝';
        if (interviewType === 'ai') return '🤖';
        if (interviewType === 'audio') return '🎧';
        return '🎤';
      case 'project':
        return '💻';
      case 'course':
        return '📚';
      default:
        return '📋';
    }
  };

  const getInterviewTypeLabel = (interviewType?: string) => {
    switch (interviewType) {
      case 'practice':
        return t('developmentPlan.practiceQuiz', 'Практика с вопросами');
      case 'ai':
        return t('developmentPlan.aiInterview', 'AI-интервью');
      case 'audio':
        return t('developmentPlan.audioInterview', 'Аудио-интервью');
      case 'any':
        return t('developmentPlan.anyTrainer', 'Любой тренажер');
      default:
        return t('developmentPlan.interview', 'Тренажер');
    }
  };

  // Получить URL для шага
  const getStepUrl = (step: PlanStep): string | null => {
    switch (step.type) {
      case 'codebattle':
        return '/codebattle';
      case 'roadmap':
        return step.roadmapSlug ? `/roadmap/${step.roadmapSlug}` : '/roadmap';
      case 'interview':
        // Перенаправляем на соответствующий тип тренажера
        if (step.interviewType === 'practice') return '/interview';
        if (step.interviewType === 'ai') return '/interview';
        if (step.interviewType === 'audio') return '/interview';
        return '/interview';
      case 'project':
        return null; // Проекты пока не имеют страницы
      case 'course':
        return null; // Курсы пока не имеют страницы
      default:
        return null;
    }
  };

  // Обработчик клика на шаг
  const handleStepClick = (step: PlanStep) => {
    // Не переходим для заблокированных шагов
    if (step.status === 'locked') return;

    const url = getStepUrl(step);
    if (url) {
      navigate(url);
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!planStatus?.hasPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">🎯</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('developmentPlan.noPlan', 'У вас нет активного плана развития')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('developmentPlan.noPlanDescription', 'Выберите целевую позицию, и система создаст персональный план обучения')}
          </p>
          <Link
            to="/development-plan/select"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('developmentPlan.selectPosition', 'Выбрать цель')}
          </Link>
        </div>
      </div>
    );
  }

  const { plan, currentStep, stepsStats, skillProgress, gaps, steps } = planStatus;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{plan?.targetPositionIcon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan?.targetPositionTitle}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('developmentPlan.yourGoal', 'Ваша цель развития')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncLoading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {syncLoading ? (
                  <span className="animate-spin inline-block">↻</span>
                ) : (
                  '↻'
                )}
                {' '}{t('developmentPlan.sync', 'Синхронизировать')}
              </button>
              {/* Кнопка для исправления разблокировки - показываем если есть проблемы */}
              {(() => {
                // Проверяем есть ли roadmap шаги с полным прогрессом, но не completed
                const hasRoadmapBug = steps?.some(
                  (s: PlanStep) => s.type === 'roadmap' &&
                  (s.currentProgress || 0) >= (s.requiredProgress || 100) &&
                  s.status !== 'completed'
                );
                // Или есть completed шаги и locked, но нет in_progress
                const hasUnlockBug = stepsStats && stepsStats.completed > 0 && stepsStats.locked > 0 && stepsStats.inProgress === 0;

                if (hasRoadmapBug || hasUnlockBug) {
                  return (
                    <button
                      onClick={handleFixUnlock}
                      className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition-colors font-medium"
                      title={t('developmentPlan.fixUnlock', 'Исправить разблокировку')}
                    >
                      🔧 {t('developmentPlan.fixProgress', 'Исправить')}
                    </button>
                  );
                }
                return null;
              })()}
              {plan?.status === 'active' ? (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                >
                  {t('developmentPlan.pause', 'Приостановить')}
                </button>
              ) : plan?.status === 'paused' ? (
                <button
                  onClick={handleResume}
                  className="px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  {t('developmentPlan.resume', 'Возобновить')}
                </button>
              ) : null}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                {t('developmentPlan.overallProgress', 'Общий прогресс')}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {plan?.overallProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${plan?.overallProgress || 0}%` }}
              />
            </div>
            {plan?.estimatedWeeks && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('developmentPlan.estimatedTime', 'Оценка времени')}: ~{plan.estimatedWeeks} {t('developmentPlan.weeks', 'недель')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Steps */}
          <div className="lg:col-span-2">
            {/* Current Step Highlight */}
            {currentStep && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
                  <span className="animate-pulse">●</span>
                  {t('developmentPlan.currentStep', 'Текущий шаг')}
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{getStepTypeIcon(currentStep.type, currentStep.interviewType)}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {currentStep.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {currentStep.description}
                    </p>
                    {currentStep.type === 'codebattle' && currentStep.requiredTasks && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{t('developmentPlan.taskProgress', 'Прогресс')}</span>
                            <span>{currentStep.completedTasks || 0} / {currentStep.requiredTasks}</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${((currentStep.completedTasks || 0) / currentStep.requiredTasks) * 100}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          to="/codebattle"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          {t('developmentPlan.goToCodeBattle', 'Перейти')} →
                        </Link>
                      </div>
                    )}
                    {currentStep.type === 'roadmap' && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{t('developmentPlan.roadmapProgress', 'Прогресс')}</span>
                            <span>{currentStep.currentProgress || 0}%</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${currentStep.currentProgress || 0}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          to={`/roadmap/${currentStep.roadmapSlug}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          {t('developmentPlan.continue', 'Продолжить')} →
                        </Link>
                      </div>
                    )}
                    {currentStep.type === 'interview' && currentStep.requiredSessions && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{getInterviewTypeLabel(currentStep.interviewType)}</span>
                            <span>{currentStep.completedSessions || 0} / {currentStep.requiredSessions} {t('developmentPlan.successful', 'успешных')}</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${((currentStep.completedSessions || 0) / currentStep.requiredSessions) * 100}%` }}
                            />
                          </div>
                          {currentStep.interviewType === 'practice' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {t('developmentPlan.minPassScore', 'Минимум для зачёта')}: {currentStep.minPassPercentage || 70}%
                              {currentStep.practiceStats?.attempts ? (
                                <span className="ml-2">
                                  ({t('developmentPlan.totalAttempts', 'всего попыток')}: {currentStep.practiceStats.attempts})
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                        <Link
                          to="/interview"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          {t('developmentPlan.goToTrainer', 'Перейти')} →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* All Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('developmentPlan.planSteps', 'Шаги плана')}
                {stepsStats && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({stepsStats.completed}/{stepsStats.total})
                  </span>
                )}
              </h2>
              <div className="space-y-4">
                {steps?.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(step)}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 cursor-pointer hover:border-green-400 dark:hover:border-green-600'
                        : step.status === 'in_progress'
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600'
                        : step.status === 'locked'
                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getStepTypeIcon(step.type, step.interviewType)}</span>
                        <h3 className={`font-medium ${
                          step.status === 'locked' ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h3>
                        {step.type === 'interview' && step.interviewType && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            {getInterviewTypeLabel(step.interviewType)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                      {step.type === 'codebattle' && step.requiredTasks && step.status !== 'locked' && (
                        <div className="mt-2 text-sm text-gray-500">
                          {step.completedTasks || 0} / {step.requiredTasks} {t('developmentPlan.tasks', 'задач')}
                        </div>
                      )}
                      {step.type === 'roadmap' && step.status !== 'locked' && (
                        <div className="mt-2 text-sm text-gray-500">
                          {step.currentProgress || 0}% {t('developmentPlan.completed', 'пройдено')}
                        </div>
                      )}
                      {step.type === 'interview' && step.requiredSessions && step.status !== 'locked' && (
                        <div className="mt-2 text-sm text-gray-500">
                          {step.interviewType === 'practice' ? (
                            <>
                              {step.completedSessions || 0} / {step.requiredSessions} {t('developmentPlan.successful', 'успешных')}
                              {step.practiceStats?.attempts ? (
                                <span className="ml-2">
                                  ({t('developmentPlan.totalAttempts', 'всего попыток')}: {step.practiceStats.attempts})
                                </span>
                              ) : null}
                              <div className="text-xs text-gray-400 mt-1">
                                {t('developmentPlan.minPassScore', 'Минимум для зачёта')}: {step.minPassPercentage || 70}%
                              </div>
                            </>
                          ) : (
                            <>
                              {step.completedSessions || 0} / {step.requiredSessions} {t('developmentPlan.sessions', 'сессий')}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Кнопка завершения для roadmap */}
                    {step.status === 'in_progress' && step.type !== 'codebattle' && step.type !== 'interview' && (
                      // Для roadmap показываем кнопку только если прогресс >= 100%
                      step.type === 'roadmap' ? (
                        (step.currentProgress || 0) >= 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteStep(step.id);
                            }}
                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            title={t('developmentPlan.markComplete', 'Отметить выполненным')}
                          >
                            ✓
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteStep(step.id);
                          }}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          ✓
                        </button>
                      )
                    )}
                    {/* Иконка перехода для незаблокированных шагов */}
                    {step.status !== 'locked' && getStepUrl(step) && (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skill Progress */}
            {skillProgress && Object.keys(skillProgress).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('developmentPlan.skillProgress', 'Прогресс навыков')}
                </h2>
                <div className="space-y-3">
                  {Object.entries(skillProgress).map(([skill, progress]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {skill.replace('_', ' ')}
                        </span>
                        <span className={progress >= 100 ? 'text-green-600' : 'text-gray-500'}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/skills"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-4"
                >
                  {t('developmentPlan.viewRadar', 'Открыть радар навыков')} →
                </Link>
              </div>
            )}

            {/* Recommended Tasks */}
            {recommendedTasks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('developmentPlan.recommendedTasks', 'Рекомендуемые задачи')}
                </h2>
                <div className="space-y-3">
                  {recommendedTasks.slice(0, 5).map((task) => (
                    <Link
                      key={task.id}
                      to={`/codebattle/task/${task.id}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                          {task.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {task.difficulty}
                        </span>
                      </div>
                      {task.stepProgress && (
                        <div className="text-xs text-gray-500 mt-1">
                          {task.stepProgress}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <Link
                  to="/codebattle"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-4"
                >
                  {t('developmentPlan.allTasks', 'Все задачи')} →
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('developmentPlan.actions', 'Действия')}
              </h2>
              <div className="space-y-2">
                <Link
                  to="/development-plan/select"
                  className="block w-full text-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('developmentPlan.changePlan', 'Сменить цель')}
                </Link>
                <button
                  onClick={handleAbandon}
                  className="w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  {t('developmentPlan.abandonPlan', 'Отменить план')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDashboard;
