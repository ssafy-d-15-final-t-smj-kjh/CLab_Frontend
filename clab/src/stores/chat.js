import { defineStore } from "pinia";
import { ref } from "vue";
import { chatApi } from "@/api/restApi";

export const useChatStore = defineStore("chat", () => {
    const chats = ref([])
    const chatInfo = ref(null)

    const fetchChats = async () => {
        try {
            const response = await chatApi.getMyChats()
            const apiResponse = response.data
            chats.value = apiResponse.data
        } catch (error) {
            console.error('대화 정보 조회 실패:', error)
        }
    }

    const fetchChatInfo = async (chatId) => {
        try {
            const response = await chatApi.getChatInfoById(chatId)
            const apiResponse = response.data
            chatInfo.value = apiResponse.data
        } catch (error) {
            console.error('대화 정보 조회 실패:', error)
        }
    }

    const clearChatInfo = () => { chatInfo.value = null }

    return { chats, chatInfo, fetchChats, fetchChatInfo, clearChatInfo }
});
