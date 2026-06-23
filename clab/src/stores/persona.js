import { defineStore } from "pinia";
import { ref } from "vue";
import { personaApi } from "@/api/restApi";

export const usePersonaStore = defineStore("persona", () => {
    const personas = ref([])
    const persona = ref(null)

    const fetchPersonas = async () => {
        try {
            const response = await personaApi.getPersonas()
            const apiResponse = response.data
            personas.value = apiResponse.data
        } catch (error) {
            console.error('persona.js - fetchPersonas :', error)
        }
    }

    const fetchPersona = async (personaId) => {
        try {
            const response = await personaApi.getPersonaById(personaId)
            const apiResponse = response.data
            persona.value = apiResponse.data
        } catch (error) {
            console.error('persona.js - fetchPersona :', error)
        }
    }

    const clearPersonaInfo = () => { persona.value = null }

    return {
        personas, persona,
        fetchPersonas, fetchPersona, clearPersonaInfo
    }
});
