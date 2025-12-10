import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Типы состояний Пармы
export type ParmaState =
  | 'idle'        // Спокойно стоит
  | 'greeting'    // Приветствие
  | 'thinking'    // Думает
  | 'pointing'    // Указывает
  | 'celebration' // Празднует
  | 'sleeping';   // Спит

// Сообщение маскота
export interface ParmaMessage {
  text: string;
  duration?: number; // 0 = пока не сменится состояние
}

// Настройки маскота
export interface ParmaSettings {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  size: 'sm' | 'md' | 'lg';
  soundEnabled: boolean;
  showTips: boolean;
  idleTimeout: number; // мс до засыпания
}

// Шаг тура
export interface TourStepData {
  id: string;
  title: string;
  text: string;
  voiceText?: string;
  state: ParmaState;
  route?: string;
}

// Состояние тура
export interface TourState {
  isActive: boolean;
  steps: TourStepData[];
  currentIndex: number;
  role: 'graduate' | 'employer' | null;
}

// Контекст
interface ParmaContextType {
  state: ParmaState;
  message: ParmaMessage | null;
  isVisible: boolean;
  settings: ParmaSettings;
  setState: (state: ParmaState, message?: ParmaMessage) => void;
  setTemporaryState: (state: ParmaState, message?: ParmaMessage, duration?: number) => void;
  hide: () => void;
  show: () => void;
  updateSettings: (settings: Partial<ParmaSettings>) => void;
  resetActivity: () => void;
  // Тур
  tour: TourState;
  setTour: React.Dispatch<React.SetStateAction<TourState>>;
}

const defaultSettings: ParmaSettings = {
  enabled: true,
  position: 'bottom-right',
  size: 'md',
  soundEnabled: false,
  showTips: true,
  idleTimeout: 60000, // 1 минута до засыпания
};

const ParmaContext = createContext<ParmaContextType | null>(null);

// Загрузка настроек из localStorage
const loadSettings = (): ParmaSettings => {
  try {
    const saved = localStorage.getItem('parmaSettings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading Parma settings:', e);
  }
  return defaultSettings;
};

// Сохранение настроек в localStorage
const saveSettings = (settings: ParmaSettings) => {
  try {
    localStorage.setItem('parmaSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving Parma settings:', e);
  }
};

const defaultTourState: TourState = {
  isActive: false,
  steps: [],
  currentIndex: 0,
  role: null
};

export const ParmaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [state, setStateInternal] = useState<ParmaState>('idle');
  const [message, setMessage] = useState<ParmaMessage | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [settings, setSettings] = useState<ParmaSettings>(loadSettings);
  const [tour, setTour] = useState<TourState>(defaultTourState);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const idleTimeoutRef = useRef<NodeJS.Timeout>();
  const previousStateRef = useRef<ParmaState>('idle');

  const isRu = i18n.language === 'ru';

  // Сброс таймера бездействия
  const resetActivity = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Если спала - проснуться с приветствием
    if (state === 'sleeping') {
      setStateInternal('greeting');
      setMessage({ text: isRu ? 'С возвращением!' : 'Welcome back!', duration: 2000 });

      setTimeout(() => {
        setStateInternal('idle');
        setMessage(null);
      }, 2000);
    }

    // Установить таймер засыпания
    if (settings.enabled && settings.idleTimeout > 0) {
      idleTimeoutRef.current = setTimeout(() => {
        previousStateRef.current = state;
        setStateInternal('sleeping');
        setMessage({ text: 'Zzz...', duration: 0 });
      }, settings.idleTimeout);
    }
  }, [state, settings.enabled, settings.idleTimeout, isRu]);

  // Отслеживание активности пользователя
  useEffect(() => {
    const handleActivity = () => {
      resetActivity();
    };

    // Слушаем события активности
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Инициализация таймера
    resetActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);

      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [resetActivity]);

  // Установить состояние (постоянное)
  const setState = useCallback((newState: ParmaState, newMessage?: ParmaMessage) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    previousStateRef.current = state;
    setStateInternal(newState);
    setMessage(newMessage || null);

    // Сбросить таймер бездействия (кроме sleeping)
    if (newState !== 'sleeping') {
      resetActivity();
    }
  }, [state, resetActivity]);

  // Временное состояние (вернётся к idle)
  const setTemporaryState = useCallback((
    newState: ParmaState,
    newMessage?: ParmaMessage,
    duration = 3000
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    previousStateRef.current = state;
    setStateInternal(newState);
    setMessage(newMessage || null);

    timeoutRef.current = setTimeout(() => {
      setStateInternal('idle');
      setMessage(null);
    }, duration);

    resetActivity();
  }, [state, resetActivity]);

  // Скрыть маскота
  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Показать маскота
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Обновить настройки
  const updateSettings = useCallback((newSettings: Partial<ParmaSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  // Если маскот отключен в настройках
  if (!settings.enabled) {
    return <>{children}</>;
  }

  return (
    <ParmaContext.Provider value={{
      state,
      message,
      isVisible,
      settings,
      setState,
      setTemporaryState,
      hide,
      show,
      updateSettings,
      resetActivity,
      tour,
      setTour,
    }}>
      {children}
    </ParmaContext.Provider>
  );
};

// Хук для использования контекста
export const useParmaContext = () => {
  const context = useContext(ParmaContext);
  if (!context) {
    throw new Error('useParmaContext must be used within ParmaProvider');
  }
  return context;
};

export default ParmaProvider;
