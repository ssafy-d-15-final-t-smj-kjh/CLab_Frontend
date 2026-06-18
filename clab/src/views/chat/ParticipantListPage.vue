<template>
    <div class="list-page">
        <!-- 헤더 -->
        <div class="page-header">
            <div class="header-inner">
                <button class="back-btn" @click="goBack">
                    <span>←</span>
                </button>
                <div class="header-title">
                    <h1>🦀 대화 참여자 분석</h1>
                </div>
            </div>
        </div>
        
        <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
        <RetryInfo v-else-if="error" :message="error" @retry="fetchParticipants" />
        <div class="container" v-else>
            <p class="chat-title">{{ chatInfo?.title }}</p>
            <!-- 통계 요약 카드 -->
            <div class="summary-section">
                <div class="summary-card">
                    <span class="summary-icon">💬</span>
                    <div>
                        <p class="summary-label">총 대화 수</p>
                        <p class="summary-value">{{ totalMessages }}</p>
                    </div>
                </div>
                <div class="summary-card">
                    <span class="summary-icon">👥</span>
                    <div>
                        <p class="summary-label">참여자 수</p>
                        <p class="summary-value">{{ participants.length }}명</p>
                    </div>
                </div>
                <div class="summary-card">
                    <span class="summary-icon">⏱️</span>
                    <div>
                        <p class="summary-label">평균 답장시간</p>
                        <p class="summary-value">{{ avgReplyTime }}</p>
                    </div>
                </div>
            </div>

            <!-- 순위 & 참여자 카드 -->
            <div class="section">
                <h2 class="section-title">🏆 참여자 순위</h2>
                <p class="section-desc">대화 참여도 기준 순위입니다</p>

                <div class="participant-cards">
                    <div v-for="(p, index) in rankedParticipants" :key="p.id" class="participant-card"
                        :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }"
                        @click="goToDetail(p.id)">
                        <!-- 순위 배지 -->
                        <div class="rank-badge">
                            <span v-if="index === 0">🥇</span>
                            <span v-else-if="index === 1">🥈</span>
                            <span v-else-if="index === 2">🥉</span>
                            <span v-else class="rank-num">{{ index + 1 }}</span>
                        </div>

                        <!-- 참여자 아바타 -->
                        <div class="avatar" :style="{ backgroundColor: avatarColors[index % avatarColors.length] }">
                            {{ p.name }}
                        </div>

                        <!-- 참여자 정보 -->
                        <div class="card-info">
                            <h3 class="participant-name">{{ p.name }}</h3>

                            <!-- 스탯 그리드 -->
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">💬 대화 수</span>
                                    <span class="stat-value">{{ p.count }}회</span>
                                    <div class="stat-bar">
                                        <div class="stat-bar-fill"
                                            :style="{ width: getPercent(p.count, maxCount) + '%', backgroundColor: '#5bb4c4' }">
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-item">
                                    <span class="stat-label">⏱️ 평균 답장</span>
                                    <span class="stat-value">{{ formatReplyTime(p.averageReplyTime) }}</span>
                                    <div class="stat-bar">
                                        <div class="stat-bar-fill"
                                            :style="{ width: getReplyPercent(p.averageReplyTime) + '%', backgroundColor: '#a8dadc' }">
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-item">
                                    <span class="stat-label">📝 대화 길이</span>
                                    <span class="stat-value">{{ p.chatLength }}자</span>
                                    <div class="stat-bar">
                                        <div class="stat-bar-fill"
                                            :style="{ width: getPercent(p.chatLength, maxLength) + '%', backgroundColor: '#e8554e' }">
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-item">
                                    <span class="stat-label">⚡ 테토 점수</span>
                                    <span class="stat-value teto-score" :class="tetoClass(p.tetoScore)">
                                        {{ p.tetoScore ?? '-' }}점
                                    </span>
                                    <div class="stat-bar">
                                        <div class="stat-bar-fill teto-bar" :style="{
                                            width: (p.tetoScore ?? 0) + '%',
                                            background: tetoGradient(p.tetoScore)
                                        }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 화살표 -->
                        <div class="card-arrow">→</div>
                    </div>
                </div>
            </div>

            <!-- 비교 차트 섹션 -->
            <div class="section">
                <h2 class="section-title">📊 참여자 비교 차트</h2>

                <!-- 차트 탭 -->
                <div class="chart-tabs">
                    <button v-for="tab in chartTabs" :key="tab.key" class="chart-tab"
                        :class="{ active: activeChart === tab.key }" @click="activeChart = tab.key">
                        {{ tab.label }}
                    </button>
                </div>

                <div class="chart-wrapper">
                    <canvas ref="barChartRef"></canvas>
                </div>
            </div>

            <!-- 테토 점수 분포 -->
            <div class="section">
                <h2 class="section-title">⚡ 테토 에너지 분포</h2>
                <p class="section-desc">0점 = 여성적(에테르), 100점 = 남성적(테토)</p>

                <div class="teto-distribution">
                    <div v-for="p in participants" :key="p.id" class="teto-item" @click="goToDetail(p.id)">
                        <span class="teto-name">{{ p.name }}</span>
                        <div class="teto-bar-container">
                            <div class="teto-label-left">에테르</div>
                            <div class="teto-full-bar">
                                <div class="teto-fill" :style="{
                                    width: (p.tetoScore ?? 0) + '%',
                                    background: tetoGradient(p.persona?.teto_score)
                                }"></div>
                                <span class="teto-score-label">{{ p.tetoScore ?? 0 }}점</span>
                            </div>
                            <div class="teto-label-right">테토</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { storeToRefs } from 'pinia'

