// Экспорт всех компонентов маскота
export { ParmaProvider, useParmaContext } from './ParmaProvider';
export type { ParmaState, ParmaMessage, ParmaSettings, TourState, TourStepData } from './ParmaProvider';

export { Parma } from './Parma';
export { useParmaMascot } from './useParmaMascot';

// Тур
export { ParmaTour, ParmaTourOverlay, TourStartButton } from './ParmaTour';
export { useParmaTour } from './useParmaTour';
export type { TourStep } from './useParmaTour';

// Отслеживание роутов и событий
export { ParmaRouteWatcher } from './ParmaRouteWatcher';
export { useParmaRouteWatcher } from './useParmaRouteWatcher';
export { useParmaFormWatcher, useParmaTaskWatcher } from './useParmaFormWatcher';
export { useParmaEvents } from './useParmaEvents';
