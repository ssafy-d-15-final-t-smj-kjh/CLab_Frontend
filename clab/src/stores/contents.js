import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useContentStore = defineStore("content", () => {
    const contents = ref([])

    const fetchContents = async (participantId) => {
        try {
            const response = await api.get(`/content/participant/${participantId}`)
            const apiResponse = response.data
            contents.value = apiResponse.data
        } catch (error) {
            console.error('대화 내용 정보 조회 실패:', error)
        }
    }

    return { contents, fetchContents }
});
