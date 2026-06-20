import axios from 'axios'
import router from '@/router'

const api = axios.create({
    baseURL: 'http://localhost:8080'
})

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken')
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    }
)

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response } = error;

        if (!response || response.status !== 401) {
            return Promise.reject(error);
        }

        if (response.data.code === 'ERR-AUTH-002') {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Refresh token이 없습니다.');
                }

                const refreshResponse = await axios.post('http://localhost:8080/auth/refresh', {
                    'Refresh-Token': refreshToken
                });

                const apiResponse = refreshResponse.data;
                const newAccessToken = apiResponse.data;
                localStorage.setItem('accessToken', newAccessToken);

                config.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(config);

            } catch (refreshError) {
                return handleUnauthorized('세션이 만료되었습니다. 다시 로그인해 주세요.');
            }
        }
        return handleUnauthorized('로그인 후 이용해 주세요.😊');
    }
)

const handleUnauthorized = (message) => {
    console.warn(message);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    alert(message);
    router.push('/login'); 
    
    return Promise.reject(new Error(message));
}

export default api

