<template>
    <div class="page-container">
        <!-- 헤더 -->
        <div class="header">
            <button class="back-btn" @click="goBack">
                <span>←</span>
            </button>
            <h1 class="header-title">참여자 분석</h1>
        </div>

        <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
        <RetryInfo v-else-if="error" :message="error" @retry="fetchParticipants" />

        <!-- 참여자 리스트 -->
        <div v-else class="content-wrap">
            <!-- 요약 카드 -->
            <div class="summary-card">
                <div class="summary-item">
                    <span class="summary-label">총 참여자</span>
                    <span class="summary-value">{{ participants.length }}명</span>
                </div>
                <div class="divider-v"></div>
                <div class="summary-item">
                    <span class="summary-label">총 대화수</span>
                    <span class="summary-value">{{ totalCount }}회</span>
                </div>
                <div class="divider-v"></div>
                <div class="summary-item">
                    <span class="summary-label">최고 점수</span>
                    <span class="summary-value">{{ maxScore }}점</span>
                </div>
            </div>

            <!-- 정렬 옵션 -->
            <div class="sort-wrap">
                <span class="sort-label">정렬</span>
                <div class="sort-buttons">
                    <button v-for="opt in sortOptions" :key="opt.value"
                        :class="['sort-btn', { active: sortBy === opt.value }]" @click="setSortBy(opt.value)">
                        {{ opt.label }}
                    </button>
                </div>
            </div>

            <!-- 참여자 카드 리스트 -->
            <div class="participant-list">
                <div v-for="(participant, index) in sortedParticipants" :key="participant.id" class="participant-card"
                    @click="goToDetail(participant.id)">
                    <!-- 순위 -->
                    <div :class="['rank-badge', getRankClass(index + 1)]">
                        {{ index + 1 }}
                    </div>

                    <!-- 참여자 정보 -->
                    <div class="participant-info">
                        <div class="participant-top">
                            <span class="participant-name">
                                {{ participant.alias || participant.name }}
                            </span>
                            <span v-if="participant.alias" class="original-name">
                                ({{ participant.name }})
                            </span>
                        </div>
                        <div class="participant-stats">
                            <span class="stat-item">
                                <span class="stat-icon">💬</span>
                                {{ participant.count }}회
                            </span>
                            <span class="stat-item">
                                <span class="stat-icon">⏱️</span>
                                {{ formatTime(participant.average_reply_time) }}
                            </span>
                            <span class="stat-item">
                                <span class="stat-icon">📝</span>
                                {{ participant.chat_length }}자
                            </span>
                        </div>
                    </div>

                    <!-- 점수 -->
                    <div class="score-wrap">
                        <div class="score-circle">
                            <span class="score-value">{{ participant.score }}</span>
                            <span class="score-label">점</span>
                        </div>
                    </div>

                    <!-- 화살표 -->
                    <div class="arrow">→</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useParticipantStore } from '@/stores/participant'
import { storeToRefs } from 'pinia'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const route = useRoute()
const router = useRouter()
const participantStore = useParticipantStore()

const chatId = route.params.chatId
const { participants } = storeToRefs(participantStore)
const isLoading = ref(false)
const error = ref(null)
const sortBy = ref('score')

const sortOptions = [
    { label: '점수순', value: 'score' },
    { label: '대화수', value: 'count' },
    { label: '대화길이', value: 'chat_length' },
    { label: '답장시간', value: 'average_reply_time' },
]

// 정렬된 참여자 목록
const sortedParticipants = computed(() => {
    return [...participants.value].sort((a, b) => {
        if (sortBy.value === 'average_reply_time') {
            return a[sortBy.value] - b[sortBy.value] // 답장시간은 오름차순
        }
        return b[sortBy.value] - a[sortBy.value] // 나머지는 내림차순
    })
})

const totalCount = computed(() =>
    participants.value.reduce((sum, p) => sum + (p.count || 0), 0)
)

const maxScore = computed(() =>
    participants.value.length > 0
        ? Math.max(...participants.value.map((p) => p.score || 0))
        : 0
)

// 참여자 목록 불러오기
const fetchParticipants = async (chatId) => {
    isLoading.value = true
    error.value = null
    try {
        participantStore.fetchParticipants(chatId)
    } catch (e) {
        error.value = '참여자 정보를 불러오지 못했습니다.'
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

// 순위 스타일
const getRankClass = (rank) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return 'default'
}

// 시간 포맷 (초 → 분:초)
const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '-'
    if (seconds < 60) return `${seconds}초`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}분 ${s}초` : `${m}분`
}

const setSortBy = (value) => {
    sortBy.value = value
}

const goToDetail = (participantId) => {
    router.push(`/chat/${chatId}/participant-detail/${participantId}`)
}

const goBack = () => {
    router.push(`/chat-detail/${chatId}`)
}

onMounted(() => {
    fetchParticipants(chatId)
})
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background: var(--sand-light);
    padding-bottom: 40px;
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
}

.back-btn:hover {
    background: var(--sand-dark);
}

.header-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
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
    gap: 16px;
}

/* 요약 카드 */
.summary-card {
    background: var(--white);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.summary-label {
    font-size: 12px;
    color: var(--text-gray);
}

.summary-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--ocean-blue);
}

.divider-v {
    width: 1px;
    height: 40px;
    background: var(--sand-dark);
}

/* 정렬 */
.sort-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sort-label {
    font-size: 13px;
    color: var(--text-gray);
    white-space: nowrap;
}

.sort-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.sort-btn {
    padding: 6px 14px;
    border: 1.5px solid var(--sand-dark);
    background: var(--white);
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-gray);
    transition: all 0.2s;
}

.sort-btn.active {
    background: var(--ocean-blue);
    border-color: var(--ocean-blue);
    color: var(--white);
    font-weight: 600;
}

/* 참여자 카드 */
.participant-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.participant-card {
    background: var(--white);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
}

.participant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.participant-card:active {
    transform: translateY(0);
}

/* 순위 배지 */
.rank-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
}

.rank-badge.gold {
    background: #ffd700;
    color: #7a5c00;
}

.rank-badge.silver {
    background: #c0c0c0;
    color: #555;
}

.rank-badge.bronze {
    background: #cd7f32;
    color: var(--white);
}

.rank-badge.default {
    background: var(--sand);
    color: var(--text-gray);
}

/* 참여자 정보 */
.participant-info {
    flex: 1;
    min-width: 0;
}

.participant-top {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 6px;
}

.participant-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
}

.original-name {
    font-size: 12px;
    color: var(--text-gray);
}

.participant-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--text-gray);
}

.stat-icon {
    font-size: 11px;
}

/* 점수 */
.score-wrap {
    flex-shrink: 0;
}

.score-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--sky-blue), var(--ocean-blue));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(91, 180, 196, 0.4);
}

.score-value {
    font-size: 16px;
    font-weight: 800;
    color: var(--white);
    line-height: 1;
}

.score-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.85);
}

.arrow {
    font-size: 16px;
    color: var(--text-gray);
    flex-shrink: 0;
}
</style>
