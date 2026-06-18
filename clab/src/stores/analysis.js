import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useAnalysisStore = defineStore("analysis", () => {
    const analysis = ref(null)

    const fetchAnalysis = async (participantId) => {
        try {
            const response = await api.get(`/persona-analysis/${participantId}`)
            const apiResponse = response.data
            analysis.value = apiResponse.data
        } catch (error) {
            console.error('분석 정보 조회 실패:', error)
        }
    }

    return { analysis, fetchAnalysis }
});
