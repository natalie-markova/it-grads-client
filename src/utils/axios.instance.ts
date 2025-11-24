import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const $api = axios.create({
   baseURL: 'http://localhost:5001/api',
   withCredentials: true
});

let accessToken: string = ''

export const setAccessToken = (newToken: string): void => {
    accessToken = newToken
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
           const refreshResponse = await axios("http://localhost:5001/api/tokens/refresh", { withCredentials: true })
           if (refreshResponse.data && typeof refreshResponse.data.accessToken === 'string') {
               accessToken = refreshResponse.data.accessToken
               prevRequest.sent = true
               prevRequest.headers.Authorization = "Bearer " + accessToken
               return $api(prevRequest)
           }
       }

       return Promise.reject(error)
});

