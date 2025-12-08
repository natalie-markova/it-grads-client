import { useEffect, useRef, useCallback } from 'react';
import { useParmaContext } from './ParmaProvider';

interface UseParmaFormWatcherOptions {
  /** Таймаут до показа thinking при заполнении (мс) */
  thinkingTimeout?: number;
  /** Показывать pointing при открытии формы */
  showPointingOnOpen?: boolean;
  /** Сообщение при долгом заполнении */
  thinkingMessage?: string;
  /** Сообщение при открытии формы */
  pointingMessage?: string;
}

/**
 * Хук для отслеживания работы с формами
 * - При открытии формы показывает pointing
 * - При долгом заполнении показывает thinking
 * - При завершении возвращает в idle
 */
export const useParmaFormWatcher = (
  isFormOpen: boolean,
  options: UseParmaFormWatcherOptions = {}
) => {
  const {
    thinkingTimeout = 30000, // 30 секунд
    showPointingOnOpen = true,
    thinkingMessage = 'Не торопись, подумай хорошо... 🤔',
    pointingMessage = 'Заполни форму! 📝',
  } = options;

  const { setTemporaryState, setState } = useParmaContext();
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpenRef = useRef(false);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Сброс таймера активности при взаимодействии с формой
  const resetActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // Если форма открыта и пользователь перестал взаимодействовать на 30 сек - thinking
    if (isFormOpen) {
      activityTimerRef.current = setTimeout(() => {
        setState('thinking', { text: thinkingMessage });
      }, thinkingTimeout);
    }
  }, [isFormOpen, thinkingTimeout, thinkingMessage, setState]);

  useEffect(() => {
    // Форма только что открылась
    if (isFormOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;

      if (showPointingOnOpen) {
        setTemporaryState('pointing', { text: pointingMessage }, 3000);
      }

      // Запускаем таймер на thinking
      thinkingTimerRef.current = setTimeout(() => {
        setState('thinking', { text: thinkingMessage });
      }, thinkingTimeout);

      // Слушаем активность в форме
      const handleFormActivity = () => {
        // Если был thinking - возвращаем в idle
        setState('idle');
        resetActivityTimer();
      };

      document.addEventListener('input', handleFormActivity);
      document.addEventListener('change', handleFormActivity);
      document.addEventListener('click', handleFormActivity);

      return () => {
        document.removeEventListener('input', handleFormActivity);
        document.removeEventListener('change', handleFormActivity);
        document.removeEventListener('click', handleFormActivity);
      };
    }

    // Форма закрылась
    if (!isFormOpen && wasOpenRef.current) {
      wasOpenRef.current = false;

      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }

      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
        activityTimerRef.current = null;
      }

      setState('idle');
    }

    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [isFormOpen, showPointingOnOpen, thinkingTimeout, thinkingMessage, pointingMessage, setTemporaryState, setState, resetActivityTimer]);

  return { resetActivityTimer };
};

/**
 * Хук для отслеживания долгого решения задачи (CodeBattle)
 */
export const useParmaTaskWatcher = (
  isTaskActive: boolean,
  taskStartTime?: number
) => {
  const { setState, setTemporaryState } = useParmaContext();
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isTaskActive) {
      // Через 2 минуты - thinking
      thinkingTimerRef.current = setTimeout(() => {
        setState('thinking', { text: 'Подумай ещё... Ты справишься! 🤔' });
      }, 120000); // 2 минуты

      return () => {
        if (thinkingTimerRef.current) {
          clearTimeout(thinkingTimerRef.current);
        }
      };
    } else {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setState('idle');
    }
  }, [isTaskActive, setState]);

  // Метод для вызова при успешном решении
  const onTaskSuccess = useCallback(() => {
    setTemporaryState('celebration', { text: 'Отлично! Задача решена! 🎉' }, 4000);
  }, [setTemporaryState]);

  // Метод для вызова при неудаче
  const onTaskFail = useCallback(() => {
    setTemporaryState('idle', { text: 'Попробуй ещё раз! 💪' }, 3000);
  }, [setTemporaryState]);

  return { onTaskSuccess, onTaskFail };
};

export default useParmaFormWatcher;