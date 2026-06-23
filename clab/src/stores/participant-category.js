import { defineStore } from "pinia";
import { ref } from "vue";
import { participantCategoryApi } from "@/api/restApi";

export const useParticipantCategoryStore = defineStore("participant-category", () => {
    const participantCategories = ref([])

    const fetchParticipantCategories = async (participantId) => {
        try {
            const response = await participantCategoryApi.getParticipantCategories(participantId)
            const apiResponse = response.data
            participantCategories.value = apiResponse.data
        } catch (error) {
            console.error('participant-category.js - fetchParticipantCategories :', error)
        }
    }

    return { participantCategories, fetchParticipantCategories }
});
