import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useParmaTour } from './useParmaTour';
import { useTranslation } from 'react-i18next';

/**
 * Глобальный UI тура - рендерится в App.tsx
 * Отображает панель управления туром, когда тур активен
 */
export const ParmaTourOverlay: React.FC = () => {
  const { t } = useTranslation();
  const {
    isActive,
    currentStepIndex,
    totalSteps,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
    isMuted,
    toggleMute,
    repeatCurrentStep
  } = useParmaTour();

  const panelRef = useRef<HTMLDivElement>(null);

  // Поддержка клавиатуры
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentStepIndex > 0) {
            prevStep();
          }
          break;
        case 'Escape':
          e.preventDefault();
          skipTour();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          repeatCurrentStep();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour, currentStepIndex, repeatCurrentStep, toggleMute]);

  // Фокус на панель при активации
  useEffect(() => {
    if (isActive && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isActive, currentStepIndex]);

  if (!isActive || !currentStep) return null;

  // Иконка для текущего шага
  const getStepIcon = () => {
    switch (currentStep.id) {
      case 'welcome': return '👋';
      case 'profile': return '👤';
      case 'roadmap': return '🗺️';
      case 'codebattle': return '⚔️';
      case 'interview': return '🤖';
      case 'jobs': return '💼';
      case 'candidates': return '👥';
      case 'vacancies': return '📋';
      case 'messenger': return '💬';
      case 'complete': return '🎉';
      default: return '📍';
    }
  };

  return (
    <>
      {/* Оверлей с градиентом */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10 z-[999] pointer-events-none" />

      {/* Панель управления туром */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1002] animate-fade-in outline-none"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[360px] max-w-[440px]">
          {/* Заголовок с градиентом */}
          <div className="bg-gradient-to-r from-accent-cyan to-accent-blue px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStepIcon()}</span>
                <h3 className="font-semibold text-white text-lg">
                  {currentStep?.title}
                </h3>
              </div>
              <button
                onClick={skipTour}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title={`${t('parmaTour.skip', 'Пропустить тур')} (Esc)`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Контент */}
          <div className="p-5">
            {/* Текст */}
            <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-base">
              {currentStep?.text}
            </p>

            {/* Прогресс */}
            <div className="flex items-center gap-1.5 mb-5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i < currentStepIndex
                      ? 'bg-accent-cyan'
                      : i === currentStepIndex
                      ? 'bg-accent-cyan animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Кнопки */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Счётчик шагов */}
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {currentStepIndex + 1} из {totalSteps}
                </span>

                {/* Кнопка повтора озвучки */}
                <button
                  onClick={repeatCurrentStep}
                  className="p-1.5 text-gray-400 hover:text-accent-cyan hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={`${t('parmaTour.repeat', 'Повторить')} (R)`}
                >
                  <RotateCcw size={16} />
                </button>

                {/* Кнопка вкл/выкл звука */}
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isMuted
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-400 hover:text-accent-cyan hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={isMuted ? `${t('parmaTour.unmute', 'Включить звук')} (M)` : `${t('parmaTour.mute', 'Выключить звук')} (M)`}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Назад */}
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className={`p-2.5 rounded-lg transition-all ${
                    currentStepIndex === 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                  }`}
                  title={`${t('parmaTour.prev', 'Назад')} (←)`}
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Далее / Завершить */}
                <button
                  onClick={nextStep}
                  className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-blue hover:to-accent-cyan text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-accent-cyan/25 active:scale-95"
                  title={currentStepIndex === totalSteps - 1
                    ? `${t('parmaTour.finish', 'Готово')} (Enter)`
                    : `${t('parmaTour.next', 'Далее')} (→)`
                  }
                >
                  {currentStepIndex === totalSteps - 1 ? (
                    <>
                      {t('parmaTour.finish', 'Готово')}
                      <SkipForward size={18} />
                    </>
                  ) : (
                    <>
                      {t('parmaTour.next', 'Далее')}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Подсказка по клавиатуре */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                {t('parmaTour.keyboardHint', 'Клавиши: ← → для навигации, Esc для выхода, R для повтора')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ParmaTourProps {
  role: 'graduate' | 'employer';
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

/**
 * Компонент для запуска тура - рендерится на странице профиля
 * Запускает тур, но UI рендерится через ParmaTourOverlay
 */
export const ParmaTour: React.FC<ParmaTourProps> = ({
  role,
  autoStart = false
}) => {
  const {
    isActive,
    startTour,
    getGraduateSteps,
    getEmployerSteps,
    isTourCompleted
  } = useParmaTour();

  const tourStartedRef = useRef(false);

  // Автозапуск тура (один раз)
  useEffect(() => {
    if (autoStart && !tourStartedRef.current && !isTourCompleted(role) && !isActive) {
      tourStartedRef.current = true;
      const steps = role === 'graduate' ? getGraduateSteps() : getEmployerSteps();
      startTour(role, steps);
    }
  }, [autoStart, role, isTourCompleted, getGraduateSteps, getEmployerSteps, startTour, isActive]);

  // Этот компонент не рендерит UI - UI рендерится через ParmaTourOverlay в App.tsx
  return null;
};

/**
 * Компонент для запуска тура вручную
 */
interface TourStartButtonProps {
  role: 'graduate' | 'employer';
  className?: string;
}

export const TourStartButton: React.FC<TourStartButtonProps> = ({ role, className = '' }) => {
  const { t } = useTranslation();
  const {
    isActive,
    startTour,
    getGraduateSteps,
    getEmployerSteps
  } = useParmaTour();

  const handleStart = () => {
    const steps = role === 'graduate' ? getGraduateSteps() : getEmployerSteps();
    startTour(role, steps);
  };

  if (isActive) return null;

  return (
    <button
      onClick={handleStart}
      className={`px-4 py-2 bg-accent-cyan hover:bg-accent-blue text-white rounded-lg font-medium transition-colors ${className}`}
    >
      {t('parmaTour.startTour', 'Начать тур')}
    </button>
  );
};

export default ParmaTour;
