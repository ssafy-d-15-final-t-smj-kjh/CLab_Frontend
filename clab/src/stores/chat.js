import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const useChatStore = defineStore("chat", () => {
    const chats = ref([])
    const chatInfo = ref(null)

    const fetchChats = async () => {
        try {
            const response = await api.get('/chat')
            const apiResponse = response.data
            chats.value = apiResponse.data
        } catch (e) {
            console.log(e)
        }
    }

    const fetchChatInfo = async (id) => {
        try {
            const response = await api.get(`/chat/${id}`)
            const apiResponse = response.data
            chatInfo.value = apiResponse.data
        } catch (e) {
            console.log(e)
        }
    }

    const clearChatInfo = () => { chatInfo.value = null }

    return { chats, chatInfo, fetchChats, fetchChatInfo, clearChatInfo }
});
