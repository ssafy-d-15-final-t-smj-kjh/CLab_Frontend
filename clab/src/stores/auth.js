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
        try {
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
        } catch (error) {
            console.log('auth.js - login :', error)
        }
    };

    const logout = async () => {
        accessToken.value = null;
        userInfo.value = null;

        localStorage.removeItem("accessToken");
    };

    const fetchUserInfo = async () => {
        try {
            const response = await memberApi.getMe()
            const apiResponse = response.data;
            userInfo.value = apiResponse.data;
        } catch (error) {
            console.error('auth.js - fetchUserInfo :', error)
        }
    }

    const refreshToken = async () => {
        try {
            const response = await authApi.refresh()
            const apiResponse = response?.data
            const newAccessToken = apiResponse?.data

            if (!newAccessToken) return

            localStorage.setItem('accessToken', newAccessToken)
            accessToken.value = newAccessToken;
        } catch (error) {
            console.log('auth.js - refreshToken :', error)
        }
    }

    return {
        accessToken, userInfo, isLoggedIn, userId,
        login, logout, fetchUserInfo, refreshToken
    }


});
