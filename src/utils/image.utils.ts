/**
 * Функция для формирования полного URL изображения
 * Обрабатывает относительные пути и добавляет базовый URL сервера
 */
export const getImageUrl = (url: string | undefined | null): string => {
  if (!url || url.trim() === '') return '';
  
  // Если URL уже полный (начинается с http), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Если это относительный путь к загруженному файлу, добавляем базовый URL сервера
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  }
  
  // Если это просто путь без слеша в начале, добавляем базовый URL
  if (!url.startsWith('/') && !url.startsWith('http')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/avatars/${url}`;
  }
  
  return url;
};

