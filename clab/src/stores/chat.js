import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

const SAMPLE_CHATS = [
    {
        id: 1,
        title: '제목1',
        description: '~~~에 대한 대화 내용',
        content: '안녕하세요! 오늘은 어떤 이야기를 나눠볼까요?\n여기에 실제 대화 내용이 들어옵니다.',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        id: 2,
        title: '제목2',
        description: '~~~에 대한 대화 내용',
        content: '두 번째 대화 내용입니다.\n여러 줄로 구성될 수 있어요.',
        createdAt: '2026-02-01',
        updatedAt: '2026-02-01'
    },
    {
        id: 3,
        title: '제목3',
        description: '~~~에 대한 대화 내용',
        content: '세 번째 대화 내용입니다.',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01'
    }
]

export const useChatStore = defineStore("chat", () => {
    const chats = ref([])
    const chatInfo = ref(null)

    const fetchChats = async () => {
        try {
            const response = await api.get('/chat')
            const apiResponse = response.data
            chats.value = apiResponse.data
        } catch (e) {
            console.warn('API 미구현 → 샘플 데이터 사용')
            chats.value = SAMPLE_CHATS
        }
    }

    const fetchChatInfo = async (id) => {
        try {
            const response = await api.get(`/chat/${id}`)
            const apiResponse = response.data
            chatInfo.value = apiResponse.data
        } catch (e) {
            console.warn('API 미구현 → 샘플 데이터 사용')
            // id에 맞는 샘플 찾기, 없으면 첫 번째
            chatInfo.value =
                SAMPLE_CHATS.find((c) => String(c.id) === String(id))
                ?? SAMPLE_CHATS[0]
        }
    }

    const clearChatInfo = () => { chatInfo.value = null }

    return { chats, chatInfo, fetchChats, fetchChatInfo, clearChatInfo }
});
