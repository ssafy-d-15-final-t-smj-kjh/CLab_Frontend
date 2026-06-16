import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useCategoryStore = defineStore("category", () => {
    const categories = ref([])

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/category`)
            const apiResponse = response.data
            categories.value = apiResponse.data
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { categories, fetchCategories }
});
