import { defineStore } from "pinia";
import { ref } from "vue";
import { contentApi } from "@/api/restApi";

export const useContentStore = defineStore("content", () => {
    const contents = ref([])

    const fetchContents = async (participantId) => {
        try {
            const response = await contentApi.getContentsByParticipantId(participantId)
            const apiResponse = response.data
            contents.value = apiResponse.data
        } catch (error) {
            console.error('대화 내용 정보 조회 실패:', error)
        }
    }

    return { contents, fetchContents }
});
