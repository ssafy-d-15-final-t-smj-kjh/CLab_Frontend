import { defineStore } from "pinia";
import { ref } from "vue";
import { participantApi, personaAnalysisApi } from "@/api/restApi";

export const useParticipantStore = defineStore("participant", () => {
    const participants = ref([])
    const participant = ref(null)

    const fetchParticipants = async (chatId) => {
        try {
            const response = await participantApi.getParticipantsInChat(chatId)
            const apiResponse = response.data
            const participantList = apiResponse.data

            const scorePromises = participantList.map(p =>
                personaAnalysisApi.getPersonaAnalysisByParticipantId(p.id)
                    .catch(() => null) // 특정 사람의 점수 조회가 실패해도 전체 로직이 터지지 않도록 방어
            )

            const scoreResponses = await Promise.all(scorePromises)

            participants.value = participantList.map((p, index) => {
                const res = scoreResponses[index]
                let score = res?.data?.data?.tetoScore || '-'

                return {
                    ...p,
                    tetoScore: score
                }
            })
        } catch (error) {
            console.error('participant.js - fetchParticipants :', error)
        }
    }

    const fetchParticipantInfo = async (participantId) => {
        try {
            const response = await participantApi.getParticipantInfoById(participantId)
            const apiResponse = response.data
            participant.value = apiResponse.data
            const res = await personaAnalysisApi.getPersonaAnalysisByParticipantId(participantId)
            participant.value.tetoScore = res.data.data.tetoScore
        } catch (error) {
            console.error('participant.js - fetchParticipantInfo :', error)
        }
    }

    const clearParticipantInfo = () => { participant.value = null }

    return {
        participants, participant,
        fetchParticipants, fetchParticipantInfo, clearParticipantInfo
    }
});
