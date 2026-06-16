import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useContentCategoryStore = defineStore("content-category", () => {
    const contentCategories = ref([])

    const fetchContentCategories = async (contentId) => {
        try {
            const response = await api.get(`/content-category/content/${contentId}`)
            const apiResponse = response.data
            contentCategories.value.push(...apiResponse.data)
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }
    const clearContentCategories = async () => {
        contentCategories.value = []
    }

    return { contentCategories, fetchContentCategories, clearContentCategories }
});
