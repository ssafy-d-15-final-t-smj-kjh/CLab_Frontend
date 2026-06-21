import { defineStore } from "pinia";
import { ref } from "vue";
import { meetingAnalysisApi } from "@/api/restApi";

export const useMeetingAnalysisStore = defineStore("meeting-analysis", () => {
    const meetingAnalysis = ref(null)

    const fetchMeetingAnalysis = async (chatId) => {
        try {
            const response = await meetingAnalysisApi.getMeetingAnalysisByChatId(chatId)
            const apiResponse = response.data
            meetingAnalysis.value = apiResponse.data
            console.log('meetingAnalysis', meetingAnalysis)
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { meetingAnalysis, fetchMeetingAnalysis }
});
