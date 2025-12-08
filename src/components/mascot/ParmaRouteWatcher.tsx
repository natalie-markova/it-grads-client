import React from 'react';
import { useParmaRouteWatcher } from './useParmaRouteWatcher';

/**
 * Компонент-обёртка для хука отслеживания роутов
 * Должен быть размещён внутри Router и ParmaProvider
 */
export const ParmaRouteWatcher: React.FC = () => {
  useParmaRouteWatcher();
  return null;
};

export default ParmaRouteWatcher;