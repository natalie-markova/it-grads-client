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
    return config
})

$api.interceptors.response.use((response) => {
       if (response.data && typeof response.data.accessToken === 'string') {
           setAccessToken(response.data.accessToken)
       }
       return response
   }, async (error: AxiosError) => {
       const prevRequest = error.config as InternalAxiosRequestConfig & { sent?: boolean }
       if (error.response && error.response.status === 403 && !prevRequest.sent) {
           const refreshResponse = await axios(`${API_URL}/tokens/refresh`, { withCredentials: true })
           if (refreshResponse.data && typeof refreshResponse.data.accessToken === 'string') {
               accessToken = refreshResponse.data.accessToken
               prevRequest.sent = true
               prevRequest.headers.Authorization = "Bearer " + accessToken
               return $api(prevRequest)
           }
       }

       return Promise.reject(error)
});

