import { defineStore } from "pinia";
import { ref } from "vue";
import { chatApi } from "@/api/restApi";

export const useChatStore = defineStore("chat", () => {
    const chats = ref([])
    const totalCount = ref(null)
    const chatInfo = ref(null)

    const fetchChats = async (pageRequestDto) => {
        try {
            const response = await chatApi.getMyChats(pageRequestDto)
            const apiResponse = response.data
            const map = apiResponse.data
            chats.value = map.chats
            totalCount.value = map.totalCount
        } catch (error) {
            console.error('chat.js - fetchChats :', error)
        }
    }

    const fetchChatInfo = async (chatId) => {
        try {
            const response = await chatApi.getChatInfoById(chatId)
            const apiResponse = response.data
            chatInfo.value = apiResponse.data
        } catch (error) {
            console.error('chat.js - fetchChatInfo :', error)
        }
    }

    const clearChatInfo = () => { chatInfo.value = null }

    return { chats, chatInfo, fetchChats, fetchChatInfo, clearChatInfo }
});
