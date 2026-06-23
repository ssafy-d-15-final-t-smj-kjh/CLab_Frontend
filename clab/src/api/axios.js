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
    response => response,
    async (error) => {
        const { config, response } = error;

        if (!response) {
            alert('네트워크 오류가 발생했습니다. 서버 상태를 확인해 주세요.');
            router.push('/error/network');
            return Promise.reject(error);
        }

        const status = response.status
        const errorCode = response.data?.code
        const errorMessage = response.data?.message

        const authStore = useAuthStore()

        if (status === 401) {
            if (errorCode === 'ERR-AUTH-002') {
                authStore.logout()
                alert('세션이 만료되었습니다. 다시 로그인해 주세요.')
                router.push('/login')
                return Promise.reject(error)
            } else if (errorCode === 'ERR-AUTH-001') {
                alert(errorMessage);
                return Promise.reject(error);
            } else {
                if (!config._retry) {
                    config._retry = true;

                    try {
                        const newAccessToken = await authStore.refreshToken();
                        config.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(config); // 성공하면 원래 하려던 요청 다시 보내기
                    } catch (refreshError) {
                        console.log('토큰 재발급 실패:', refreshError);
                        authStore.logout();
                        alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
                        router.push('/login');
                        return Promise.reject(refreshError);
                    }
                } else {
                    authStore.logout();
                    router.push('/login');
                    return Promise.reject(error);
                }
            }
        } else if (status === 403) {
            alert(errorMessage); // "접근 권한이 없습니다."
            router.push('/error/403');
            return Promise.reject(error);
        } else if (status === 404) {
            router.push('/error/404');
            return Promise.reject(error);
        } else if (status === 500) {
            router.push('/error/500');
            return Promise.reject(error);
        } else if (status === 400) {
            alert(errorMessage);
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api

