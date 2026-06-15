<template>
    <div class="page-container">
        <!-- 헤더 -->
        <div class="header">
            <button class="back-btn" @click="goBack">
                <span>←</span>
            </button>
            <h1 class="header-title">{{ displayName }}</h1>
        </div>

        <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
        <RetryInfo v-else-if="error" :message="error" @retry="fetchAll"/>

        <!-- 상세 내용 -->
        <div v-else class="content-wrap">

            <!-- 인물상 카드 -->
            <div v-if="persona" class="persona-card">
                <div class="persona-header">
                    <div class="persona-image-wrap">
                        <img v-if="persona.image" :src="persona.image" :alt="persona.name" class="persona-image" />
                        <div v-else class="persona-image-placeholder">
                            🐚
                        </div>
                    </div>
                    <div class="persona-info">
                        <div class="persona-tag">인물상</div>
                        <div class="persona-name">{{ persona.name }}</div>
                    </div>
                </div>
                <p class="persona-description">{{ persona.description }}</p>
            </div>

            <!-- 통계 그리드 -->
            <div class="stats-section">
                <h2 class="section-title">📊 대화 통계</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-icon">💬</div>
                        <div class="stat-card-value">{{ participant?.count ?? '-' }}</div>
                        <div class="stat-card-label">대화 횟수</div>
                    </div>
                    <div class="stat-card highlight">
                        <div class="stat-card-icon">⭐</div>
                        <div class="stat-card-value">{{ participant?.score ?? '-' }}</div>
                        <div class="stat-card-label">점수</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">⏱️</div>
                        <div class="stat-card-value">{{ formatTime(participant?.average_reply_time) ?? '-' }}</div>
                        <div class="stat-card-label">평균 답장시간</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">📝</div>
                        <div class="stat-card-value">{{ participant?.chat_length ?? '-' }}</div>
                        <div class="stat-card-label">대화길이</div>
                    </div>
                </div>
            </div>

            <!-- 코멘트 -->
            <div v-if="participant?.comment" class="comment-section">
                <h2 class="section-title">💡 분석 코멘트</h2>
                <div class="comment-card">
                    <span class="quote-mark">"</span>
                    <p class="comment-text">{{ participant.comment }}</p>
                    <span class="quote-mark right">"</span>
                </div>
            </div>

            <!-- 대화 내용 -->
            <div class="messages-section">
                <div class="messages-header">
                    <h2 class="section-title">🗨️ 대화 내용</h2>
                    <span class="message-count">{{ contents.length }}개</span>
                </div>

                <div v-if="contents.length === 0" class="empty-messages">
                    <p>대화 내용이 없습니다.</p>
                </div>

                <div v-else class="message-list">
                    <div v-for="content in contents" :key="content.id" class="message-item">
                        <div class="message-time">{{ formatDateTime(content.time) }}</div>
                        <div class="message-bubble">
                            <p class="message-text">{{ content.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useParticipantStore } from '@/stores/participant'
import { usePersonaStore } from '@/stores/persona'
import { useContentStore } from '@/stores/contents'
import { storeToRefs } from 'pinia'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const route = useRoute()
const router = useRouter()
const participantStore = useParticipantStore()
const personaStore = usePersonaStore()
const contentStore = useContentStore()

const chatId = route.params.chatId
const participantId = route.params.participantId

const { participant } = storeToRefs(participantStore)
const { persona } = storeToRefs(personaStore)
const { contents } = storeToRefs(contentStore)
const isLoading = ref(false)
const error = ref(null)

// 표시 이름 (alias 우선)
const displayName = computed(() => {
    return participant.value?.alias || participant.value?.name || '참여자'
})

// 모든 데이터 불러오기
const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
        await Promise.all([fetchParticipant(), fetchContents()])
    } catch (e) {
        error.value = '정보를 불러오지 못했습니다.'
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

// 참여자 정보
const fetchParticipant = async () => {
    await participantStore.fetchParticipantInfo(participantId)

    // 페르소나가 있으면 추가 조회
    if (participant.value?.personaId) {
        await fetchPersona(participant.value.personaId)
    }
}

// 페르소나 정보
const fetchPersona = async (personaId) => {
    await personaStore.fetchPersona(personaId)
}

// 대화 내용
const fetchContents = async () => {
    await contentStore.fetchContents(participantId)
}

// 시간 포맷
const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '-'
    if (seconds < 60) return `${seconds}초`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}분 ${s}초` : `${m}분`
}

// 날짜시간 포맷
const formatDateTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr

    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
}

const goBack = () => {
    router.push(`/chat/${chatId}/participant-list`)
}

onMounted(() => {
    fetchAll()
})
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background: var(--sand-light);
    padding-bottom: 60px;
}

/* 헤더 */
.header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 20px 16px;
    background: var(--white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: var(--sand);
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
}

.back-btn:hover {
    background: var(--sand-dark);
}

.header-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 로딩 */
.loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 16px;
    color: var(--text-gray);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--sand-dark);
    border-top-color: var(--ocean-blue);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 에러 */
.error-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    gap: 16px;
    color: var(--crab-red);
}

.retry-btn {
    padding: 10px 24px;
    background: var(--ocean-blue);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
}

/* 콘텐츠 */
.content-wrap {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 섹션 타이틀 */
.section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 12px;
}

/* 인물상 카드 */
.persona-card {
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(91, 180, 196, 0.35);
}

.persona-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
}

.persona-image-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid rgba(255, 255, 255, 0.6);
}

.persona-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.persona-image-placeholder {
    font-size: 32px;
}

.persona-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.persona-tag {
    display: inline-block;
    padding: 2px 10px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    font-size: 11px;
    color: var(--white);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.persona-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--white);
}

.persona-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 12px;
}

/* 통계 그리드 */
.stats-section {}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.stat-card {
    background: var(--white);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card.highlight {
    background: linear-gradient(135deg, var(--crab-orange), var(--crab-red));
}

.stat-card.highlight .stat-card-value,
.stat-card.highlight .stat-card-label {
    color: var(--white);
}

.stat-card-icon {
    font-size: 22px;
    margin-bottom: 2px;
}

.stat-card-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-dark);
}

.stat-card-label {
    font-size: 12px;
    color: var(--text-gray);
}

/* 코멘트 */
.comment-card {
    background: var(--white);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quote-mark {
    font-size: 36px;
    color: var(--sand-dark);
    font-family: serif;
    line-height: 1;
    display: block;
    margin-bottom: -8px;
}

.quote-mark.right {
    text-align: right;
    margin-top: -8px;
    margin-bottom: 0;
}

.comment-text {
    font-size: 14px;
    color: var(--text-dark);
    line-height: 1.7;
    padding: 0 8px;
}

.messages-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.messages-header .section-title {
    margin-bottom: 0;
}

.message-count {
    font-size: 13px;
    color: var(--text-gray);
    background: var(--sand);
    padding: 4px 10px;
    border-radius: 20px;
}

.empty-messages {
    background: var(--white);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    color: var(--text-gray);
    font-size: 14px;
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
}

.message-time {
    font-size: 11px;
    color: var(--text-gray);
    padding-left: 4px;
}

.message-bubble {
    background: var(--white);
    border-radius: 4px 16px 16px 16px;
    padding: 12px 16px;
    max-width: 90%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    border-left: 3px solid var(--ocean-blue);
}

.message-text {
    font-size: 14px;
    color: var(--text-dark);
    line-height: 1.6;
    word-break: break-word;
}
</style>
