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
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { meetingParticipations, fetchMeetingParticipations }
});
