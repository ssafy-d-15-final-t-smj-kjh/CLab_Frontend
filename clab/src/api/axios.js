import axios from 'axios'
import router from '@/router'
import { authApi } from "./restApi"
import { useAuthStore } from "@/stores/auth"

const api = axios.create({
    baseURL: 'http://localhost:8080'
})

const noAuthUrls = [
    '/auth/login',
    '/auth/refresh',
    '/member/join',
]

const isNoAuthUrl = (url = '') => {
    return noAuthUrls.some(noAuthUrl => url.includes(noAuthUrl))
}

api.interceptors.request.use(
    config => {
        if (isNoAuthUrl(config.url)) {
            return config
        }

        const token = localStorage.getItem('accessToken')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    error => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response } = error;

        // 1. 응답이 없거나 401 에러가 아닌 경우 원래 에러 반환
        if (!response || response.status !== 401) {
            return Promise.reject(error);
        }

        const authStore = useAuthStore()
        const backendMessage = response.data.message || '알 수 없는 오류가 발생했습니다.';

        if (response.data.code === 'ERR-AUTH-002') {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Refresh token이 없습니다.');
                }
                const newAccessToken = await authApi.refresh().data.data

                if (!newAccessToken) {
                    authStore.logout()
                    alert('세션이 만료되었습니다. 다시 로그인해 주세요.')
                    router.push('/login')
                }
                console.log('newAccessToken 발급 완료', newAccessToken)
                localStorage.setItem('accessToken', newAccessToken)

                config.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(config);

            } catch (error) {
                console.log('axios.js - interceptors :', error)
                authStore.logout()
                alert('세션이 만료되었습니다. 다시 로그인해 주세요.')
                router.push('/login')
            }
        } else {
            alert(backendMessage)
            router.push('/login')
        }
    }
);

export default api

