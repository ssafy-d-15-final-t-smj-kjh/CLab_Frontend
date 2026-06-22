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
        } catch (error) {
            console.error('meeting-analysis.js - fetchMeetingAnalysis :', error)
        }
    }

    return { meetingAnalysis, fetchMeetingAnalysis }
});
