import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const $api = axios.create({
   baseURL: API_URL,
   withCredentials: true
});

let accessToken: string = localStorage.getItem('accessToken') || ''

export const setAccessToken = (newToken: string): void => {
    accessToken = newToken
    localStorage.setItem('accessToken', newToken)
}

export const getAccessToken = (): string => {
    return accessToken
}

export const clearAccessToken = (): void => {
    accessToken = ''
    localStorage.removeItem('accessToken')
}

$api.interceptors.request.use((config) => {
    if (config.headers && !config.headers.Authorization) {
        config.headers.Authorization = "Bearer " + accessToken
    }
    // Add Accept-Language header based on current i18n language
    const currentLang = localStorage.getItem('i18nextLng') || 'ru';
    config.headers['Accept-Language'] = currentLang;
    return config
})

$api.interceptors.response.use((response) => {
       if (response.data && typeof response.data.accessToken === 'string') {
           setAccessToken(response.data.accessToken)
       }
       return response
   }, async (error: AxiosError) => {
       const prevRequest = error.config as InternalAxiosRequestConfig & { sent?: boolean }
       if (error.response && error.response.status === 401 && !prevRequest.sent) {
           if (prevRequest.url?.includes('/tokens/refresh')) {
               clearAccessToken()
               return Promise.reject(error)
           }

           try {
               const refreshResponse = await axios.post(`${API_URL}/tokens/refresh`, {}, { withCredentials: true })
               if (refreshResponse.data && typeof refreshResponse.data.accessToken === 'string') {
                   setAccessToken(refreshResponse.data.accessToken)
                   prevRequest.sent = true
                   prevRequest.headers.Authorization = "Bearer " + refreshResponse.data.accessToken
                   return $api(prevRequest)
               }
           } catch (refreshError: any) {
               if (refreshError.response?.status === 401) {
                   clearAccessToken()
               }
               return Promise.reject(refreshError)
           }
       }

       return Promise.reject(error)
});