import { useChatStore } from '@/stores/chat'
import { useParticipantStore } from '@/stores/participant'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

Chart.register(...registerables)

const route = useRoute()
const router = useRouter()

const chatStore = useChatStore()
const participantStore = useParticipantStore()

const isLoading = ref(false)
const error = ref(null)

const { chatInfo } = storeToRefs(chatStore)
const { participants } = storeToRefs(participantStore)

const chatId = route.params.chatId
const barChartRef = ref(null)
let barChartInstance = null

const activeChart = ref('count')
const chartTabs = [
    { key: 'count', label: '💬 대화 수' },
    { key: 'reply', label: '⏱️ 답장 시간' },
    { key: 'length', label: '📝 대화 길이' },
    { key: 'teto', label: '⚡ 테토 점수' },
]

const avatarColors = ['#5bb4c4', '#e8554e', '#f0d9a8', '#a8dadc', '#c41e3a', '#88bbcc']

// ── 계산값 ──────────────────────────────────────────
const totalMessages = computed(() =>
    participants.value.reduce((sum, p) => sum + p.count, 0)
)

const avgReplyTime = computed(() => {
    const valid = participants.value.filter(p => p.averageReplyTime > 0)
    if (!valid.length) return '-'
    const avg = valid.reduce((s, p) => s + p.averageReplyTime, 0) / valid.length
    return formatReplyTime(avg)
})

const rankedParticipants = computed(() =>
    [...participants.value].sort((a, b) => b.count - a.count)
)

const maxCount = computed(() => Math.max(...participants.value.map(p => p.count), 1))
const maxLength = computed(() => Math.max(...participants.value.map(p => p.chatLength), 1))
const maxReply = computed(() => Math.max(...participants.value.map(p => p.averageReplyTime), 1))

// ── 유틸 ────────────────────────────────────────────
const getPercent = (val, max) => {
    return max === 0 ? 0 : Math.round((val / max) * 100)
}


const getReplyPercent = (val) => {
    // 답장이 빠를수록 높은 점수로 변환
    if (!val || val === 0) return 100
    return Math.max(10, 100 - Math.round((val / maxReply.value) * 100))
}

const formatReplyTime = (seconds) => {
    if (!seconds || seconds === 0) return '즉시'
    if (seconds < 60) return `${Math.round(seconds)}초`
    if (seconds < 3600) return `${Math.round(seconds / 60)}분`
    return `${Math.round(seconds / 3600)}시간`
}

const tetoClass = (score) => {
    if (score === null || score === undefined) return ''
    if (score >= 70) return 'score-high'
    if (score >= 40) return 'score-mid'
    return 'score-low'
}

const tetoGradient = (score) => {
    if (!score) return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
    if (score >= 70) return 'linear-gradient(90deg, #e8554e, #c41e3a)'
    if (score >= 40) return 'linear-gradient(90deg, #f0d9a8, #e8554e)'
    return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
}

const goBack = () => {
    router.push(`/chat-detail/${chatId}`)
}
const goToDetail = (participantId) => {
    router.push(`/chat/${chatId}/participant-detail/${participantId}`)
}

// ── 차트 ────────────────────────────────────────────
const buildChartData = () => {
    const names = participants.value.map(p => p.name)

    const datasets = {
        count: {
            label: '대화 수',
            data: participants.value.map(p => p.count),
            backgroundColor: '#5bb4c480',
            borderColor: '#5bb4c4',
            borderWidth: 2,
        },
        reply: {
            label: '평균 답장 시간 (초)',
            data: participants.value.map(p => p.averageReplyTime ?? 0),
            backgroundColor: '#a8dadc80',
            borderColor: '#a8dadc',
            borderWidth: 2,
        },
        length: {
            label: '대화 길이 (자)',
            data: participants.value.map(p => p.chatLength),
            backgroundColor: '#e8554e80',
            borderColor: '#e8554e',
            borderWidth: 2,
        },
        teto: {
            label: '테토 점수',
            data: participants.value.map(p => p.tetoScore ?? 0),
            backgroundColor: participants.value.map(p =>
                (p.persona?.teto_score ?? 0) >= 70
                    ? '#c41e3a80'
                    : (p.persona?.teto_score ?? 0) >= 40
                        ? '#e8554e80'
                        : '#a8dadc80'
            ),
            borderColor: '#c41e3a',
            borderWidth: 2,
        },
    }

    return { names, dataset: datasets[activeChart.value] }
}

