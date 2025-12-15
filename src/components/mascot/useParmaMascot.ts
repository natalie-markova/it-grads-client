import { useCallback } from 'react';
import { useParmaContext, ParmaState } from './ParmaProvider';
import { useTranslation } from 'react-i18next';

export const useParmaMascot = () => {
  const { setState, setTemporaryState, hide, show, resetActivity } = useParmaContext();
  const { t } = useTranslation();

  const greet = useCallback((customMessage?: string) => {
    const msg = customMessage || t('parma.greeting', 'Привет! 👋');
    setTemporaryState('greeting', { text: msg }, 3000);
  }, [setTemporaryState, t]);

  const greetUser = useCallback((name: string) => {
    const msg = t('parma.greetingWithName', { name, defaultValue: `Привет, ${name}! 👋` });
    setTemporaryState('greeting', { text: msg }, 3000);
  }, [setTemporaryState, t]);

  const celebrate = useCallback((reason?: string) => {
    const msg = reason || t('parma.celebration', 'Отлично! 🎉');
    setTemporaryState('celebration', { text: msg }, 4000);
  }, [setTemporaryState, t]);

  const encourage = useCallback((tip?: string) => {
    const msg = tip || t('parma.encouragement', 'Не сдавайся, у тебя получится! 💪');
    setTemporaryState('idle', { text: msg }, 4000);
  }, [setTemporaryState, t]);

  const pointAt = useCallback((hint: string) => {
    setTemporaryState('pointing', { text: hint }, 5000);
  }, [setTemporaryState]);

  const think = useCallback((thought?: string) => {
    const msg = thought || t('parma.thinking', 'Хмм... 🤔');
    setState('thinking', { text: msg });
  }, [setState, t]);

  const sleep = useCallback(() => {
    setState('sleeping', { text: 'Zzz... 💤' });
  }, [setState]);

  const wakeUp = useCallback(() => {
    const msg = t('parma.welcomeBack', 'С возвращением! 😊');
    setTemporaryState('greeting', { text: msg }, 2500);
  }, [setTemporaryState, t]);

  const reset = useCallback(() => {
    setState('idle');
  }, [setState]);

  const codebattle = {
    matchStart: useCallback(() => {
      const msg = t('parma.codebattle.matchStart', 'Удачи в матче! 🎮');
      setTemporaryState('greeting', { text: msg }, 3000);
    }, [setTemporaryState, t]),

    thinkHard: useCallback(() => {
      const msg = t('parma.codebattle.thinkHard', 'Подумай ещё... 🤔');
      setState('thinking', { text: msg });
    }, [setState, t]),

    compileError: useCallback((line?: number) => {
      const msg = line
        ? t('parma.codebattle.compileErrorLine', { line, defaultValue: `Проверь строку ${line} 👀` })
        : t('parma.codebattle.compileError', 'Проверь синтаксис! 👀');
      setTemporaryState('pointing', { text: msg }, 5000);
    }, [setTemporaryState, t]),

    testFailed: useCallback(() => {
      const msg = t('parma.codebattle.testFailed', 'Почти! Проверь краевые случаи 🔍');
      setTemporaryState('pointing', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    allTestsPassed: useCallback(() => {
      const msg = t('parma.codebattle.allTestsPassed', 'Все тесты прошли! 🎉');
      setTemporaryState('celebration', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    victory: useCallback((ratingChange?: number) => {
      const msg = ratingChange
        ? t('parma.codebattle.victoryRating', { rating: ratingChange, defaultValue: `Победа! +${ratingChange} рейтинга! 🏆` })
        : t('parma.codebattle.victory', 'Победа! Ты молодец! 🏆');
      setTemporaryState('celebration', { text: msg }, 5000);
    }, [setTemporaryState, t]),

    defeat: useCallback(() => {
      const msg = t('parma.codebattle.defeat', 'В следующий раз получится! 💪');
      setTemporaryState('idle', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    waitingOpponent: useCallback(() => {
      const msg = t('parma.codebattle.waiting', 'Ищем соперника... ⏳');
      setState('idle', { text: msg });
    }, [setState, t]),
  };

  const interview = {
    start: useCallback(() => {
      const msg = t('parma.interview.start', 'Начинаем интервью! Удачи! 🎤');
      setTemporaryState('greeting', { text: msg }, 3000);
    }, [setTemporaryState, t]),

    goodAnswer: useCallback(() => {
      const msg = t('parma.interview.goodAnswer', 'Отличный ответ! 👏');
      setTemporaryState('celebration', { text: msg }, 3000);
    }, [setTemporaryState, t]),

    canImprove: useCallback((hint?: string) => {
      const msg = hint || t('parma.interview.canImprove', 'Хорошо, но можно дополнить 📝');
      setTemporaryState('pointing', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    weakAnswer: useCallback(() => {
      const msg = t('parma.interview.weakAnswer', 'Попробуй раскрыть тему глубже 💡');
      setTemporaryState('pointing', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    silent: useCallback(() => {
      const msg = t('parma.interview.silent', 'Не волнуйся, подумай ещё 🤔');
      setState('thinking', { text: msg });
    }, [setState, t]),

    passed: useCallback((score?: number) => {
      const msg = score
        ? t('parma.interview.passedScore', { score, defaultValue: `Интервью пройдено! Оценка: ${score}% 🎉` })
        : t('parma.interview.passed', 'Интервью пройдено! 🎉');
      setTemporaryState('celebration', { text: msg }, 5000);
    }, [setTemporaryState, t]),
  };

  const progress = {
    stepComplete: useCallback((stepName?: string) => {
      const msg = stepName
        ? t('parma.progress.stepCompleteNamed', { step: stepName, defaultValue: `"${stepName}" завершён! 🎯` })
        : t('parma.progress.stepComplete', 'Шаг завершён! 🎯');
      setTemporaryState('celebration', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    roadmapComplete: useCallback((roadmapName?: string) => {
      const msg = roadmapName
        ? t('parma.progress.roadmapCompleteNamed', { name: roadmapName, defaultValue: `${roadmapName} завершён! Ты супер! 🏆` })
        : t('parma.progress.roadmapComplete', 'Roadmap завершён! Ты супер! 🏆');
      setTemporaryState('celebration', { text: msg }, 5000);
    }, [setTemporaryState, t]),

    planCreated: useCallback(() => {
      const msg = t('parma.progress.planCreated', 'План создан! Вперёд к цели! 🚀');
      setTemporaryState('celebration', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    achievement: useCallback((achievementName?: string) => {
      const msg = achievementName
        ? t('parma.progress.achievementNamed', { name: achievementName, defaultValue: `Новое достижение: ${achievementName}! 🏅` })
        : t('parma.progress.achievement', 'Новое достижение! 🏅');
      setTemporaryState('celebration', { text: msg }, 5000);
    }, [setTemporaryState, t]),

    ratingUp: useCallback((points: number) => {
      const msg = t('parma.progress.ratingUp', { points, defaultValue: `+${points} к рейтингу! 📈` });
      setTemporaryState('celebration', { text: msg }, 3000);
    }, [setTemporaryState, t]),
  };

  const system = {
    networkError: useCallback(() => {
      const msg = t('parma.system.networkError', 'Проблемы с сетью... 📡');
      setTemporaryState('idle', { text: msg }, 4000);
    }, [setTemporaryState, t]),

    networkRestored: useCallback(() => {
      const msg = t('parma.system.networkRestored', 'Соединение восстановлено! 🌐');
      setTemporaryState('celebration', { text: msg }, 3000);
    }, [setTemporaryState, t]),

    loading: useCallback((what?: string) => {
      const msg = what
        ? t('parma.system.loadingWhat', { what, defaultValue: `Загружаю ${what}... ⏳` })
        : t('parma.system.loading', 'Загрузка... ⏳');
      setState('thinking', { text: msg });
    }, [setState, t]),

    loadingComplete: useCallback(() => {
      const msg = t('parma.system.loadingComplete', 'Готово! ✅');
      setTemporaryState('idle', { text: msg }, 2000);
    }, [setTemporaryState, t]),
  };

  return {
    greet,
    greetUser,
    celebrate,
    encourage,
    pointAt,
    think,
    sleep,
    wakeUp,
    reset,
    hide,
    show,
    resetActivity,

    codebattle,
    interview,
    progress,
    system,

    setState,
    setTemporaryState,
  };
};

export default useParmaMascot;
