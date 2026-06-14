import axios from 'axios'
import { useRouter } from 'vue-router'

const api = axios.create({
    baseURL: 'http://localhost:8080'
})

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken')
        
        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`
        }

        return config
    }
)
api.interceptors.response.use(
    (response) => {
        // 응답이 성공적일 때는 그대로 반환
        return response;
    },
    async (error) => {
        const { config, response } = error;

        // 1. 백엔드에서 내려준 에러 코드가 TOKEN_EXPIRED(401)인지 확인
        if (response && response.status === 401 && response.data.code === 'ERR-AUTH-002') {

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Refresh token이 없습니다.');
                }

                // 2. 백엔드에 새로운 토큰 발급 요청 (이 주소는 백엔드 API 명세에 맞추세요)
                const refreshResponse = await axios.post('/auth/refresh', {
                    'Refresh-Token' : refreshToken
                });

                // 3. 새로 발급받은 Access Token을 localStorage에 저장
                const apiResponse = refreshResponse.data;
                const newAccessToken = apiResponse.data;
                localStorage.setItem('accessToken', newAccessToken);

                // 4. 실패했던 원래 요청(config)의 헤더를 새 토큰으로 교체하고 다시 요청!
                config.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(config);

            } catch (error) {
                // 5. 🚨 Refresh Token마저 만료되었거나 검증에 실패한 경우!
                // 여기서 작성자님이 말씀하신 "비우고 로그인 시키기" 로직이 실행됩니다.
                console.log('리프레시 토큰도 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                
                // 로그인 페이지로 강제 이동
                useRouter().push('/login');
                return Promise.reject(error);
            }
        }

        // 토큰 에러가 아닌 다른 에러면 그대로 에러를 뱉음
        return Promise.reject(error);
    }
)

export default api

