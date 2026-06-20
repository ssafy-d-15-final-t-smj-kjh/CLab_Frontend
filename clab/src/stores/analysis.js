import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";
import { personaAnalysisApi } from "@/api/restApi";

export const useAnalysisStore = defineStore("analysis", () => {
    const analysis = ref(null)

    const fetchAnalysis = async (participantId) => {
        try {
            const response = await personaAnalysisApi.getPersonaAnalysisByParticipantId(participantId)
            const apiResponse = response.data
            analysis.value = apiResponse.data
            console.log(analysis.value[0])
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { analysis, fetchAnalysis }
});
