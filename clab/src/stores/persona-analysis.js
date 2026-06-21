import { defineStore } from "pinia";
import { ref } from "vue";
import { personaAnalysisApi } from "@/api/restApi";

export const usePersonaAnalysisStore = defineStore("persona-analysis", () => {
    const personaAnalysis = ref(null)

    const fetchPersonaAnalysis = async (participantId) => {
        try {
            const response = await personaAnalysisApi.getPersonaAnalysisByParticipantId(participantId)
            const apiResponse = response.data
            personaAnalysis.value = apiResponse.data
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { personaAnalysis, fetchPersonaAnalysis }
});
