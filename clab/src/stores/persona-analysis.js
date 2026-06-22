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
            console.log(personaAnalysis.value)
        } catch (error) {
            console.error('persona-analysis.js - fetchPersonaAnalysis :', error)
        }
    }

    return { personaAnalysis, fetchPersonaAnalysis }
});
