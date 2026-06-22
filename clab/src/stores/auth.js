import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { memberApi } from "@/api/restApi";
import { authApi } from "@/api/restApi";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore("auth", () => {
    const accessToken = ref(localStorage.getItem("accessToken") || null);
    const userInfo = ref(null);
    const isLoggedIn = computed(() => accessToken.value !== null);

    const userId = computed(() => {
        if (!accessToken.value) return null;
        try {
            const decoded = jwtDecode(accessToken.value);
            return decoded.id;
        } catch (error) {
            return null;
        }
    })

    const login = async (dto) => {
        const response = await authApi.login(dto)
        const apiResponse = response.data
        const tokens = apiResponse.data

        if (!tokens || !tokens.accessToken) {
            console.log('토큰이 없습니다.')
            return
        }

        localStorage.setItem("accessToken", tokens.accessToken);

        accessToken.value = tokens.accessToken

        await fetchUserInfo()
        console.log(userInfo.value)
    };

    const logout = async () => {
        accessToken.value = null;
        userInfo.value = null;

        localStorage.removeItem("accessToken");
    };

    const fetchUserInfo = async () => {
        if (!userId.value) return

        try {
            const response = await memberApi.getMe()
            const apiResponse = response.data;
            userInfo.value = apiResponse.data;
            console.log('userInfo', userInfo.value)
        } catch (error) {
            console.error('auth.js - fetchUserInfo :', error)
        }
    }

    const refreshToken = async () => {
        try {
            const response = await authApi.refresh()
            const apiResponse = response?.data
            const newAccessToken = apiResponse?.data

            if (!newAccessToken) {
                throw new Error('새로운 access 토큰이 없습니다.')
            }

            console.log('accessToken 발급 완료 :', newAccessToken)

            localStorage.setItem('accessToken', newAccessToken)
            accessToken.value = newAccessToken;

            return newAccessToken
        } catch (error) {
            console.log('토큰 재발급 실패 : ', error)
            throw error
        }
    }

    return {
        accessToken, userInfo, isLoggedIn, userId,
        login, logout, fetchUserInfo, refreshToken
    }


});
