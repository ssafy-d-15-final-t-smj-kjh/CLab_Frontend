import api from "./axios";

export const authApi = {
    login: (data) => api.post("/auth/login", data),
    refresh: () => api.post("/auth/refresh", {}, { withCredentials: true }),
    logout: () => api.post("/auth/logout"),
}

export const memberApi = {
    getMe: () => api.get('/member/me'),
    createMember: (data) => api.post("/member/join", data),
    updateMemberImage: (imageFile) => api.patch(`/member/me/image`, imageFile),
    updateMemberPassword: (dto) => api.patch(`/member/me/password`, dto),
    updateMemberInfo: (dto) => api.patch(`/member/me`, dto),
}

export const chatApi = {
    getMyChats: (pageRequestDto) => api.get('/chat/me', { params: pageRequestDto }),
    getChatInfoById: (chatId) => api.get(`chat/${chatId}`),
    uploadChat: (formData) => api.post('/chat', formData),
    updateChat: (chatId, data) => api.patch(`/chat/${chatId}`, data),
    deleteChat: (chatId) => api.delete(`chat/${chatId}`)
}

export const participantApi = {
    getParticipantsInChat: (chatId) => api.get(`/participant/chat/${chatId}`),
    getParticipantInfoById: (participantId) => api.get(`/participant/${participantId}`),
    getParticipantsInPersonaAnalysis: (chatId, sortRequestDto) =>
        api.get(`/participant/persona/${chatId}`, { params: sortRequestDto }),
    getParticipantsInMeetingAnalysis: (chatId, sortRequestDto) =>
        api.get(`/participant/meeting/${chatId}`, { params: sortRequestDto })
}

export const personaAnalysisApi = {
    getPersonaAnalysisByParticipantId: (participantId) => api.get(`/persona-analysis/participant/${participantId}`),
}

export const personaApi = {
    getPersonas: () => api.get(`/persona`),
    getPersonaById: (personaId) => api.get(`/persona/${personaId}`)
}

export const categoryApi = {
    getCategories: () => api.get("/category"),
    getCategoryById: (id) => api.get(`/category/${id}`),
    createCategory: (data) => api.post("/category", data),
    updateCategory: (id, data) => api.patch(`/category/${id}`, data),
    deleteCategory: (id) => api.delete(`/category/${id}`),
}

export const contentCategoryApi = {
    getContentCategoriesByContentId: (contentId) => api.get(`/content-category/content/${contentId}`),
}

export const participantCategoryApi = {
    getParticipantCategories: (participantId) => api.get(`/participant-category/participant/${participantId}`),
}

export const contentApi = {
    getContentsByParticipantId: (participantId) => api.get(`/content/participant/${participantId}`),
}

export const meetingAnalysisApi = {
    getMeetingAnalysisByChatId: (chatId) => api.get(`/meeting-analysis/chat/${chatId}`),
}

export const meetingParticipationApi = {
    getMeetingParticipationByMeetingAnalysisId: (meetingAnalysisId) => api.get(`/meeting-participation/meeting-analysis/${meetingAnalysisId}`),
}
