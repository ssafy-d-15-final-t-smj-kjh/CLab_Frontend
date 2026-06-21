import { defineStore } from "pinia";
import { ref } from "vue";
import { contentCategoryApi } from "@/api/restApi";

export const useContentCategoryStore = defineStore("content-category", () => {
    const contentCategories = ref([])

    const fetchContentCategories = async (contentId) => {
        try {
            const response = await contentCategoryApi.getContentCategoriesByContentId(contentId)
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
