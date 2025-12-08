import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParmaContext } from './ParmaProvider';

/**
 * Hook for triggering mascot events
 * Used for reacting to various user achievements and actions
 */
export const useParmaEvents = () => {
  const { setTemporaryState } = useParmaContext();
  const { i18n } = useTranslation();

  const isRu = i18n.language === 'ru';

  // ==========================================
  // CodeBattle Events
  // ==========================================

  /** CodeBattle win */
  const onCodeBattleWin = useCallback((ratingChange?: number) => {
    const msg = ratingChange
      ? isRu ? `Победа! +${ratingChange} к рейтингу! 🏆` : `Victory! +${ratingChange} rating! 🏆`
      : isRu ? 'Победа! Ты молодец! 🏆' : 'Victory! Well done! 🏆';
    setTemporaryState('celebration', { text: msg }, 5000);
  }, [setTemporaryState, isRu]);

  /** CodeBattle loss */
  const onCodeBattleLose = useCallback(() => {
    setTemporaryState('idle', {
      text: isRu ? 'В следующий раз получится! 💪' : "You'll get it next time! 💪"
    }, 4000);
  }, [setTemporaryState, isRu]);

  /** Task solved */
  const onTaskSolved = useCallback(() => {
    setTemporaryState('celebration', {
      text: isRu ? 'Задача решена! 🎯' : 'Task solved! 🎯'
    }, 3000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // Roadmap Events
  // ==========================================

  /** Roadmap progress marked */
  const onRoadmapProgress = useCallback((_progress?: number, roadmapName?: string) => {
    const msg = roadmapName
      ? isRu ? `"${roadmapName}" прогресс сохранён! 📍` : `"${roadmapName}" progress saved! 📍`
      : isRu ? 'Прогресс сохранён! 📍' : 'Progress saved! 📍';
    setTemporaryState('celebration', { text: msg }, 3000);
  }, [setTemporaryState, isRu]);

  /** Roadmap fully completed */
  const onRoadmapComplete = useCallback((roadmapName?: string) => {
    const msg = roadmapName
      ? isRu ? `${roadmapName} завершён! Ты супер! 🏆` : `${roadmapName} completed! You're awesome! 🏆`
      : isRu ? 'Roadmap завершён! Ты супер! 🏆' : "Roadmap completed! You're awesome! 🏆";
    setTemporaryState('celebration', { text: msg }, 5000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // Development Plan Events
  // ==========================================

  /** Plan progress increased */
  const onPlanProgress = useCallback((progress?: number) => {
    const msg = progress
      ? isRu ? `План развития: ${progress}%! Так держать! 📈` : `Development plan: ${progress}%! Keep going! 📈`
      : isRu ? 'Прогресс увеличился! 📈' : 'Progress increased! 📈';
    setTemporaryState('celebration', { text: msg }, 4000);
  }, [setTemporaryState, isRu]);

  /** Plan step completed */
  const onPlanStepComplete = useCallback((stepName?: string) => {
    const msg = stepName
      ? isRu ? `Шаг "${stepName}" завершён! 🎯` : `Step "${stepName}" completed! 🎯`
      : isRu ? 'Шаг завершён! Двигайся дальше! 🎯' : 'Step completed! Keep moving! 🎯';
    setTemporaryState('celebration', { text: msg }, 4000);
  }, [setTemporaryState, isRu]);

  /** Plan fully completed */
  const onPlanComplete = useCallback(() => {
    setTemporaryState('celebration', {
      text: isRu ? 'План развития выполнен! Ты герой! 🎉🏆' : "Development plan completed! You're a hero! 🎉🏆"
    }, 6000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // Trainer Events
  // ==========================================

  /** Successful trainer completion (>= 70%) */
  const onTrainerSuccess = useCallback((score: number, type?: string) => {
    const typeLabel = type === 'practice'
      ? (isRu ? 'Практика' : 'Practice')
      : type === 'ai'
        ? (isRu ? 'AI-интервью' : 'AI Interview')
        : (isRu ? 'Тренажёр' : 'Trainer');
    setTemporaryState('celebration', {
      text: `${typeLabel}: ${score}%! ${isRu ? 'Отлично!' : 'Excellent!'} 🎉`
    }, 4000);
  }, [setTemporaryState, isRu]);

  /** Unsuccessful trainer completion (< 70%) */
  const onTrainerFail = useCallback((score: number) => {
    setTemporaryState('idle', {
      text: `${score}%... ${isRu ? 'Попробуй ещё!' : 'Try again!'} 💪`
    }, 4000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // Calendar Events
  // ==========================================

  /** Interview scheduled */
  const onInterviewScheduled = useCallback(() => {
    setTemporaryState('celebration', {
      text: isRu ? 'Собеседование запланировано! Удачи! 📅' : 'Interview scheduled! Good luck! 📅'
    }, 4000);
  }, [setTemporaryState, isRu]);

  /** Interview reminder */
  const onInterviewReminder = useCallback((time?: string) => {
    const msg = time
      ? isRu ? `Скоро собеседование в ${time}! 🔔` : `Interview coming up at ${time}! 🔔`
      : isRu ? 'Не забудь про собеседование! 🔔' : "Don't forget about your interview! 🔔";
    setTemporaryState('pointing', { text: msg }, 5000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // Account Events
  // ==========================================

  /** Account created */
  const onAccountCreated = useCallback((name?: string) => {
    const msg = name
      ? isRu ? `Добро пожаловать, ${name}! 🎉` : `Welcome, ${name}! 🎉`
      : isRu ? 'Добро пожаловать! 🎉' : 'Welcome! 🎉';
    setTemporaryState('celebration', { text: msg }, 4000);
  }, [setTemporaryState, isRu]);

  /** Password changed */
  const onPasswordChanged = useCallback(() => {
    setTemporaryState('thinking', {
      text: isRu ? 'Пароль изменён! Запомни его! 🔐' : 'Password changed! Remember it! 🔐'
    }, 3000);
  }, [setTemporaryState, isRu]);

  /** Profile updated */
  const onProfileUpdated = useCallback(() => {
    setTemporaryState('celebration', {
      text: isRu ? 'Профиль обновлён! ✅' : 'Profile updated! ✅'
    }, 3000);
  }, [setTemporaryState, isRu]);

  // ==========================================
  // General Events
  // ==========================================

  /** Any achievement */
  const onAchievement = useCallback((achievementName?: string) => {
    const msg = achievementName
      ? isRu ? `Новое достижение: ${achievementName}! 🏅` : `New achievement: ${achievementName}! 🏅`
      : isRu ? 'Новое достижение! 🏅' : 'New achievement! 🏅';
    setTemporaryState('celebration', { text: msg }, 5000);
  }, [setTemporaryState, isRu]);

  /** Network error */
  const onNetworkError = useCallback(() => {
    setTemporaryState('idle', {
      text: isRu ? 'Проблемы с сетью... 📡' : 'Network issues... 📡'
    }, 4000);
  }, [setTemporaryState, isRu]);

  /** Network restored */
  const onNetworkRestored = useCallback(() => {
    setTemporaryState('celebration', {
      text: isRu ? 'Соединение восстановлено! 🌐' : 'Connection restored! 🌐'
    }, 3000);
  }, [setTemporaryState, isRu]);

  return {
    // CodeBattle
    onCodeBattleWin,
    onCodeBattleLose,
    onTaskSolved,

    // Roadmap
    onRoadmapProgress,
    onRoadmapComplete,

    // Development Plan
    onPlanProgress,
    onPlanStepComplete,
    onPlanComplete,

    // Trainer
    onTrainerSuccess,
    onTrainerFail,

    // Calendar
    onInterviewScheduled,
    onInterviewReminder,

    // Account
    onAccountCreated,
    onPasswordChanged,
    onProfileUpdated,

    // General
    onAchievement,
    onNetworkError,
    onNetworkRestored,
  };
};

export default useParmaEvents;
