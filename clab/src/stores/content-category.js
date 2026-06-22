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
            console.error('content-category - fetchContentCategories :', error)
        }
    }
    const clearContentCategories = async () => {
        contentCategories.value = []
    }

    return { contentCategories, fetchContentCategories, clearContentCategories }
});
