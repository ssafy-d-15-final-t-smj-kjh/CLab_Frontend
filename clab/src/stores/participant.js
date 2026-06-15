import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useParticipantStore = defineStore("participant", () => {
    const participants = ref([])
    const participant = ref(null)

    const fetchParticipants = async (chatId) => {
        try {
            const response = await api.get(`/participant/chat/${chatId}`)
            const apiResponse = response.data
            participants.value = apiResponse.data
        } catch (error) {
            console.error('대화 참여자 정보 조회 실패:', error)
        }
    }

    const fetchParticipantInfo = async (participantId) => {
        try {
            const response = await api.get(`/participant/${participantId}`)
            const apiResponse = response.data
            participant.value = apiResponse.data
        } catch (error) {
            console.error('대화 참여자 정보 조회 실패:', error)
        }
    }

    const clearParticipantInfo = () => { participant.value = null }

    return { participants, participant, 
        fetchParticipants, fetchParticipantInfo, clearParticipantInfo }
});
