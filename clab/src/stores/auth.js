import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";
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

    const login = (tokens) => {
        accessToken.value = tokens.accessToken;
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
    };

    const logout = () => {
        accessToken.value = null;
        userInfo.value = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    const fetchUserInfo = async () => {
        if (!userId.value) return 

        try {
            const response = await api.get(`/member/me`)
            const apiResponse = response.data;
            userInfo.value = apiResponse.data;
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error)
        }
    }

    return { 
        accessToken, userInfo, isLoggedIn, userId, 
        login, logout, fetchUserInfo 
    }
});
