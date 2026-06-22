import { defineStore } from "pinia";
import { ref } from "vue";
import { meetingParticipationApi } from "@/api/restApi";

export const useMeetingParticipationStore = defineStore("meeting-participation", () => {
    const meetingParticipations = ref([])

    const fetchMeetingParticipations = async (meetingAnalysisId) => {
        try {
            const response = await meetingParticipationApi.getMeetingParticipationByMeetingAnalysisId(meetingAnalysisId)
            const apiResponse = response.data
            meetingParticipations.value = apiResponse.data
        } catch (error) {
            console.error('meeting-participation.js - fetchMeetingParticipations :', error)
        }
    }

    return { meetingParticipations, fetchMeetingParticipations }
});
