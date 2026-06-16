import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";

export const usePersonaStore = defineStore("persona", () => {
    const personas = ref([])
    const persona = ref(null)

    const fetchPersonas = async () => {
        try {
            const response = await api.get(`/persona`)
            const apiResponse = response.data
            personas.value = apiResponse.data
        } catch (error) {
            console.error('인물상 정보 조회 실패:', error)
        }
    }

    const fetchPersona = async (personaId) => {
        try {
            const response = await api.get(`/persona/${personaId}`)
            const apiResponse = response.data
            persona.value = apiResponse.data
        } catch (error) {
            console.error('인물상 정보 조회 실패:', error)
        }
    }

    const clearPersonaInfo = () => { persona.value = null }

    return { personas, persona, 
        fetchPersonas, fetchPersona, clearPersonaInfo }
});