async function renderChart() {
    await nextTick()
    if (!barChartRef.value) return

    if (barChartInstance) {
        barChartInstance.destroy()
    }

    const { names, dataset } = buildChartData()

    barChartInstance = new Chart(barChartRef.value, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [dataset],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#3a3a3a',
                    titleColor: '#fdf6e8',
                    bodyColor: '#fdf6e8',
                },
            },
            scales: {
                x: {
                    grid: { color: '#f0d9a830' },
                    ticks: { color: '#3a3a3a', font: { size: 13 } },
                },
                y: {
                    grid: { color: '#f0d9a830' },
                    ticks: { color: '#3a3a3a' },
                    beginAtZero: true,
                },
            },
        },
    })
}

watch(activeChart, renderChart)

// ── API 호출 ─────────────────────────────────────────
const fetchData = async () => {
    isLoading.value = true
    error.value = null
    try {
        await fetchChatInfo()
        await fetchParticipants()
    } catch (e) {
        console.error(e)
        error.value = '정보를 불러오는 데 실패하였습니다.'
    } finally {
        isLoading.value = false
        await renderChart()
    }
}

const fetchChatInfo = async () => {
    await chatStore.fetchChatInfo(chatId)
}
const fetchParticipants = async () => {
    await participantStore.fetchParticipants(chatId)
}

onMounted(fetchData)
</script>

<style scoped>
.list-page {
    min-height: 100vh;
    background: var(--sand-light);
    font-family: 'Pretendard', sans-serif;
}

/* ── 헤더 ── */
.page-header {
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    padding: 20px 24px 24px;
    color: var(--white);
}

.header-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
}

.back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.35);
}

.header-title h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
}

.chat-title {
    margin: 4px 0 0;
    font-size: 14px;
    opacity: 0.85;
}

/* ── 컨테이너 ── */
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 20px;
}

/* ── 요약 카드 ── */
.summary-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 32px;
}

.summary-card {
    background: var(--white);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-icon {
    font-size: 28px;
}

.summary-label {
    margin: 0;
    font-size: 12px;
    color: var(--text-gray);
}

.summary-value {
    margin: 2px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
}

/* ── 섹션 ── */
.section {
    margin-bottom: 36px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 4px;
}

.section-desc {
    font-size: 13px;
    color: var(--text-gray);
    margin: 0 0 16px;
}

/* ── 참여자 카드 ── */
.participant-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.participant-card {
    background: var(--white);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
}

.participant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: var(--sky-blue);
}

.participant-card.rank-1 {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fffef0, var(--white));
}

.participant-card.rank-2 {
    border-color: #c0c0c0;
}

.participant-card.rank-3 {
    border-color: #cd7f32;
}

.rank-badge {
    font-size: 28px;
    min-width: 36px;
    text-align: center;
}

.rank-num {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-gray);
}

.avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: var(--white);
    flex-shrink: 0;
}

.card-info {
    flex: 1;
}

.participant-name {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.stat-label {
    font-size: 11px;
    color: var(--text-gray);
}

.stat-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
}

.teto-score.score-high {
    color: var(--crab-red);
}

.teto-score.score-mid {
    color: var(--crab-orange);
}

.teto-score.score-low {
    color: var(--ocean-blue);
}

.stat-bar {
    height: 4px;
    background: var(--sand);
    border-radius: 4px;
    overflow: hidden;
}

.stat-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
}

.card-arrow {
    font-size: 20px;
    color: var(--text-gray);
    flex-shrink: 0;
}

/* ── 차트 ── */
.chart-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.chart-tab {
    padding: 8px 16px;
    border: 2px solid var(--sand-dark);
    border-radius: 20px;
    background: var(--white);
    color: var(--text-dark);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.chart-tab.active {
    background: var(--ocean-blue);
    border-color: var(--ocean-blue);
    color: var(--white);
    font-weight: 600;
}

.chart-wrapper {
    background: var(--white);
    border-radius: 20px;
    padding: 24px;
    height: 280px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* ── 테토 분포 ── */
.teto-distribution {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.teto-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.teto-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    min-width: 60px;
}

.teto-bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
}

.teto-label-left,
.teto-label-right {
    font-size: 11px;
    color: var(--text-gray);
    white-space: nowrap;
}

.teto-full-bar {
    flex: 1;
    height: 20px;
    background: var(--sand);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.teto-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 1s ease;
}

.teto-score-label {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dark);
}

/* ── 로딩 ── */
.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
}

.loading-crab {
    font-size: 48px;
    animation: bounce 1s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-12px);
    }
}

/* ── 반응형 ── */
@media (max-width: 600px) {
    .summary-section {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .chart-wrapper {
        height: 220px;
    }
}
</style>
