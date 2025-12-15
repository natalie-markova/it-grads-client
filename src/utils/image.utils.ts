export const getImageUrl = (url: string | undefined | null): string => {
  if (!url || url.trim() === '') return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  }

  if (!url.startsWith('/') && !url.startsWith('http')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/avatars/${url}`;
  }
  
  return url;
};





