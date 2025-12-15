import { useEffect, useRef, useCallback } from 'react';
import { useParmaContext } from './ParmaProvider';

interface UseParmaFormWatcherOptions {
  thinkingTimeout?: number;
  showPointingOnOpen?: boolean;
  thinkingMessage?: string;
  pointingMessage?: string;
}

export const useParmaFormWatcher = (
  isFormOpen: boolean,
  options: UseParmaFormWatcherOptions = {}
) => {
  const {
    thinkingTimeout = 30000,
    showPointingOnOpen = true,
    thinkingMessage = 'Не торопись, подумай хорошо... 🤔',
    pointingMessage = 'Заполни форму! 📝',
  } = options;

  const { setTemporaryState, setState } = useParmaContext();
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpenRef = useRef(false);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    if (isFormOpen) {
      activityTimerRef.current = setTimeout(() => {
        setState('thinking', { text: thinkingMessage });
      }, thinkingTimeout);
    }
  }, [isFormOpen, thinkingTimeout, thinkingMessage, setState]);

  useEffect(() => {
    if (isFormOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;

      if (showPointingOnOpen) {
        setTemporaryState('pointing', { text: pointingMessage }, 3000);
      }

      thinkingTimerRef.current = setTimeout(() => {
        setState('thinking', { text: thinkingMessage });
      }, thinkingTimeout);

      const handleFormActivity = () => {
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

export const useParmaTaskWatcher = (
  isTaskActive: boolean,
  taskStartTime?: number
) => {
  const { setState, setTemporaryState } = useParmaContext();
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isTaskActive) {
      thinkingTimerRef.current = setTimeout(() => {
        setState('thinking', { text: 'Подумай ещё... Ты справишься! 🤔' });
      }, 120000);

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

  const onTaskSuccess = useCallback(() => {
    setTemporaryState('celebration', { text: 'Отлично! Задача решена! 🎉' }, 4000);
  }, [setTemporaryState]);

  const onTaskFail = useCallback(() => {
    setTemporaryState('idle', { text: 'Попробуй ещё раз! 💪' }, 3000);
  }, [setTemporaryState]);

  return { onTaskSuccess, onTaskFail };
};

export default useParmaFormWatcher;