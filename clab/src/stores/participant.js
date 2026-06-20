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

            // 4. Promise.all로 병렬 통신 (동시에 여러 API 호출)
            const scoreResponses = await Promise.all(scorePromises)

            // 5. 기존 참여자 리스트 객체들에 tetoScore 속성 병합
            participants.value = participantList.map((p, index) => {
                const res = scoreResponses[index]
                let score = '-'

                // 💡 옵셔널 체이닝(?.)을 사용하여 안전하고 간결하게 [0]번째 값을 확인
                if (res?.data?.data?.length > 0) {
                    // 백엔드 명칭에 맞춰 tetoScore 또는 teto_score로 수정해주세요
                    score = res.data.data[0].tetoScore 
                }

                return {
                    ...p,
                    tetoScore: score
                }
            })
        } catch (error) {
            console.error('대화 참여자 정보 조회 실패:', error)
        }
    }

    const fetchParticipantInfo = async (participantId) => {
        try {
            const response = await participantApi.getParticipantInfoById(participantId)
            const apiResponse = response.data
            participant.value = apiResponse.data
            const res = await personaAnalysisApi.getPersonaAnalysisByParticipantId(participantId)
            participant.value.tetoScore = res.data.data[0].tetoScore
        } catch (error) {
            console.error('대화 참여자 정보 조회 실패:', error)
        }
    }

    const clearParticipantInfo = () => { participant.value = null }

    return { participants, participant, 
        fetchParticipants, fetchParticipantInfo, clearParticipantInfo }
});
