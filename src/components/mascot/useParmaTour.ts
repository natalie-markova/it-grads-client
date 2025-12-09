import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParmaContext, TourStepData } from './ParmaProvider';
import { speechService } from '../../services/speechService';
import { useTranslation } from 'react-i18next';

export interface TourStep extends TourStepData {}

const TOUR_STORAGE_KEY = 'parma_tour_completed';
const TOUR_MUTE_KEY = 'parma_tour_muted';

// Загрузка настройки звука
const loadMuteState = (): boolean => {
  try {
    return localStorage.getItem(TOUR_MUTE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const useParmaTour = () => {
  const { setState, setTemporaryState, tour, setTour } = useParmaContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(loadMuteState);

  const isTourCompleted = useCallback((role: string): boolean => {
    return localStorage.getItem(`${TOUR_STORAGE_KEY}_${role}`) === 'true';
  }, []);

  const markTourCompleted = useCallback((role: string): void => {
    localStorage.setItem(`${TOUR_STORAGE_KEY}_${role}`, 'true');
  }, []);

  const resetTourStatus = useCallback((role: string): void => {
    localStorage.removeItem(`${TOUR_STORAGE_KEY}_${role}`);
  }, []);

  // Переключение звука
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem(TOUR_MUTE_KEY, String(newValue));
      if (newValue) {
        speechService.stop();
      }
      return newValue;
    });
  }, []);

  /**
   * Озвучить текст (если звук включен)
   */
  const speak = useCallback((text: string): void => {
    if (isMuted) return;

    const isEn = i18n.language === 'en';
    speechService.speak({
      text,
      voice: isEn ? 'jane' : 'alena',
      emotion: 'good',
      speed: 1.1,
      lang: isEn ? 'en-US' : 'ru-RU'
    }).catch(console.error);
  }, [i18n.language, isMuted]);

  /**
   * Повторить озвучку текущего шага
   */
  const repeatCurrentStep = useCallback(() => {
    if (tour.isActive && tour.steps[tour.currentIndex]) {
      const step = tour.steps[tour.currentIndex];
      const voiceText = step.voiceText || step.text;

      const isEn = i18n.language === 'en';
      // Принудительно озвучить даже если muted (для кнопки повтора)
      speechService.speak({
        text: voiceText,
        voice: isEn ? 'jane' : 'alena',
        emotion: 'good',
        speed: 1.1,
        lang: isEn ? 'en-US' : 'ru-RU'
      }).catch(console.error);
    }
  }, [tour, i18n.language]);

  /**
   * Показать шаг
   */
  const showStep = useCallback((steps: TourStepData[], index: number) => {
    if (index < 0 || index >= steps.length) return;

    const step = steps[index];

    // Устанавливаем состояние маскота
    setState(step.state, { text: step.text });

    // Навигация если нужен другой роут
    if (step.route) {
      navigate(step.route);
    }

    // Озвучиваем
    const voiceText = step.voiceText || step.text;
    speak(voiceText);
  }, [setState, navigate, speak]);

  /**
   * Следующий шаг
   */
  const nextStep = useCallback(() => {
    setTour(prev => {
      if (!prev.isActive) return prev;

      const nextIndex = prev.currentIndex + 1;

      if (nextIndex < prev.steps.length) {
        // Показываем следующий шаг
        setTimeout(() => showStep(prev.steps, nextIndex), 100);
        return { ...prev, currentIndex: nextIndex };
      } else {
        // Тур завершён
        speechService.stop();
        setTemporaryState('celebration', {
          text: t('parmaTour.complete', 'Тур завершён! Удачи! 🎉')
        }, 4000);

        if (prev.role) {
          markTourCompleted(prev.role);
        }

        return { isActive: false, steps: [], currentIndex: 0, role: null };
      }
    });
  }, [setTour, showStep, setTemporaryState, t, markTourCompleted]);

  /**
   * Предыдущий шаг
   */
  const prevStep = useCallback(() => {
    setTour(prev => {
      if (!prev.isActive || prev.currentIndex <= 0) return prev;

      const prevIndex = prev.currentIndex - 1;
      setTimeout(() => showStep(prev.steps, prevIndex), 100);
      return { ...prev, currentIndex: prevIndex };
    });
  }, [setTour, showStep]);

  /**
   * Пропустить тур
   */
  const skipTour = useCallback(() => {
    speechService.stop();
    setState('idle');

    setTour(prev => {
      if (prev.role) {
        markTourCompleted(prev.role);
      }
      return { isActive: false, steps: [], currentIndex: 0, role: null };
    });
  }, [setState, setTour, markTourCompleted]);

  /**
   * Завершить тур
   */
  const completeTour = useCallback(() => {
    speechService.stop();
    setTemporaryState('celebration', {
      text: t('parmaTour.complete', 'Тур завершён! Удачи! 🎉')
    }, 4000);

    setTour(prev => {
      if (prev.role) {
        markTourCompleted(prev.role);
      }
      return { isActive: false, steps: [], currentIndex: 0, role: null };
    });
  }, [setTemporaryState, t, setTour, markTourCompleted]);

  /**
   * Запустить тур
   */
  const startTour = useCallback((role: 'graduate' | 'employer', steps: TourStepData[]) => {
    if (steps.length === 0) return;

    setTour({
      isActive: true,
      steps,
      currentIndex: 0,
      role
    });

    // Показываем первый шаг с задержкой
    setTimeout(() => showStep(steps, 0), 500);
  }, [setTour, showStep]);

  /**
   * Шаги для выпускника
   */
  const getGraduateSteps = useCallback((): TourStepData[] => [
    {
      id: 'welcome',
      title: t('parmaTour.graduate.welcome.title', 'Добро пожаловать!'),
      text: t('parmaTour.graduate.welcome.text', 'Привет! Я Парма, твой помощник на платформе IT-Grads! Давай я покажу тебе, как тут всё устроено.'),
      voiceText: t('parmaTour.graduate.welcome.voice', 'Привет! Я Парма, твой помощник на платформе Ай-Ти-Грэдс! Давай я покажу тебе, как тут всё устроено.'),
      state: 'greeting'
    },
    {
      id: 'profile',
      title: t('parmaTour.graduate.profile.title', 'Твой профиль'),
      text: t('parmaTour.graduate.profile.text', 'Здесь ты можешь заполнить своё резюме, добавить навыки и опыт. Чем полнее профиль — тем больше шансов найти работу!'),
      voiceText: t('parmaTour.graduate.profile.voice', 'Здесь ты можешь заполнить своё резюме, добавить навыки и опыт. Чем полнее профиль, тем больше шансов найти работу!'),
      state: 'pointing',
      route: '/profile/graduate'
    },
    {
      id: 'roadmap',
      title: t('parmaTour.graduate.roadmap.title', 'Карты развития'),
      text: t('parmaTour.graduate.roadmap.text', 'Выбери направление и следуй карте развития. Я буду помогать тебе на каждом шагу!'),
      voiceText: t('parmaTour.graduate.roadmap.voice', 'Выбери направление и следуй карте развития. Я буду помогать тебе на каждом шагу!'),
      state: 'pointing',
      route: '/roadmaps'
    },
    {
      id: 'codebattle',
      title: t('parmaTour.graduate.codebattle.title', 'CodeBattle'),
      text: t('parmaTour.graduate.codebattle.text', 'Тут можно практиковаться в программировании и соревноваться с другими! Решай задачи и повышай свой рейтинг.'),
      voiceText: t('parmaTour.graduate.codebattle.voice', 'Тут можно практиковаться в программировании и соревноваться с другими! Решай задачи и повышай свой рейтинг.'),
      state: 'celebration',
      route: '/codebattle'
    },
    {
      id: 'interview',
      title: t('parmaTour.graduate.interview.title', 'AI Интервью'),
      text: t('parmaTour.graduate.interview.text', 'Готовься к собеседованиям с искусственным интеллектом! Он задаст тебе вопросы и даст обратную связь.'),
      voiceText: t('parmaTour.graduate.interview.voice', 'Готовься к собеседованиям с искусственным интеллектом! Он задаст тебе вопросы и даст обратную связь.'),
      state: 'thinking',
      route: '/interview/practice'
    },
    {
      id: 'jobs',
      title: t('parmaTour.graduate.jobs.title', 'Вакансии'),
      text: t('parmaTour.graduate.jobs.text', 'Здесь собраны вакансии от работодателей. Откликайся и находи работу мечты!'),
      voiceText: t('parmaTour.graduate.jobs.voice', 'Здесь собраны вакансии от работодателей. Откликайся и находи работу мечты!'),
      state: 'pointing',
      route: '/jobs'
    },
    {
      id: 'complete',
      title: t('parmaTour.graduate.complete.title', 'Готово!'),
      text: t('parmaTour.graduate.complete.text', 'Теперь ты знаешь основы! Если что — я всегда рядом. Удачи в поиске работы! 🐕'),
      voiceText: t('parmaTour.graduate.complete.voice', 'Теперь ты знаешь основы! Если что, я всегда рядом. Удачи в поиске работы!'),
      state: 'celebration',
      route: '/profile/graduate'
    }
  ], [t]);

  /**
   * Шаги для работодателя
   */
  const getEmployerSteps = useCallback((): TourStepData[] => [
    {
      id: 'welcome',
      title: t('parmaTour.employer.welcome.title', 'Добро пожаловать!'),
      text: t('parmaTour.employer.welcome.text', 'Здравствуйте! Я Парма, помогу вам освоиться на платформе IT-Grads. Давайте посмотрим основные возможности.'),
      voiceText: t('parmaTour.employer.welcome.voice', 'Здравствуйте! Я Парма, помогу вам освоиться на платформе Ай-Ти-Грэдс. Давайте посмотрим основные возможности.'),
      state: 'greeting'
    },
    {
      id: 'profile',
      title: t('parmaTour.employer.profile.title', 'Профиль компании'),
      text: t('parmaTour.employer.profile.text', 'Заполните информацию о вашей компании. Это поможет кандидатам узнать вас лучше.'),
      voiceText: t('parmaTour.employer.profile.voice', 'Заполните информацию о вашей компании. Это поможет кандидатам узнать вас лучше.'),
      state: 'pointing',
      route: '/profile/employer'
    },
    {
      id: 'candidates',
      title: t('parmaTour.employer.candidates.title', 'Поиск кандидатов'),
      text: t('parmaTour.employer.candidates.text', 'Здесь вы найдёте выпускников с нужными навыками. Используйте фильтры для точного поиска.'),
      voiceText: t('parmaTour.employer.candidates.voice', 'Здесь вы найдёте выпускников с нужными навыками. Используйте фильтры для точного поиска.'),
      state: 'pointing',
      route: '/candidates'
    },
    {
      id: 'vacancies',
      title: t('parmaTour.employer.vacancies.title', 'Управление вакансиями'),
      text: t('parmaTour.employer.vacancies.text', 'Создавайте вакансии и получайте отклики от мотивированных кандидатов.'),
      voiceText: t('parmaTour.employer.vacancies.voice', 'Создавайте вакансии и получайте отклики от мотивированных кандидатов.'),
      state: 'pointing',
      route: '/profile/employer'
    },
    {
      id: 'messenger',
      title: t('parmaTour.employer.messenger.title', 'Мессенджер'),
      text: t('parmaTour.employer.messenger.text', 'Общайтесь с кандидатами напрямую через встроенный мессенджер.'),
      voiceText: t('parmaTour.employer.messenger.voice', 'Общайтесь с кандидатами напрямую через встроенный мессенджер.'),
      state: 'pointing',
      route: '/messenger'
    },
    {
      id: 'complete',
      title: t('parmaTour.employer.complete.title', 'Готово!'),
      text: t('parmaTour.employer.complete.text', 'Теперь вы готовы к работе! Если возникнут вопросы — я всегда рядом. Успехов в поиске талантов! 🐕'),
      voiceText: t('parmaTour.employer.complete.voice', 'Теперь вы готовы к работе! Если возникнут вопросы, я всегда рядом. Успехов в поиске талантов!'),
      state: 'celebration',
      route: '/profile/employer'
    }
  ], [t]);

  return {
    isActive: tour.isActive,
    currentStepIndex: tour.currentIndex,
    steps: tour.steps,
    currentStep: tour.steps[tour.currentIndex] || null,
    totalSteps: tour.steps.length,

    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,

    getGraduateSteps,
    getEmployerSteps,

    isTourCompleted,
    markTourCompleted,
    resetTourStatus,

    // Управление звуком
    isMuted,
    toggleMute,
    repeatCurrentStep
  };
};

export default useParmaTour;
