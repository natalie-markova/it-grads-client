import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useParmaContext } from './ParmaProvider';

/**
 * Hook for tracking page transitions
 * and managing mascot state based on current route
 */
export const useParmaRouteWatcher = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const { setTemporaryState, setState } = useParmaContext();
  const prevPathRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);

  const isRu = i18n.language === 'ru';

  useEffect(() => {
    const path = location.pathname;
    const prevPath = prevPathRef.current;

    // First visit to site or home page - greeting
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      if (path === '/' || path === '/home') {
        setTemporaryState('greeting', {
          text: isRu ? 'Привет! Добро пожаловать! 👋' : 'Hi! Welcome! 👋'
        }, 3000);
      } else {
        // First visit not to home - short greeting
        setTemporaryState('greeting', {
          text: isRu ? 'Привет! 👋' : 'Hi! 👋'
        }, 2000);
      }
      prevPathRef.current = path;
      return;
    }

    // If path hasn't changed - do nothing
    if (prevPath === path) return;
    prevPathRef.current = path;

    // Home page - always greeting
    if (path === '/' || path === '/home') {
      setTemporaryState('greeting', {
        text: isRu ? 'С возвращением на главную! 🏠' : 'Welcome back home! 🏠'
      }, 3000);
      return;
    }

    // Calendar - pointing at calendar
    if (path === '/calendar' || path.startsWith('/calendar')) {
      setTemporaryState('pointing', {
        text: isRu ? 'Тут можно запланировать собеседование! 📅' : 'Schedule your interviews here! 📅'
      }, 4000);
      return;
    }

    // Interview tracker (/interview/tracker)
    if (path === '/interview/tracker' || path.startsWith('/interview/tracker')) {
      setTemporaryState('pointing', {
        text: isRu ? 'Планируй собеседования и следи за прогрессом! 📋' : 'Plan interviews and track your progress! 📋'
      }, 4000);
      return;
    }

    // Trainer (practice) - /interview but NOT /interview/tracker
    if (path === '/interview' || (path.startsWith('/interview') && !path.startsWith('/interview/tracker'))) {
      setTemporaryState('pointing', {
        text: isRu ? 'Время попрактиковаться! 💪' : 'Time to practice! 💪'
      }, 3000);
      return;
    }

    // CodeBattle
    if (path === '/codebattle' || path.startsWith('/codebattle')) {
      setTemporaryState('greeting', {
        text: isRu ? 'Удачи в бою! ⚔️' : 'Good luck in battle! ⚔️'
      }, 3000);
      return;
    }

    // Development plan
    if (path === '/development-plan' || path.startsWith('/development-plan')) {
      setTemporaryState('pointing', {
        text: isRu ? 'Твой путь к успеху! 🚀' : 'Your path to success! 🚀'
      }, 3000);
      return;
    }

    // Roadmap
    if (path.startsWith('/roadmap')) {
      setTemporaryState('pointing', {
        text: isRu ? 'Изучай и отмечай прогресс! 🗺️' : 'Learn and track your progress! 🗺️'
      }, 3000);
      return;
    }

    // Profile
    if (path === '/profile' || path.startsWith('/profile')) {
      setTemporaryState('idle', {
        text: isRu ? 'Твой профиль' : 'Your profile'
      }, 2000);
      return;
    }

    // Settings / Change password
    if (path === '/settings' || path === '/change-password') {
      setState('thinking', {
        text: isRu ? 'Настройки... 🤔' : 'Settings... 🤔'
      });
      return;
    }

    // Registration / Login
    if (path === '/register' || path === '/login' || path === '/signup') {
      setState('thinking', {
        text: isRu ? 'Секунду...' : 'One moment...'
      });
      return;
    }

    // Skills/Radar
    if (path === '/skills' || path.startsWith('/skills')) {
      setTemporaryState('pointing', {
        text: isRu ? 'Твои навыки растут! 📊' : 'Your skills are growing! 📊'
      }, 3000);
      return;
    }

    // For all other pages - normal state
    setState('idle');
  }, [location.pathname, setTemporaryState, setState, isRu]);
};

export default useParmaRouteWatcher;
