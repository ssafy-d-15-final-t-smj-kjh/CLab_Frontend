import { defineStore } from "pinia";
import { ref } from "vue";
import { categoryApi } from "@/api/restApi";

export const useCategoryStore = defineStore("category", () => {
    const categories = ref([])

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getCategories()
            const apiResponse = response.data
            categories.value = apiResponse.data
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { categories, fetchCategories }
});
